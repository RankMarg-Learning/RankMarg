import { BasePDFGenerator } from "../base-pdf-generator";
import { TestPDFData, Question, TestSection } from "../types";
import * as puppeteer from "puppeteer-core";

/**
 * PDF Generator for Test/Question Paper type
 */
export class TestPDFGenerator extends BasePDFGenerator<TestPDFData> {
  protected getTemplatePath(): string {
    return this.resolveTemplatePath("question-paper/sample-2.hbs");
  }

  protected transformData(data: TestPDFData): Record<string, any> {
    // Process markdown in all questions and options
    const processedTestData: TestPDFData = {
      ...data,
      testSection: data.testSection.map((section) => ({
        ...section,
        testQuestion: section.testQuestion.map((tq) => ({
          ...tq,
          question: {
            ...tq.question,
            content: this.renderMarkdown(tq.question.content),
            options: tq.question.options.map((opt) => ({
              ...opt,
              content: this.renderMarkdown(opt.content),
            })),
          },
        })),
      })),
    };

    // Return template data with defaults
    return {
      testId: processedTestData.testId || "TEST-001",
      title: processedTestData.title || "SAMPLE PAPER-01",
      description: processedTestData.description || "Mental Ability Test",
      examCode: processedTestData.examCode || "MAT",
      testCategory: processedTestData.testCategory || "MENTAL ABILITY TEST",
      testDate: processedTestData.testDate || "10-Dec-2025",
      duration: processedTestData.duration || "90 Minutes",
      customFooter:
        processedTestData.customFooter ||
        "Rankmarg – Personalized Practice & Test Analytics",
      watermarkText: processedTestData.watermarkText,
      testSection: processedTestData.testSection,
    };
  }

  /**
   * Override getPDFOptions to include customFooter in footer template
   */
  protected getPDFOptions(data?: TestPDFData): puppeteer.PDFOptions {
    const baseOptions = super.getPDFOptions(data);
    const customFooter = data?.customFooter || "Rankmarg – Personalized Practice & Test Analytics";
    
    return {
      ...baseOptions,
      footerTemplate: `
        <div style="font-size:8px; width:100%; display:flex; justify-content:space-between; align-items:center; padding:0 20px;">
          <div style="text-align:left; flex:1;">
            ${customFooter}
          </div>
          <div style="text-align:right; flex:1;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
        </div>
      `,
    };
  }
}