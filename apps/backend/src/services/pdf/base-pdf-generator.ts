import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import * as puppeteer from "puppeteer-core";
import MarkdownIt from "markdown-it";
import markdownItMark from "markdown-it-mark";
import markdownItIns from "markdown-it-ins";
import markdownItSub from "markdown-it-sub";
import markdownItSup from "markdown-it-sup";

/**
 * Base abstract class for PDF generators
 * Provides common functionality like browser management, MathJax rendering, and markdown processing
 */
export abstract class BasePDFGenerator<TData = any> {
  protected md: MarkdownIt;

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
  }

  /**
   * Render markdown content to HTML with math support
   */
  protected renderMarkdown(content: string): string {
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
    processedContent = processedContent.replace(/\$\$([^$\n]+)\$\$/g, (match, mathContent) => {
      if (!mathContent.includes('\n')) {
        return `$${mathContent}$`;
      }
      return match;
    });

    return this.md.render(processedContent);
  }

  /**
   * Get the template path for this PDF type
   * Must be implemented by subclasses
   */
  protected abstract getTemplatePath(): string;

  /**
   * Transform input data to template data format
   * Must be implemented by subclasses
   */
  protected abstract transformData(data: TData): Record<string, any>;

  /**
   * Register custom Handlebars helpers
   * Override this in subclasses to add custom helpers
   */
  protected registerHandlebarsHelpers(): void {
    // Register common helpers
    Handlebars.registerHelper("inc", function(value) {
      return parseInt(String(value), 10) + 1;
    });
    
    Handlebars.registerHelper("optLabel", function(i) {
      return String.fromCharCode(65 + Number(i));
    });
    
    // Register markdown helper
    Handlebars.registerHelper("markdown", (content: string) => {
      return new Handlebars.SafeString(this.renderMarkdown(content));
    });
  }

  /**
   * Generate HTML from template and data
   */
  protected generateHTML(data: TData): string {
    // Register helpers
    this.registerHandlebarsHelpers();

    // Transform data
    const templateData = this.transformData(data);

    // Load and compile template
    const templatePath = this.getTemplatePath();
    const templateSource = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(templateSource);

    // Generate HTML
    return template(templateData);
  }

  /**
   * Get Chrome/Chromium executable path
   */
  private getExecutablePath(): string | undefined {
    if (process.env.CHROME_PATH) {
      return process.env.CHROME_PATH;
    }
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      return process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    const platform = process.platform;
    if (platform === "linux") {
      return "/usr/bin/google-chrome";
    } else if (platform === "darwin") {
      return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    } else if (platform === "win32") {
      return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    }

    return undefined;
  }

  /**
   * Wait for MathJax to load and render
   */
  private async waitForMathJax(page: puppeteer.Page): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      let mathJaxReady = false;
      let attempts = 0;
      const maxAttempts = 40;
      
      while (!mathJaxReady && attempts < maxAttempts) {
        try {
          const result = await Promise.race([
            page.evaluate(() => {
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
          if (error instanceof Error && 
              (error.message.includes('detached') || 
               error.message.includes('Target closed') ||
               error.message.includes('Session closed'))) {
            console.warn('Page frame detached during MathJax wait');
            break;
          }
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (!mathJaxReady) {
        console.warn('MathJax not fully loaded, proceeding with PDF generation');
        return;
      }

      // Wait for MathJax typesetting
      try {
        await Promise.race([
          page.evaluate(async () => {
            const MJ = (globalThis as any).MathJax;
            if (!MJ) return;
            
            try {
              if (MJ.startup && MJ.startup.promise) {
                await MJ.startup.promise;
              }
              
              await new Promise(resolve => setTimeout(resolve, 100));
              
              if (typeof MJ.typesetPromise === 'function') {
                await MJ.typesetPromise();
              }
              
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
        if (error instanceof Error && 
            (error.message.includes('detached') || 
             error.message.includes('Target closed') ||
             error.message.includes('Session closed') ||
             error.message.includes('timeout'))) {
          console.warn('MathJax typesetting interrupted');
        } else {
          console.error('MathJax typesetting error:', error);
        }
      }
    } catch (error) {
      if (error instanceof Error && 
          (error.message.includes('detached') || 
           error.message.includes('Target closed') ||
           error.message.includes('Session closed'))) {
        console.warn('Frame detached during MathJax wait');
      } else if (error instanceof Error) {
        console.warn('Error waiting for MathJax:', error.message);
      }
    }
  }

  /**
   * Get PDF options
   * Override this to customize PDF generation options
   */
  protected getPDFOptions(): puppeteer.PDFOptions {
    return {
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      margin: {
        top: "40px",
        bottom: "40px",
        left: "10mm",
        right: "10mm",
      },
      headerTemplate: `
        <div style="font-size:8px; width:100%; text-align:center;">
          <!-- Header content -->
        </div>
      `,
      footerTemplate: `
        <div style="font-size:8px; width:100%; text-align:center; margin:0 auto;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
    };
  }

  /**
   * Generate PDF from data
   */
  async generatePDF(data: TData): Promise<Buffer> {
    let browser;
    try {
      const executablePath = this.getExecutablePath();

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

      if (executablePath) {
        launchOptions.executablePath = executablePath;
      }

      browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();

      await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
      page.setDefaultTimeout(60000);

      // Generate HTML
      const html = this.generateHTML(data);

      await page.setContent(html, {
        waitUntil: "load",
        timeout: 60000,
      });

      // Wait for MathJax
      await this.waitForMathJax(page);

      // Final wait for rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate PDF
      const pdfOptions = this.getPDFOptions();
      const pdf = await page.pdf(pdfOptions);

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
}