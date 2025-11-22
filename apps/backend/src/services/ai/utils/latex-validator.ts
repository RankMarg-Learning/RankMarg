/**
 * LaTeX Symbol Validation and Replacement Utilities
 * Validates and replaces LaTeX symbols with Unicode equivalents
 */

import {
  createLatexToUnicodeMap,
  createLatexMatchPattern,
} from "@/constant/latex-symbols";

// Initialize fast lookup structures for LaTeX symbol validation
const latexToUnicodeMap = createLatexToUnicodeMap();
const latexMatchPattern = createLatexMatchPattern();

export interface LatexValidationResult {
  transformedText: string;
  foundLatexCodes: Array<{
    latex: string;
    unicode: string;
    position: number;
  }>;
  hasIssues: boolean;
}

/**
 * Validates and replaces LaTeX symbols with Unicode equivalents
 * @param text - Text to validate and transform
 * @returns Object with transformed text and found issues
 */
export function validateAndReplaceLatexSymbols(text: string): LatexValidationResult {
  const foundLatexCodes: Array<{
    latex: string;
    unicode: string;
    position: number;
  }> = [];

  let transformedText = text;
  let match: RegExpExecArray | null;

  // Reset regex state
  latexMatchPattern.lastIndex = 0;

  // Find all LaTeX codes in the text
  while ((match = latexMatchPattern.exec(text)) !== null) {
    const latexCode = match[0];
    const unicode = latexToUnicodeMap.get(latexCode);

    if (unicode) {
      foundLatexCodes.push({
        latex: latexCode,
        unicode: unicode,
        position: match.index,
      });
    }
  }

  // Replace all LaTeX codes with Unicode symbols
  if (foundLatexCodes.length > 0) {
    // Sort by position in reverse order to maintain correct indices during replacement
    foundLatexCodes.sort((a, b) => b.position - a.position);

    for (const found of foundLatexCodes) {
      const regex = new RegExp(
        found.latex.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "g"
      );
      transformedText = transformedText.replace(regex, found.unicode);
    }
  }

  return {
    transformedText,
    foundLatexCodes,
    hasIssues: foundLatexCodes.length > 0,
  };
}

