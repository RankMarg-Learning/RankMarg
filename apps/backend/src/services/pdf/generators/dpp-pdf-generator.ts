import { BasePDFGenerator } from "../base-pdf-generator";
import { DPPPDFData } from "../types";

/**
 * PDF Generator for DPP (Daily Practice Paper) type
 * TODO: Implement when DPP feature is ready
 */
export class DPPPDFGenerator extends BasePDFGenerator<DPPPDFData> {
  protected getTemplatePath(): string {
    return this.resolveTemplatePath("question-paper/sample-3.hbs");
  }

  protected transformData(data: DPPPDFData): Record<string, any> {
    // Process markdown in all questions and options
    const processedData: DPPPDFData = {
      ...data,
      questions: data.questions?.map((q: any) => {
        const processedQuestion: any = {
          ...q,
          content: this.renderMarkdown(q.content || ''),
        };

        // Process primary options (a, b, c, d)
        if (q.primaryOptions) {
          processedQuestion.primaryOptions = {};
          Object.keys(q.primaryOptions).forEach((key) => {
            processedQuestion.primaryOptions[key] = this.renderMarkdown(q.primaryOptions[key]);
          });
        }

        // Process secondary options (1, 2, 3, 4)
        if (q.secondaryOptions) {
          processedQuestion.secondaryOptions = {};
          Object.keys(q.secondaryOptions).forEach((key) => {
            processedQuestion.secondaryOptions[key] = this.renderMarkdown(q.secondaryOptions[key]);
          });
        }

        // Process simple options array (backward compatibility)
        if (q.options) {
          processedQuestion.options = q.options.map((opt: any) => ({
            ...opt,
            content: this.renderMarkdown(opt.content || ''),
          }));
        }

        return processedQuestion;
      }) || [],
    };

    // Return template data with defaults
    return {
      dppId: processedData.dppId || "DPP-001",
      title: processedData.title || "Daily Practice Problem",
      collegeName: processedData.collegeName || "",
      subject: processedData.subject || "",
      class: processedData.class || "",
      classInfo: processedData.classInfo || "",
      date: processedData.date || "",
      teacherName: processedData.teacherName || "",
      leftLogo: processedData.leftLogo,
      rightLogo: processedData.rightLogo,
      watermarkText: processedData.watermarkText,
      questions: processedData.questions,
      answerKey: processedData.answerKey,
      answerKeyArray: processedData.answerKeyArray,
    };
  }
}