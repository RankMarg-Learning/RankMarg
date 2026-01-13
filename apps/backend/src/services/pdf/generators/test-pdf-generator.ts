import { BasePDFGenerator } from "../base-pdf-generator";
import { TestPDFData, Question, TestSection, TestPaperLayout } from "../types";
import { LayoutRegistry, LayoutMetadata } from "../layout-registry";
import * as puppeteer from "puppeteer-core";

/**
 * PDF Generator for Test/Question Paper type
 * Supports multiple layouts via layout registry
 */
export class TestPDFGenerator extends BasePDFGenerator<TestPDFData> {
  private layoutRegistry: LayoutRegistry;
  private currentData?: TestPDFData;

  constructor() {
    super();
    this.layoutRegistry = new LayoutRegistry();
    this.registerLayouts();
  }

  /**
   * Register all available test paper layouts
   */
  private registerLayouts(): void {
    // Default layout (existing sample-2.hbs)
    this.layoutRegistry.register(TestPaperLayout.DEFAULT, {
      name: "Default Layout",
      templatePath: "question-paper/sample-2.hbs",
      description: "Standard two-column layout with MathJax support",
      isDefault: true,
    });

    // PCB layout for NEET/AIIMS
    this.layoutRegistry.register(TestPaperLayout.PCB, {
      name: "PCB Test Layout",
      templatePath: "question-paper/pcb-layout.hbs",
      description: "Physics-Chemistry-Biology focused layout for NEET/AIIMS",
      supportedExamTypes: ["NEET", "AIIMS", "NEET_UG"],
    });

    // JEE Advanced layout
    this.layoutRegistry.register(TestPaperLayout.JEE_ADVANCED, {
      name: "JEE Advanced Layout",
      templatePath: "question-paper/jee-advanced-layout.hbs",
      description: "JEE Advanced style with multi-part questions",
      supportedExamTypes: ["JEE_ADVANCED", "JEE_ADV"],
    });

    // NEET specific layout
    this.layoutRegistry.register(TestPaperLayout.NEET, {
      name: "NEET Layout",
      templatePath: "question-paper/neet-layout.hbs",
      description: "NEET specific layout with OMR-style formatting",
      supportedExamTypes: ["NEET"],
    });
  }

  /**
   * Determine which layout to use based on test data
   * Priority: explicit layoutType > exam type mapping > default
   */
  private determineLayout(data: TestPDFData): TestPaperLayout {
    // 1. Explicit layout type specified
    if (data.layoutType) {
      return data.layoutType;
    }

    // 2. Auto-detect based on exam code
    if (data.examCode) {
      const normalizedExamCode = data.examCode.toUpperCase();

      // Check each registered layout for exam type match
      if (normalizedExamCode.includes("NEET") || normalizedExamCode.includes("AIIMS")) {
        return TestPaperLayout.PCB;
      }

      if (normalizedExamCode.includes("JEE") && normalizedExamCode.includes("ADV")) {
        return TestPaperLayout.JEE_ADVANCED;
      }
    }

    // 3. Default layout
    return TestPaperLayout.DEFAULT;
  }

  protected getTemplatePath(layoutType?: string): string {
    // Use provided layout type or determine from current data
    const layout = layoutType
      ? (layoutType as TestPaperLayout)
      : this.determineLayout(this.currentData!);

    try {
      const metadata = this.layoutRegistry.getLayout(layout);
      return this.resolveTemplatePath(metadata.templatePath);
    } catch (error) {
      // Fallback to default if layout not found
      console.warn(`Layout ${layout} not found, using default`);
      const defaultMetadata = this.layoutRegistry.getDefaultLayout();
      return this.resolveTemplatePath(defaultMetadata.templatePath);
    }
  }

  protected transformData(data: TestPDFData): Record<string, any> {
    // Store current data for layout determination
    this.currentData = data;

    // Determine layout and store for context
    const layoutType = this.determineLayout(data);
    this.currentLayoutType = layoutType;

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

    // Merge layout config with defaults
    const layoutConfig = {
      showSubjectTags: false,
      showDifficultyLevel: false,
      showMarksPerQuestion: false,
      columnCount: 2,
      headerStyle: "detailed",
      ...data.layoutConfig,
    };

    // Return template data with defaults and layout config
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
      layoutConfig, // Pass layout config to template
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