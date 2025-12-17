import path from "path";
import { BasePDFGenerator } from "../base-pdf-generator";
import { TestPDFData, Question, TestSection } from "../types";

/**
 * PDF Generator for Test/Question Paper type
 */
export class TestPDFGenerator extends BasePDFGenerator<TestPDFData> {
  protected getTemplatePath(): string {
    // Path from compiled dist/services/pdf/generators/ to packages/pdf-templates/
    return path.join(
      __dirname,
      "../../../../../../packages/pdf-templates/question-paper/sample-2.hbs"
    );
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
}