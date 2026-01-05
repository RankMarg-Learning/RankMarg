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
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: false,
      breaks: false,
    });

    this.md.use(markdownItMark); 
    this.md.use(markdownItIns);  
    this.md.use(markdownItSub);  
    this.md.use(markdownItSup);  
  }

  
  protected renderMarkdown(content: string): string {
    if (!content) return '';
    
    let processedContent = content;
    if (processedContent.includes('\\n')) {
      processedContent = processedContent.replace(/\\n/g, '\n');
    }
    if (processedContent.includes('\\\\')) {
      processedContent = processedContent.replace(/\\\\/g, '\\');
    }
    if(processedContent.includes(';')) {
      processedContent = processedContent.replace(/;/g, '');
    }
    processedContent = processedContent.replace(/\*\*([^*]+)\*\*/g, '$1');

    processedContent = processedContent.replace(/\$\$([^$\n]+)\$\$/g, (_, expr) => `$${expr}$`);

    let rendered = this.md.render(processedContent);
    
    rendered = rendered.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1'); 
    rendered = rendered.replace(/<b[^>]*>(.*?)<\/b>/gi, '$1'); 

    return rendered;
  }

  
  protected resolveTemplatePath(relativePath: string): string {
    let projectRoot = process.cwd();
    
    if (projectRoot.endsWith('apps/backend') || projectRoot.endsWith('apps\\backend')) {
      projectRoot = path.join(projectRoot, '../..');
    }
    
    return path.join(projectRoot, "packages/pdf-templates", relativePath);
  }

  protected abstract getTemplatePath(): string;

  protected abstract transformData(data: TData): Record<string, any>;

  protected registerHandlebarsHelpers(): void {
    let globalQuestionCounter = 0;
    
    Handlebars.registerHelper("inc", function(value) {
      return parseInt(String(value), 10) + 1;
    });
    
    Handlebars.registerHelper("optLabel", function(i) {
      return String.fromCharCode(65 + Number(i));
    });
    
    Handlebars.registerHelper("markdown", (content: string) => {
      return new Handlebars.SafeString(this.renderMarkdown(content));
    });
    
    Handlebars.registerHelper("questionNumber", function() {
      globalQuestionCounter++;
      return globalQuestionCounter;
    });
  }

  protected generateHTML(data: TData): string {
    this.registerHandlebarsHelpers();

    const templateData = this.transformData(data);

    const templatePath = this.getTemplatePath();
    const templateSource = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(templateSource);

    return template(templateData);
  }

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

  //Deprecated function
  private async waitForMathJax1(page: puppeteer.Page): Promise<void> {
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

  //Deprecated function
  private async waitForMathJax(page: puppeteer.Page): Promise<void> {
    try {
      // Strategy: Use event-based detection instead of polling
      await page.evaluate(() => {
        return new Promise<void>((resolve) => {
          const w = (globalThis as any).window || globalThis;
          
          // Check if MathJax is already ready
          if (w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
            resolve();
            return;
          }
          
          // Listen for MathJax load event
          const checkInterval = setInterval(() => {
            if (w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
              clearInterval(checkInterval);
              resolve();
            }
          }, 50); // Check every 50ms instead of 500ms
          
          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve(); // Resolve anyway to continue
          }, 10000);
        });
      });
  
      // Now typeset with proper error handling
      const typesetResult = await Promise.race([
        page.evaluate(async () => {
          const MJ = (globalThis as any).MathJax;
          if (!MJ || typeof MJ.typesetPromise !== 'function') {
            return { success: false, reason: 'MathJax not available' };
          }
          
          try {
            // Wait for startup if needed
            if (MJ.startup?.promise) {
              await MJ.startup.promise;
            }
            
            // Typeset all math
            await MJ.typesetPromise();
            
            // Verify rendering completed by checking for rendered elements
            const mathElements = (globalThis as any).document.querySelectorAll('.MathJax, mjx-container');
            return { 
              success: true, 
              mathCount: mathElements.length 
            };
          } catch (error) {
            return { 
              success: false, 
              reason: error instanceof Error ? error.message : 'Unknown error' 
            };
          }
        }),
        new Promise<{ success: boolean; reason?: string }>((resolve) => 
          setTimeout(() => resolve({ success: false, reason: 'Timeout' }), 15000)
        )
      ]);
  
      if (!typesetResult.success) {
        console.warn(`MathJax rendering incomplete: ${typesetResult.reason}`);
      } else {
        console.log(`MathJax rendered ${(typesetResult as any).mathCount} math elements`);
      }
  
      // Small buffer for final layout stabilization
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.warn('MathJax initialization error, proceeding with PDF generation:', 
        error instanceof Error ? error.message : error);
    }
  }

  private async waitForMathJaxAlternative(page: puppeteer.Page): Promise<void> {
    try {
      // Wait for MathJax to be available (max 10s)
      await page.waitForFunction(
        () => {
          const w = (globalThis as any).window || globalThis;
          return w.MathJax && typeof w.MathJax.typesetPromise === 'function';
        },
        { timeout: 10000, polling: 100 } // Check every 100ms
      ).catch(() => {
        console.warn('MathJax not detected, continuing anyway');
      });
  
      // Typeset math
      await page.evaluate(async () => {
        const MJ = (globalThis as any).MathJax;
        if (MJ?.typesetPromise) {
          await MJ.startup?.promise;
          await MJ.typesetPromise();
        }
      }).catch((error) => {
        console.warn('MathJax typesetting failed:', error.message);
      });
  
      // Minimal stabilization wait
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.warn('MathJax error:', error instanceof Error ? error.message : error);
    }
  }
  
  

  protected getPDFOptions(data?: TData): puppeteer.PDFOptions {
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
        <div style="font-size:8px; width:100%; display:flex; justify-content:space-between; align-items:center; padding:0 20px;">
          <div style="text-align:left; flex:1;">
            <!-- Left footer text will be injected here -->
          </div>
          <div style="text-align:right; flex:1;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
        </div>
      `,
    };
  }

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
  
      await page.setViewport({ 
        width: 1240, 
        height: 1754, 
        deviceScaleFactor: 2 
      });
      
      page.setDefaultTimeout(60000);
  
      // Generate HTML
      console.log("Generating HTML...");
      const html = this.generateHTML(data);
      console.log("html", html);
  
      // Set content and wait for network idle (more reliable than 'load')
      await page.setContent(html, {
        waitUntil: ['load', 'networkidle0'], // Wait for network to be idle
        timeout: 60000,
      });
  
      // Wait for MathJax with optimized method
      await this.waitForMathJaxAlternative(page);
  
      // Generate PDF
      const pdfOptions = this.getPDFOptions(data);
      const pdf = await page.pdf(pdfOptions);
  
      return Buffer.from(pdf);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error(
        `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  //Deprecated function
  async generatePDFAlternative(data: TData): Promise<Buffer> {
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

      const html = this.generateHTML(data);

      await page.setContent(html, {
        waitUntil: "load",
        timeout: 60000,
      });

      await this.waitForMathJaxAlternative(page);

      await new Promise(resolve => setTimeout(resolve, 500));

      const pdfOptions = this.getPDFOptions(data);
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