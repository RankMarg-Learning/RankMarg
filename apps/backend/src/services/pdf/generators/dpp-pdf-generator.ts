import path from "path";
import { BasePDFGenerator } from "../base-pdf-generator";
import { DPPPDFData } from "../types";

/**
 * PDF Generator for DPP (Daily Practice Paper) type
 * TODO: Implement when DPP feature is ready
 */
export class DPPPDFGenerator extends BasePDFGenerator<DPPPDFData> {
  protected getTemplatePath(): string {
    // TODO: Update this path when DPP template is created
    return path.join(
      __dirname,
      "../../../../../../packages/pdf-templates/dpp/template.hbs"
    );
  }

  protected transformData(data: DPPPDFData): Record<string, any> {
    // TODO: Implement DPP-specific data transformation
    return {
      dppId: data.dppId,
      title: data.title,
      ...data,
    };
  }
}