/**
 * Question Validation Utilities
 * Handles validation of question data structure and LaTeX symbols
 */

import { QuestionType, QuestionFormat, QCategory } from "@repo/db/enums";
import { QuestionFormat as TypeAdminFormat } from "@/types/";
import { validateAndReplaceLatexSymbols } from "./latex-validator";
import { cleanSolutionText, cleanCommonMistake } from "./text-cleaner";

export interface QuestionData {
  title: string;
  content: string;
  type: QuestionType;
  format: TypeAdminFormat;
  difficulty: number;
  subjectId: string;
  topicId: string;
  subtopicId?: string;
  solution?: string;
  hint?: string;
  strategy?: string;
  questionTime: number;
  isNumerical?: number;
  isTrueFalse?: boolean;
  commonMistake?: string;
  book?: string;
  pyqYear?: string;
  categories: QCategory[];
  options: Array<{
    content: string;
    isCorrect: boolean;
  }>;
}

export interface QuestionLatexValidation {
  isValid: boolean;
  warnings: string[];
  transformedData: QuestionData;
}

/**
 * Validates the structure and required fields of question data
 */
export function validateQuestionData(data: any): boolean {
  const requiredFields = [
    "title",
    "content",
    "type",
    "format",
    "difficulty",
    "topicId",
    "subjectId",
    "solution",
    "questionTime",
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }
  if (data.difficulty < 1 || data.difficulty > 4) {
    console.error("Difficulty must be between 1 and 4");
    return false;
  }

  const validTypes = Object.values(QuestionType);
  if (!validTypes.includes(data.type)) {
    console.error(
      `Invalid question type: ${data.type}. Must be one of: ${validTypes.join(", ")}`
    );
    return false;
  }

  const validFormats = Object.values(QuestionFormat);
  if (!validFormats.includes(data.format)) {
    console.error(
      `Invalid question format: ${data.format}. Must be one of: ${validFormats.join(", ")}`
    );
    return false;
  }

  if (data.type === QuestionType.MULTIPLE_CHOICE) {
    if (!Array.isArray(data.options) || data.options.length === 0) {
      console.error(
        "Options must be a non-empty array for MULTIPLE_CHOICE questions"
      );
      return false;
    }

    const correctOptions = data.options.filter((opt: any) => opt.isCorrect);
    if (correctOptions.length === 0) {
      console.error(
        "At least one option must be correct for MULTIPLE_CHOICE questions"
      );
      return false;
    }
  }

  if (
    !data.categories ||
    !Array.isArray(data.categories) ||
    data.categories.length === 0
  ) {
    console.error("At least one category is required");
    return false;
  }

  const validCategories = Object.values(QCategory);
  const validatedCategories = data.categories
    .map((category) => {
      const normalizedCategory = category.replace(/\s+/g, "_").toUpperCase();
      if (!validCategories.includes(normalizedCategory)) {
        console.warn(
          `Skipping invalid category: ${category}. Must be one of: ${validCategories.join(", ")}`
        );
        return null;
      }
      return normalizedCategory;
    })
    .filter((category) => category !== null);

  if (validatedCategories.length === 0) {
    console.error("No valid categories found after filtering");
    return false;
  }

  data.categories = validatedCategories;

  return true;
}

/**
 * Validates LaTeX symbols in question data fields and replaces them with Unicode
 */
export function validateQuestionLatexSymbols(
  questionData: QuestionData
): QuestionLatexValidation {
  const warnings: string[] = [];
  const transformedData = { ...questionData };

  // Validate and transform content
  const contentValidation = validateAndReplaceLatexSymbols(
    questionData.content
  );
  if (contentValidation.hasIssues) {
    transformedData.content = contentValidation.transformedText;
    warnings.push(
      `Content: Found ${contentValidation.foundLatexCodes.length} LaTeX symbol(s) and replaced with Unicode: ${contentValidation.foundLatexCodes.map((f) => `${f.latex} → ${f.unicode}`).join(", ")}`
    );
  }

  // Validate and transform strategy first (needed for solution deduplication)
  if (questionData.strategy) {
    const strategyValidation = validateAndReplaceLatexSymbols(
      questionData.strategy
    );
    if (strategyValidation.hasIssues) {
      transformedData.strategy = strategyValidation.transformedText;
      warnings.push(
        `Strategy: Found ${strategyValidation.foundLatexCodes.length} LaTeX symbol(s) and replaced with Unicode`
      );
    }
  }

  // Validate and transform solution
  if (questionData.solution) {
    // First, clean the solution text (remove prefix and check for duplicate shortcuts)
    let cleanedSolution = cleanSolutionText(
      questionData.solution,
      transformedData.strategy || questionData.strategy
    );
    
    const solutionValidation = validateAndReplaceLatexSymbols(cleanedSolution);
    if (solutionValidation.hasIssues) {
      transformedData.solution = solutionValidation.transformedText;
      warnings.push(
        `Solution: Found ${solutionValidation.foundLatexCodes.length} LaTeX symbol(s) and replaced with Unicode: ${solutionValidation.foundLatexCodes.map((f) => `${f.latex} → ${f.unicode}`).join(", ")}`
      );
    } else {
      transformedData.solution = cleanedSolution;
    }
    
    // Check if we made any changes
    if (questionData.solution !== cleanedSolution) {
      warnings.push(`Solution: Cleaned up (removed prefix/duplicate shortcuts)`);
    }
  }

  // Validate and transform options
  if (questionData.options && Array.isArray(questionData.options)) {
    transformedData.options = questionData.options.map((option, index) => {
      const optionValidation = validateAndReplaceLatexSymbols(option.content);
      if (optionValidation.hasIssues) {
        warnings.push(
          `Option ${index + 1}: Found ${optionValidation.foundLatexCodes.length} LaTeX symbol(s) and replaced with Unicode: ${optionValidation.foundLatexCodes.map((f) => `${f.latex} → ${f.unicode}`).join(", ")}`
        );
        return {
          ...option,
          content: optionValidation.transformedText,
        };
      }
      return option;
    });
  }

  // Validate and transform hint
  if (questionData.hint) {
    const hintValidation = validateAndReplaceLatexSymbols(questionData.hint);
    if (hintValidation.hasIssues) {
      transformedData.hint = hintValidation.transformedText;
      warnings.push(
        `Hint: Found ${hintValidation.foundLatexCodes.length} LaTeX symbol(s) and replaced with Unicode`
      );
    }
  }

  // Validate and transform common mistake
  if (questionData.commonMistake) {
    // First clean up the common mistake
    const cleanedMistake = cleanCommonMistake(questionData.commonMistake);
    
    if (cleanedMistake) {
      const mistakeValidation = validateAndReplaceLatexSymbols(cleanedMistake);
      if (mistakeValidation.hasIssues) {
        transformedData.commonMistake = mistakeValidation.transformedText;
        warnings.push(
          `Common Mistake: Found ${mistakeValidation.foundLatexCodes.length} LaTeX symbol(s) and replaced with Unicode`
        );
      } else {
        transformedData.commonMistake = cleanedMistake;
      }
      
      // Check if we cleaned it
      if (questionData.commonMistake !== cleanedMistake) {
        warnings.push(`Common Mistake: Cleaned up or limited to 2 entries`);
      }
    } else {
      // Remove common mistake if it's empty/vague
      transformedData.commonMistake = undefined;
      warnings.push(`Common Mistake: Removed (empty or too vague)`);
    }
  }

  return {
    isValid: true,
    warnings,
    transformedData,
  };
}

