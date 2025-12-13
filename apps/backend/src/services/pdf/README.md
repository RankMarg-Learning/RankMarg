# PDF Service Architecture

## Overview

This is a generalized, extensible PDF generation service that supports multiple PDF types (Test, DPP, Test Analysis, etc.) through a plugin-based architecture.

## Architecture

### Core Components

1. **BasePDFGenerator** (`base-pdf-generator.ts`)
   - Abstract base class with common functionality
   - Handles browser management, MathJax rendering, markdown processing
   - Provides extensible hooks for customization

2. **PDF Generators** (`generators/`)
   - Type-specific generators that extend `BasePDFGenerator`
   - Each generator implements:
     - `getTemplatePath()`: Returns path to Handlebars template
     - `transformData()`: Transforms input data to template format
     - `registerHandlebarsHelpers()`: (Optional) Custom Handlebars helpers

3. **PDFService** (`pdf.service.ts`)
   - Factory service that routes to appropriate generator
   - Provides type-safe methods for each PDF type
   - Supports registering custom generators

4. **Types** (`types.ts`)
   - TypeScript interfaces for all PDF types
   - Enum for PDF types
   - Type-safe data structures

## Usage

### Basic Usage (Backward Compatible)

```typescript
import { PDFService } from "@/services/pdf.service";

const pdfService = new PDFService();
const pdfBuffer = await pdfService.generatePDF(testData);
```

### New Architecture Usage

```typescript
import { PDFService, PDFType } from "@/services/pdf";

const pdfService = new PDFService();

// Generate Test PDF
const testPdf = await pdfService.generateTestPDF(testData);

// Generate DPP PDF
const dppPdf = await pdfService.generateDPPPDF(dppData);

// Generate Test Analysis PDF
const analysisPdf = await pdfService.generateTestAnalysisPDF(analysisData);

// Or use generic method
const pdf = await pdfService.generatePDF(PDFType.TEST, testData);
```

### Creating a New PDF Type

1. **Define the data interface** in `types.ts`:

```typescript
export interface MyNewPDFData extends BasePDFData {
  myId: string;
  title: string;
  // ... other fields
}

export enum PDFType {
  // ...
  MY_NEW_TYPE = "my_new_type",
}
```

2. **Create the generator** in `generators/my-new-pdf-generator.ts`:

```typescript
import { BasePDFGenerator } from "../base-pdf-generator";
import { MyNewPDFData } from "../types";

export class MyNewPDFGenerator extends BasePDFGenerator<MyNewPDFData> {
  protected getTemplatePath(): string {
    return path.join(__dirname, "../../../../../../packages/pdf-templates/my-new-type/template.hbs");
  }

  protected transformData(data: MyNewPDFData): Record<string, any> {
    // Transform data for template
    return {
      myId: data.myId,
      title: data.title,
      // ... process data
    };
  }

  // Optional: Override for custom PDF options
  protected getPDFOptions(): puppeteer.PDFOptions {
    const baseOptions = super.getPDFOptions();
    return {
      ...baseOptions,
      // Custom options
    };
  }

  // Optional: Register custom Handlebars helpers
  protected registerHandlebarsHelpers(): void {
    super.registerHandlebarsHelpers();
    
    Handlebars.registerHelper("myCustomHelper", (value) => {
      // Custom logic
      return value;
    });
  }
}
```

3. **Register the generator** in `pdf.service.ts`:

```typescript
constructor() {
  this.generators = new Map();
  // ... existing generators
  this.generators.set(PDFType.MY_NEW_TYPE, new MyNewPDFGenerator());
}
```

4. **Add methods** in `pdf.service.ts`:

```typescript
async generateMyNewPDF(data: MyNewPDFData): Promise<Buffer> {
  const generator = this.getGenerator(PDFType.MY_NEW_TYPE) as BasePDFGenerator<MyNewPDFData>;
  return generator.generatePDF(data);
}
```

## File Structure

```
services/pdf/
├── index.ts                      # Main exports
├── base-pdf-generator.ts         # Base abstract class
├── pdf.service.ts                # Factory service
├── types.ts                      # Type definitions
├── generators/
│   ├── test-pdf-generator.ts     # Test PDF generator
│   ├── dpp-pdf-generator.ts      # DPP PDF generator
│   └── test-analysis-pdf-generator.ts  # Test Analysis generator
└── README.md                     # This file
```

## Features

- ✅ **Extensible**: Easy to add new PDF types
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Backward Compatible**: Existing code continues to work
- ✅ **Separation of Concerns**: Each generator handles its own template and data transformation
- ✅ **Reusable**: Common functionality (browser, MathJax, markdown) shared in base class
- ✅ **Customizable**: Override methods for PDF-specific needs

## Template Location

Templates should be placed in:
```
packages/pdf-templates/
├── question-paper/
│   └── sample-2.hbs
├── dpp/
│   └── template.hbs
└── test-analysis/
    └── template.hbs
```

## Notes

- All generators share the same browser instance management and MathJax rendering logic
- Markdown rendering is automatically handled for all PDF types
- Each generator can customize PDF options (margins, format, etc.)
- Handlebars helpers can be registered per-generator or globally in the base class