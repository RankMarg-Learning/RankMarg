import { Readable } from "stream";
import { PDFType, TestPDFData, DPPPDFData, TestAnalysisPDFData, BasePDFData } from "./types";
import { TestPDFGenerator } from "./generators/test-pdf-generator";
import { DPPPDFGenerator } from "./generators/dpp-pdf-generator";
import { TestAnalysisPDFGenerator } from "./generators/test-analysis-pdf-generator";
import { BasePDFGenerator } from "./base-pdf-generator";

/**
 * Factory service for PDF generation
 * Routes to the appropriate PDF generator based on type
 */
export class PDFService {
  private generators: Map<PDFType, BasePDFGenerator<BasePDFData>>;

  constructor() {
    this.generators = new Map();
    
    // Register generators
    this.generators.set(PDFType.TEST, new TestPDFGenerator());
    this.generators.set(PDFType.DPP, new DPPPDFGenerator());
    this.generators.set(PDFType.TEST_ANALYSIS, new TestAnalysisPDFGenerator());
  }

  /**
   * Get the appropriate generator for a PDF type
   */
  private getGenerator(type: PDFType): BasePDFGenerator<BasePDFData> {
    const generator = this.generators.get(type);
    if (!generator) {
      throw new Error(`No PDF generator found for type: ${type}`);
    }
    return generator;
  }

  /**
   * Generate PDF for Test type
   */
  async generateTestPDF(data: TestPDFData): Promise<Buffer> {
    const generator = this.getGenerator(PDFType.TEST) as BasePDFGenerator<TestPDFData>;
    return generator.generatePDF(data);
  }

  /**
   * Generate PDF for DPP type
   */
  async generateDPPPDF(data: DPPPDFData): Promise<Buffer> {
    const generator = this.getGenerator(PDFType.DPP) as BasePDFGenerator<DPPPDFData>;
    return generator.generatePDF(data);
  }

  /**
   * Generate PDF for Test Analysis type
   */
  async generateTestAnalysisPDF(data: TestAnalysisPDFData): Promise<Buffer> {
    const generator = this.getGenerator(PDFType.TEST_ANALYSIS) as BasePDFGenerator<TestAnalysisPDFData>;
    return generator.generatePDF(data);
  }

  /**
   * Generic method to generate PDF by type
   */
  async generatePDF(type: PDFType, data: BasePDFData): Promise<Buffer> {
    const generator = this.getGenerator(type);
    return generator.generatePDF(data);
  }

  /**
   * Generate PDF stream for Test type
   */
  async generateTestPDFStream(data: TestPDFData): Promise<Readable> {
    const buffer = await this.generateTestPDF(data);
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  /**
   * Generate PDF stream for DPP type
   */
  async generateDPPPDFStream(data: DPPPDFData): Promise<Readable> {
    const buffer = await this.generateDPPPDF(data);
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  /**
   * Generate PDF stream for Test Analysis type
   */
  async generateTestAnalysisPDFStream(data: TestAnalysisPDFData): Promise<Readable> {
    const buffer = await this.generateTestAnalysisPDF(data);
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  /**
   * Generic method to generate PDF stream by type
   */
  async generatePDFStream(type: PDFType, data: BasePDFData): Promise<Readable> {
    const buffer = await this.generatePDF(type, data);
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  /**
   * Register a custom generator for a PDF type
   * Useful for extending the service with new types
   */
  registerGenerator(type: PDFType, generator: BasePDFGenerator<BasePDFData>): void {
    this.generators.set(type, generator);
  }
}

/**
 * Export convenience methods for backward compatibility
 * This maintains the existing API while using the new architecture
 */
export class PDFServiceCompat {
  private service: PDFService;

  constructor() {
    this.service = new PDFService();
  }

  /**
   * Generate PDF from test data (backward compatible)
   * @deprecated Use PDFService.generateTestPDF instead
   */
  async generatePDF(testData: TestPDFData): Promise<Buffer> {
    return this.service.generateTestPDF(testData);
  }

  /**
   * Generate PDF stream from test data (backward compatible)
   * @deprecated Use PDFService.generateTestPDFStream instead
   */
  async generatePDFStream(testData: TestPDFData): Promise<Readable> {
    return this.service.generateTestPDFStream(testData);
  }
}