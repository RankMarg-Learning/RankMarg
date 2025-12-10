import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import * as puppeteer from "puppeteer-core";
import { Readable } from "stream";

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
  /**
   * Generate HTML template for question paper
   */
  private generateHTMLTemplate(testData: TestData): string {
    // Get all questions from all sections
    const allQuestions: Question[] = [];
    testData.testSection.forEach((section) => {
      section.testQuestion.forEach((tq) => {
        allQuestions.push(tq.question);
      });
    });
    

    const paperData = {
      testId: "TEST-001",
      title: "SAMPLE PAPER-01",
      description: "Mental Ability Test",
      examCode: "MAT",
      testCategory: "MENTAL ABILITY TEST",
      testDate: "10-Dec-2025",
      duration: "90 Minutes",
      customFooter: "Rankmarg – Personalized Practice & Test Analytics",
      testSection: testData.testSection
    }

    Handlebars.registerHelper("inc", function(value) {
      return parseInt(value) + 1;
    });
    Handlebars.registerHelper("optLabel", function(i) {
      return String.fromCharCode(65 + i);
    });
    const templatePath = path.join(__dirname, '../../../../packages/pdf-templates/question-paper/sample-2.hbs');

    const templateSource = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(templateSource);

    const html = template(paperData);



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

      // Generate HTML
      const html = this.generateHTMLTemplate(testData);

      // Set content
      await page.setContent(html, {
        waitUntil: "networkidle0",
      });

      const pdf = await page.pdf({
        path: "paper.pdf",
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

