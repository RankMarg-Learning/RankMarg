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

    // Split questions: left column gets all questions first, then right column
    // This ensures left column fills completely before right column starts
    const leftColumnQuestions = allQuestions;
    const rightColumnQuestions: Question[] = []; // Right column will be empty initially

    // Get subject name from first question (if available)
    const firstSubject = allQuestions.length > 0 && allQuestions[0]?.subject?.name 
      ? allQuestions[0].subject.name 
      : "Subject";
    
    // Get exam type from examCode
    const examType = testData.examCode || "EXAM";
    const testCode = testData.testId.substring(0, 8).toUpperCase();

    const leftColumnHTML = leftColumnQuestions
      .map((question, index) => {
        const questionNumber = index + 1;
        const optionsHTML = question.options
          .map((option, optIndex) => {
            const optionNumber = optIndex + 1;
            return `<div>(${optionNumber}) <span class="ml-2">${this.escapeHtml(option.content)}</span></div>`;
          })
          .join("\n                  ");

        return `
            <div class="question-item flex gap-3 mb-6 break-inside-avoid">
              <span class="font-semibold text-sm">${questionNumber}.</span>
              <div class="flex-1">
                <p class="text-sm mb-3 leading-relaxed">
                  ${this.escapeHtml(question.content)}
                </p>
                <div class="space-y-1.5 text-sm">
                  ${optionsHTML}
                </div>
              </div>
            </div>`;
      })
      .join("\n            ");

    const rightColumnHTML = rightColumnQuestions
      .map((question, index) => {
        const questionNumber = leftColumnQuestions.length + index + 1;
        const optionsHTML = question.options
          .map((option, optIndex) => {
            const optionNumber = optIndex + 1;
            return `<div>(${optionNumber}) <span class="ml-2">${this.escapeHtml(option.content)}</span></div>`;
          })
          .join("\n                  ");

        return `
            <div class="question-item flex gap-3 mb-6 break-inside-avoid">
              <span class="font-semibold text-sm">${questionNumber}.</span>
              <div class="flex-1">
                <p class="text-sm mb-3 leading-relaxed">
                  ${this.escapeHtml(question.content)}
                </p>
                <div class="space-y-1.5 text-sm">
                  ${optionsHTML}
                </div>
              </div>
            </div>`;
      })
      .join("\n            ");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${testData.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
      .page-break { page-break-after: always; }
      .column-break { break-after: column; }
    }
    body {
      font-family: 'Arial', sans-serif;
    }
    .question-item {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .left-column {
      column-fill: auto;
    }
    .right-column {
      column-fill: auto;
    }
  </style>
</head>
<body>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-5xl mx-auto bg-white shadow-lg">
      <!-- Header Section -->
      <div class="bg-white p-6 border-b-2 border-gray-200">
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center">
              <span class="text-2xl font-bold">A</span>
            </div>
            <div>
              <h1 class="text-3xl font-bold">Aakash</h1>
              <p class="text-xs text-gray-600">Medical|IIT-JEE|Foundations</p>
              <p class="text-xs text-gray-500 italic">The Most Trusted Brand</p>
            </div>
          </div>
          <div class="border-2 border-black px-4 py-2 text-center">
            <p class="text-sm font-bold">${testCode}</p>
            <p class="text-xs font-semibold">${examType}</p>
            <p class="text-xs font-semibold">TEST</p>
          </div>
        </div>
        
        <div class="text-center">
          <h2 class="text-2xl font-bold mb-1">${this.escapeHtml(testData.title)}</h2>
          <p class="text-sm text-gray-700">${testData.description || "Question Paper"}</p>
        </div>
      </div>

      <!-- Chapter/Subject Title -->
      ${testData.testSection.length > 0 ? `
      <div class="bg-gray-300 py-2 px-6">
        <p class="text-center font-semibold text-gray-800">${testData.testSection.map(s => s.name).join(" | ")}</p>
      </div>
      ` : ""}

      <!-- Two Column Layout with proper page breaks -->
      <div class="grid grid-cols-2 gap-0 divide-x-2 divide-gray-200" style="height: calc(100vh - 200px);">
        <!-- Left Column - fills first, then breaks to next page -->
        <div class="left-column p-6" style="overflow: hidden;">
          ${leftColumnHTML}
        </div>

        <!-- Right Column - starts after left column is complete -->
        <div class="right-column p-6" style="overflow: hidden;">
          ${rightColumnHTML || '<div class="text-gray-400 text-sm text-center mt-4">No questions in right column</div>'}
        </div>
      </div>

      <!-- Footer Page Number -->
      <div class="bg-gray-300 py-2 text-center border-t-2 border-gray-200">
        <span class="font-bold text-sm">(1)</span>
      </div>
    </div>
  </div>
</body>
</html>`;

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

      // Generate PDF
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "0.5cm",
          right: "0.5cm",
          bottom: "0.5cm",
          left: "0.5cm",
        },
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

