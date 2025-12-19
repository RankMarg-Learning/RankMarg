import { BasePDFGenerator } from "../base-pdf-generator";
import { TestAnalysisPDFData } from "../types";

/**
 * PDF Generator for Test Analysis type
 * TODO: Implement when Test Analysis feature is ready
 */
export class TestAnalysisPDFGenerator extends BasePDFGenerator<TestAnalysisPDFData> {
  protected getTemplatePath(): string {
    return this.resolveTemplatePath("test-analysis/template.hbs");
  }

  protected transformData(data: TestAnalysisPDFData): Record<string, any> {
    // TODO: Implement Test Analysis-specific data transformation
    return {
      analysisId: data.analysisId,
      title: data.title,
      ...data,
    };
  }
}