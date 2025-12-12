/**
 * PDF Type definitions and interfaces
 */

export enum PDFType {
  TEST = "test",
  DPP = "dpp",
  TEST_ANALYSIS = "test_analysis",
}

/**
 * Base interface for all PDF data
 */
export interface BasePDFData {
  [key: string]: any;
}

/**
 * Question interface
 */
export interface Question {
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

/**
 * Test Section interface
 */
export interface TestSection {
  name: string;
  testQuestion: Array<{
    question: Question;
  }>;
}

/**
 * Test PDF Data interface
 */
export interface TestPDFData extends BasePDFData {
  testId: string;
  title: string;
  description?: string;
  examCode?: string;
  testSection: TestSection[];
  testCategory?: string;
  testDate?: string;
  duration?: string;
  customFooter?: string;
  watermarkText?: string;
}

/**
 * DPP PDF Data interface
 * (To be extended when DPP is implemented)
 */
export interface DPPPDFData extends BasePDFData {
  dppId: string;
  title: string;
  // Add DPP-specific fields here
}

/**
 * Test Analysis PDF Data interface
 * (To be extended when Test Analysis is implemented)
 */
export interface TestAnalysisPDFData extends BasePDFData {
  analysisId: string;
  title: string;
  // Add analysis-specific fields here
}