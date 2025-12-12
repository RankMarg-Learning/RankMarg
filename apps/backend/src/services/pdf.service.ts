import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import * as puppeteer from "puppeteer-core";
import { Readable } from "stream";
import MarkdownIt from "markdown-it";
import markdownItMark from "markdown-it-mark";
import markdownItIns from "markdown-it-ins";
import markdownItSub from "markdown-it-sub";
import markdownItSup from "markdown-it-sup";

interface Question {
  id: string;
  title: string;
  content: string;
  options: Array<{
    id: string;
    content: string;
    isCorrect: boolean;
  }>;
  subject?: {
    name: string;
    shortName?: string;
  };
  topic?: {
    name: string;
  };
}

interface TestSection {
  name: string;
  testQuestion: Array<{
    question: Question;
  }>;
}

interface TestData {
  testId: string;
  title: string;
  description?: string;
  examCode?: string;
  testSection: TestSection[];
}

export class PDFService {
  private md: MarkdownIt;

  constructor() {
    // Initialize markdown-it with plugins similar to the frontend
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      breaks: false,
    });

    // Add GFM-like features
    this.md.use(markdownItMark); // ==marked text==
    this.md.use(markdownItIns);  // ++inserted text++
    this.md.use(markdownItSub);  // H~2~O
    this.md.use(markdownItSup);  // x^2^

    // Math support is handled by MathJax in the template
    // MathJax will process $...$ and $$...$$ delimiters after the HTML is rendered
  }

  /**
   * Render markdown content to HTML with math support
   * This mimics the behavior of the frontend MarkdownRenderer component
   * 
   * Features:
   * - Markdown rendering with GFM (GitHub Flavored Markdown) support
   * - Math rendering using MathJax (inline: $...$ and display: $$...$$)
   * - HTML passthrough for complex formatting
   * - Handles escaped characters (\n, \\)
   * 
   * Examples:
   * - Inline math: "The formula is $E = mc^2$"
   * - Display math: "$$\sum_{i=1}^{n} x_i$$"
   * - Bold text: "**bold text**"
   * - Code: "`inline code`"
   * 
   * Note: Math equations are preserved as-is in the HTML and will be 
   * rendered by MathJax when the HTML is loaded in the browser/PDF
   */
  private renderMarkdown(content: string): string {
    if (!content) return '';
    
    // Process escaped characters similar to frontend
    let processedContent = content;
    if (processedContent.includes('\\n')) {
      processedContent = processedContent.replace(/\\n/g, '\n');
    }
    if (processedContent.includes('\\\\')) {
      processedContent = processedContent.replace(/\\\\/g, '\\');
    }

    // Convert single-line $$...$$ to $...$ for inline math
    // This regex matches $$...$$ that appears on a single line (not spanning multiple lines)
    processedContent = processedContent.replace(/\$\$([^$\n]+)\$\$/g, (match, mathContent) => {
      // If the match doesn't contain newlines, treat it as inline math
      if (!mathContent.includes('\n')) {
        return `$${mathContent}$`;
      }
      // Otherwise keep it as display math
      return match;
    });

    // Render markdown to HTML
    const html = this.md.render(processedContent);
    
    return html;
  }

  /**
   * Generate HTML template for question paper
   */
  private generateHTMLTemplate(testData: TestData): string {
    // Process markdown in all questions and options
    const processedTestData = {
      ...testData,
      testSection: testData.testSection.map(section => ({
        ...section,
        testQuestion: section.testQuestion.map(tq => ({
          ...tq,
          question: {
            ...tq.question,
            content: this.renderMarkdown(tq.question.content),
            options: tq.question.options.map(opt => ({
              ...opt,
              content: this.renderMarkdown(opt.content)
            }))
          }
        }))
      }))
    };

    const paperData = {
      testId: "TEST-001",
      title: "SAMPLE PAPER-01",
      description: "Mental Ability Test",
      examCode: "MAT",
      testCategory: "MENTAL ABILITY TEST",
      testDate: "10-Dec-2025",
      duration: "90 Minutes",
      customFooter: "Rankmarg – Personalized Practice & Test Analytics",
      testSection: processedTestData.testSection
    }

    Handlebars.registerHelper("inc", function(value) {
      return parseInt(value) + 1;
    });
    Handlebars.registerHelper("optLabel", function(i) {
      return String.fromCharCode(65 + i);
    });
    
    // Register markdown helper to render markdown with math support
    Handlebars.registerHelper("markdown", (content: string) => {
      return new Handlebars.SafeString(this.renderMarkdown(content));
    });
    const templatePath = path.join(__dirname, '../../../../packages/pdf-templates/question-paper/sample-2.hbs');

    const templateSource = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(templateSource);

    let html = template(paperData);

    // MathJax is loaded via CDN in the template, no need to inject CSS
    // The template already includes MathJax configuration and script

    return html;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Get Chrome/Chromium executable path
   */
  private getExecutablePath(): string | undefined {
    // Check for environment variable first
    if (process.env.CHROME_PATH) {
      return process.env.CHROME_PATH;
    }
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      return process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    // Common system paths for Chrome/Chromium
    const platform = process.platform;
    if (platform === "linux") {
      // Try common Linux paths
      return "/usr/bin/google-chrome";
    } else if (platform === "darwin") {
      // macOS path
      return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    } else if (platform === "win32") {
      // Windows path
      return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    }

    return undefined;
  }

  /**
   * Generate PDF from test data
   */
  async generatePDF(testData: TestData): Promise<Buffer> {
    let browser;
    try {
      const executablePath = this.getExecutablePath();

      // Launch browser with puppeteer-core
      const launchOptions: Parameters<typeof puppeteer.launch>[0] = {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
        ],
      };

      // Only set executablePath if we found one
      if (executablePath) {
        launchOptions.executablePath = executablePath;
      }

      browser = await puppeteer.launch(launchOptions);

      const page = await browser.newPage();

      // Set viewport with deviceScaleFactor for sharp math rendering
      await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });

      // Set longer timeout for page operations
      page.setDefaultTimeout(60000); // 60 seconds

      // Generate HTML
      const html = this.generateHTMLTemplate(testData);

      // Set content with less strict wait condition (load instead of networkidle0)
      await page.setContent(html, {
        waitUntil: "load",
        timeout: 60000,
      });

      // Wait for MathJax to load and render using a robust approach that handles frame detachment
      try {
        // Give the page time to load MathJax script
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Wait for MathJax object to be available with retry logic
        let mathJaxReady = false;
        let attempts = 0;
        const maxAttempts = 40;
        
        while (!mathJaxReady && attempts < maxAttempts) {
          try {
            const result = await Promise.race([
              page.evaluate(() => {
                // @ts-ignore - window exists in browser context
                const w = (globalThis as any).window || globalThis;
                return w && 
                       w.MathJax && 
                       typeof w.MathJax.typesetPromise === "function";
              }),
              new Promise<boolean>((_, reject) => 
                setTimeout(() => reject(new Error('evaluate timeout')), 1000)
              )
            ]) as boolean;
            
            mathJaxReady = result;
            
            if (!mathJaxReady) {
              await new Promise(resolve => setTimeout(resolve, 500));
              attempts++;
            }
          } catch (error) {
            // If page is detached, log and continue
            if (error instanceof Error && 
                (error.message.includes('detached') || 
                 error.message.includes('Target closed') ||
                 error.message.includes('Session closed'))) {
              console.warn('Page frame detached, proceeding with PDF generation');
              break;
            }
            // For other errors, continue retrying
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        if (!mathJaxReady) {
          console.warn('MathJax not fully loaded after attempts, proceeding with PDF generation');
        } else {
          // Wait for MathJax startup to complete, then typeset all math
          try {
            await Promise.race([
              page.evaluate(async () => {
                // @ts-ignore - MathJax is available in browser context
                const MJ = (globalThis as any).MathJax;
                
                if (!MJ) return;
                
                try {
                  // Wait for startup to complete if promise exists
                  // @ts-ignore
                  if (MJ.startup && MJ.startup.promise) {
                    // @ts-ignore
                    await MJ.startup.promise;
                  }
                  
                  // Small delay to ensure initialization is complete
                  await new Promise(resolve => setTimeout(resolve, 100));
                  
                  // Now typeset the document
                  // @ts-ignore
                  if (typeof MJ.typesetPromise === 'function') {
                    // @ts-ignore
                    await MJ.typesetPromise();
                  }
                  
                  // Additional delay to ensure rendering completes
                  await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                  console.error('MathJax typesetting error:', error);
                }
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('typeset timeout')), 30000)
              )
            ]);
          } catch (error) {
            // If typesetting fails (including frame detachment), log and continue
            if (error instanceof Error && 
                (error.message.includes('detached') || 
                 error.message.includes('Target closed') ||
                 error.message.includes('Session closed') ||
                 error.message.includes('timeout'))) {
              console.warn('MathJax typesetting interrupted, proceeding with PDF generation');
            } else {
              console.error('MathJax typesetting error:', error);
            }
          }
        }
      } catch (error) {
        // If we get any error during MathJax loading, log it but continue
        if (error instanceof Error && 
            (error.message.includes('detached') || 
             error.message.includes('Target closed') ||
             error.message.includes('Session closed'))) {
          console.warn('Frame detached during MathJax wait, proceeding with PDF generation');
        } else if (error instanceof Error) {
          console.warn('Error waiting for MathJax:', error.message, '- proceeding anyway');
        }
      }

      // Final wait to ensure all rendering and layout is complete
      await new Promise(resolve => setTimeout(resolve, 500));

      const pdf = await page.pdf({
        
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        margin: {
          top: "40px",
          bottom: "40px", // must be big enough to show footer
          left: "10mm",
          right: "10mm",
        },
        headerTemplate: `
          <div style="font-size:8px; width:100%; text-align:center;">
            <!-- keep empty or put exam name / code if you want -->
          </div>
        `,
        footerTemplate: `
          <div style="font-size:8px; width:100%; text-align:center; margin:0 auto;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
        `,
      });
      

      return Buffer.from(pdf);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate PDF and return as stream
   */
  async generatePDFStream(testData: TestData): Promise<Readable> {
    const buffer = await this.generatePDF(testData);
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
}

