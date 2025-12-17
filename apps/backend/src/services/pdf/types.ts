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
 * DPP Question interface
 */
export interface DPPQuestion {
  questionNumber: number | string;
  content: string;
  primaryOptions?: Record<string, string>; // e.g., { "a": "Option A", "b": "Option B", ... }
  secondaryOptions?: Record<string, string>; // e.g., { "1": "a, b", "2": "b, c", ... }
  options?: Array<{ // Fallback for simple option format
    id: string;
    content: string;
    isCorrect?: boolean;
  }>;
}

/**
 * DPP PDF Data interface
 */
export interface DPPPDFData extends BasePDFData {
  dppId: string;
  title: string;
  collegeName?: string;
  subject?: string;
  class?: string;
  classInfo?: string; // e.g., "XII-AIIMS"
  date?: string;
  teacherName?: string;
  leftLogo?: string;
  rightLogo?: string;
  watermarkText?: string;
  questions: DPPQuestion[];
  answerKey?: Record<number | string, number | string>; // e.g., { 1: "2", 2: "4", ... }
  answerKeyArray?: Array<{ // Alternative format for answer key
    questionNumber: number | string;
    answer: number | string;
  }>;
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