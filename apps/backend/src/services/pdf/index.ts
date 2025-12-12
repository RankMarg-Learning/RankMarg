/**
 * PDF Service - Centralized exports
 */

export { PDFService, PDFServiceCompat } from "./pdf.service";
export { BasePDFGenerator } from "./base-pdf-generator";
export { PDFType } from "./types";
export type {
  BasePDFData,
  TestPDFData,
  DPPPDFData,
  TestAnalysisPDFData,
  Question,
  TestSection,
} from "./types";

// Export generators for advanced usage
export { TestPDFGenerator } from "./generators/test-pdf-generator";
export { DPPPDFGenerator } from "./generators/dpp-pdf-generator";
export { TestAnalysisPDFGenerator } from "./generators/test-analysis-pdf-generator";