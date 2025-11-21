import OpenAI from "openai";
import { QuestionType, QuestionFormat, QCategory } from "@repo/db/enums";
import { QuestionFormat as TypeAdminFormat } from "@/types/";
import ServerConfig from "@/config/server.config";
import {
  createLatexToUnicodeMap,
  createLatexMatchPattern,
  LATEX_SYMBOL_MAPPINGS,
} from "@/constants/latex-symbols";

const openai = new OpenAI({
  apiKey: ServerConfig.openai.api_key,
});

// Initialize fast lookup structures for LaTeX symbol validation
const latexToUnicodeMap = createLatexToUnicodeMap();
const latexMatchPattern = createLatexMatchPattern();

interface QuestionData {
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

interface ProcessingResult {
  success: boolean;
  data?: QuestionData;
  message?: string;
}

export async function processImageToQuestion(
  imageUrl: string,
  subject: any,
  topicId: string | null,
  subtopics: { id: string; name: string }[],
  gptModel: string = "gpt-4o-mini",
  additionalInstructions: string = ""
): Promise<ProcessingResult> {
  try {
    const systemPrompt = createSystemPrompt(subject, topicId, subtopics);
    const userPrompt = createUserPrompt(additionalInstructions);

    const response = await openai.chat.completions.create({
      model: gptModel,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: imageUrl, detail: "low" } },
          ],
        },
      ],
      // max_tokens: 3000,
      // temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        message: "No response from GPT-4 Vision",
      };
    }

    try {
      let questionData = tryParseQuestionJson(content);
      if (!questionData) {
        return {
          success: false,
          message: "Failed to parse AI response",
        };
      }

      if (!validateQuestionData(questionData)) {
        return {
          success: false,
          message: "Invalid question data structure from AI",
        };
      }

      // Validate and replace LaTeX symbols with Unicode
      const latexValidation = validateQuestionLatexSymbols(questionData);
      if (latexValidation.warnings.length > 0) {
        console.log("LaTeX Symbol Validation Warnings:");
        latexValidation.warnings.forEach((warning) => console.log(`  - ${warning}`));
      }

      // Use the transformed data
      questionData = latexValidation.transformedData;

      questionData.subjectId = subject.id;
      if (topicId) {
        questionData.topicId = topicId;

        if (questionData.subtopicId) {

          const validSubtopic = subtopics.find(
            (st) => st.id === questionData.subtopicId
          );
          if (!validSubtopic) {
            return {
              success: false,
              message: `Selected subtopic does not belong to the chosen topic (${topicId})`,
            };
          }
        }
      }

      return {
        success: true,
        data: questionData,
      };
    } catch (parseError) {
      console.error("Error parsing GPT response:", parseError);
      return {
        success: false,
        message: "Failed to parse AI response",
      };
    }
  } catch (error) {
    console.error("GPT Vision processing error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

function createSystemPrompt(
  subject: any,
  topicId: string | null,
  subtopics: { id: string; name: string }[]
): string {
  const subtopicsList = subtopics
    .map((st) => `- ${st.name} (ID: ${st.id})`)
    .join("\n");

  return `Role: Expert of ${subject.name} NEET/JEE question author for RankMarg. Write ONE exam-ready question and reply ONLY with the JSON below.

SUBJECT: ${subject.name} (ID:${subject.id})
TOPIC: ${topicId ? topicId : "CHOOSE"}
SUBTOPICS:
${subtopicsList}

**Difficulty**:  
(Decide based on the following strict rules and change difficulty according to subject inside ${subject.name} syllabus)  
${subject.name === "Physics"
      ? `
  - 1 (Easy): Direct formula substitution, single concept, <40 sec.  
  - 2 (Medium): One concept with algebra/trig manipulation, ~1 min. 
  - 3 (Hard): Multi-step, 2 concepts linked (e.g., friction + NLM), ~1–2 min. 
  - 4 (Very Hard): Multi-concept integration, calculus/advanced logic, >3 min.
  `
      : subject.name === "Chemistry"
        ? `
    - 1 (Easy): Direct NCERT fact, definition, or formula-based numerical, <25 sec.
    - 2 (Medium): Single concept with straightforward calculation/reasoning, ~1 min.
    - 3 (Hard): Multi-step problem, requires linking 2 concepts (e.g., thermodynamics + equilibrium, hybridisation + resonance), ~1–2 min.
    - 4 (Very Hard): Multi-concept integration, lengthy calculations, tricky exceptions or advanced mechanisms, >2–3 min.    
    `
        : subject.name === "Biology"
          ? `
      - 1 (Easy):Direct NCERT fact or definition recall (one-line answer), <15 sec.
      - 2 (Medium): Single concept application (flow/process-based, e.g., respiration step order), ~25 sec–45 sec
      - 3 (Hard): Twisted recall, multi-step reasoning (e.g., exceptions in taxonomy, genetic cross with 2 traits),~1 min
      - 4 (Very Hard): Case-based/multi-concept integration (e.g., ecology + genetics, applied physiology), >1–2 min. 
    `
          : subject.name === "Mathematics"
            ? `
      - 1 (Easy): Direct formula/application, single-step calculation (e.g., simple algebra or direct differentiation), <40 sec.
      - 2 (Medium): One concept with algebra/trig/logarithm manipulation, ~1 min.
      - 3 (Hard): Multi-step problem, requires linking 2 concepts (e.g., calculus + coordinate geometry, algebra + probability), ~1–2 min.
      - 4 (Very Hard): Multi-concept integration, lengthy proofs/advanced calculus or combinatorics, >2–3 min.
      `
            : `
    - 1 (Easy): Direct formula substitution, single concept, <40 sec.  
    - 2 (Medium): One concept with algebra/trig manipulation, ~1 min. 
    - 3 (Hard): Multi-step, 2 concepts linked (e.g., friction + NLM), ~1–2 min. 
    - 4 (Very Hard): Multi-concept integration, calculus/advanced logic, >3 min.
  `
    }

- If question is based on subject inside ${subject.name} syllabus then change difficulty according to subject inside ${subject.name} syllabus.

STRICT RENDER & FORMAT RULES:
- Tables: GitHub-style with a header row (| Col1 | Col2 | ... |).
- Index-to-space rule wrap with $..$ (e.g. x_i -> $x_i$ or x^{-2} -> $x^{-2}$ and many more)
${subject.name === "Chemistry" ? "- Transform all element-symbol in render format.(e.g. CO2 -> $CO_2$,SO_4^{-1} -> $SO_4^{-1}$)" : ""}
${subject.name === "Mathematics" ? "- Transform difficult latex symbols in unicode format.(e.g. Instead of  \neq give direct ≠ , \notin -> ∉)" : ""}
- Math delimiters: Use ONLY $...$ for inline and $$ on its own lines for display and use the following format:
    $$
    ....
    $$
    use for calculation steps (Centered) and $$...$$ for logical steps (Not Centered)
- Do NOT use \( \) or \[ \].
- Use proper bracket format like this: (eg. 1,1 --> (1,1) , f x --> f(x) , etc)
- Control characters or invalid escapes must not appear.
- Don't wrap text inside $..$.
- For New Line content show use \n\n

CONTENT vs OPTIONS RULES:
• Only stem in "content"
• Choices in "options" (keep order) with isCorrect
• No A)/B) in stem
• If content has diagram the describe the diagram inside square brackets so we will generate and add it. (If needed)

SOLUTION RULES AND REGULATIONS:
[CRITICAL]: Do NOT include "**Solution:**" heading - start directly with solution content.
- Subheading in bold format like this: (eg. **Shortcut/Trick:** , **Exploratory:** , **Did You Know:** ,**Final Answer:** ,etc)
- IMPORTANT: If Shortcut/Trick is already covered in "strategy" field, DO NOT repeat it in solution.
${subject.name === "Physics"
      ? `
    [NOTE]: USE MINIMUM THEORETICAL EXPLANATION AND ONLY SHOW THE CALCULATION STEPS.
  - Given data: [like, Given: 10kg, 20kg, 30kg...] (If Needed)
  - If solution needed the visualize which helps to solve the question faster and easier (diagram / table / logical diagram/ etc) Describe the diagram inside square brackets so we will generate and add it. (If needed)
  - Establish relevant equations. (If needed)
  - Reason through Physics. (If needed)
  - Solve Mathematics in step by step. (If needed)
  - Final answer with units.
  - Add **Shortcut/Trick:** ONLY if it's different from the strategy and provides unique value. (If Possible)
  - If-Then Scenario [like, If mass doubles then...](If Possible)
  `
      : subject.name === "Chemistry"
        ? `
      INSTRUCTIONS: 
      [NOTE]: USE MINIMUM THEORETICAL EXPLANATION AND ONLY SHOW IMPORTANT ONES.
        - PROVIDE MINIMUM THEORETICAL EXPLANATION AND ONLY SHOW THE CALCULATION STEPS WHEN PHYSICAL CHEMISTRY QUESTION.
        - PROVIDE POINT WISE FACTS AND REASONING WHEN INORGANIC CHEMISTRY QUESTION.
        - PROVIDE STEPWISE MECHANISM DIAGRAM WITH DIAGRAM VISUALS DESCRIPTION IN SQUARE BRACKETS (eg. [Reaction of CO2 with NaOH forming NaHCO3]) AND FAST RECOGNITION RULES WHEN ORGANIC CHEMISTRY QUESTION (eg. Carboxylation reaction, SN1 reaction, etc).
      - **Shortcut/Trick:** Mention an exam-oriented shortcut ONLY if it's different from the strategy and adds unique value. (If Possible)
        Example: "For Kc < 1, reactants dominate → equilibrium lies left."
      - **Quick Recall:** Add one-line recall rule or pattern for long-term memory(If Possible).
  `
        : subject.name === "Biology"
          ? `
        -  If solution needed the visualize (diagram / table / etc) Describe the diagram inside square brackets so we will generate and add it. (If needed)
        - Explain the solution step by step through bullets in minimal words and understandable manner.
        - Final answer.
        - Add **Shortcut/Trick:** ONLY if it's different from the strategy and provides unique value. (If Possible)
        - **Did You Know:** Interesting fact related to the topic (If Possible)
        - **Exploratory:** Advanced concept beyond NCERT but connected to question (If Possible)
  `
          : subject.name === "Mathematics"
            ? `
            [CRITICAL]: ONLY CALCULATION STEPS WITH MINIMAL WORDING - NO LENGTHY EXPLANATIONS.
          - Show direct calculations with proper formatting and step by step until Final answer (Skip trivial arithmetic).
          - Use mathematical notation and equations - avoid wordy explanations.
          - Each step should be clear calculation, not paragraphs of text.
          - **Final Answer:** State the result clearly.
          - Add **Shortcut/Trick:** ONLY if it's different from the strategy and saves significant time. (If Possible)
  `
            : ``
    }


STRATEGY FIELD RULES:
• CRITICAL: If strategy has high-impact advice that creates breakthrough understanding, include it prominently
• Write 1-3 clear, actionable sentences on: approach selection, key checkpoints, common pitfalls to avoid, elimination techniques, and time management
• Include KEY INSIGHTS that help solve similar problems faster
• Must follow RENDER & FORMAT RULES (proper math notation, no LaTeX symbols)
• Examples:
  - Good: "Identify given and required variables. Use the kinematic equation $v^2 = u^2 + 2as$. Watch for sign conventions in direction."
  - Bad: "Just solve it step by step."

HINT FIELD RULES:
• ONE guiding sentence that nudges thinking WITHOUT revealing the answer
• Must follow RENDER & FORMAT RULES (proper math notation, symbols)
• Should be specific and actionable, not vague
• Examples:
  - Good: "Consider which trigonometric identity connects $\sin^2 \theta$ and $\cos^2 \theta$."
  - Bad: "Think about the formula."

COMMON MISTAKE FIELD RULES:
• ONLY add if 75%+ students make these mistakes (high-frequency errors)
• If no such common mistakes exist, leave EMPTY or provide ONE highly relevant mistake
• Must be 1-2 bullets MAXIMUM, each in format: "- Mistake: <what> | Fix: <instead>\\n\\n"
• Must follow RENDER & FORMAT RULES (proper math notation)
• Focus on CONCEPTUAL or PROCEDURAL mistakes, not silly calculation errors
• Examples of valid mistakes: sign errors in physics, forgetting to square in formulas, unit conversion issues, confusing similar concepts

POLICY:
• SI units, define symbols, formal student tone
• Keep type, format, options, isNumerical, isTrueFalse consistent
• Pick Question Categories based on the question and subject syllabus
• In Solution make steps subtitle bold
• All fields must follow RENDER & FORMAT RULES strictly

CORRECTNESS: use image to mark correct option.

RETURN EXACTLY THIS JSON (no extra text and each field need to follow strict rules like RENDER & FORMAT RULES):
{
  "title": "string",
  "content": "Full question stem only exactly like image (no answer choices). Use Markdown for structure and tables when helpful. Follow RENDER & FORMAT RULES",
  "type": "MULTIPLE_CHOICE" | "INTEGER" | "SUBJECTIVE",
  "format": "SINGLE_SELECT" | "MULTIPLE_SELECT" | "TRUE_FALSE" | "MATCHING" | "ASSERTION_REASON" | "COMPREHENSION" (e.g consider Statement-base -> "TRUE_FALSE", Match The Following -> "MATCHING", TYPE => INTEGER then "SINGLE_SELECT"),
  "difficulty": 1|2|3|4,
  "topicId": "exact_topic_id_from_list_above",
  "subtopicId": "exact_subtopic_id_from_list_above",
  "subjectId": "${subject.id}",
  "solution": "Follow solution generations RULES AND REGULATIONS and always validate the Render & Format Rules. NO '**Solution:**' heading.",
  "strategy": "1-3 clear, actionable sentences with high-impact insights on approach, pitfalls, elimination, time management. Follow RENDER & FORMAT RULES.",
  "hint": "One specific guiding sentence without revealing answer. Follow RENDER & FORMAT RULES.",
  "questionTime": as per question difficulty and subject (In Seconds),
  "isNumerical": If Options not Present then add here numerical value otherwise null,
  "isTrueFalse": false|true,
  "commonMistake": "ONLY if 75%+ students make these mistakes. 1-2 bullets MAX in format: '- Mistake: <what> | Fix: <instead>\\n\\n'. Leave empty if no high-frequency mistakes. Follow RENDER & FORMAT RULES.",
  "book": "Reference Book Name",
  "pyqYear": "[Exam Name] Year (e.g., [JEE Main] 2024), empty string if not mentioned",
  "categories": ["CALCULATION", "APPLICATION", "THEORETICAL", "TRICKY", "FACTUAL", "TRAP", "GUESS_BASED", "MULTI_STEP", "OUT_OF_THE_BOX", "ELIMINATION_BASED", "MEMORY_BASED", "CONFIDENCE_BASED", "CONCEPTUAL", "FORMULA_BASED"],
  "options": [
    {"content": "Option A, If equations are present then write them follow RENDER & FORMAT RULES", "isCorrect": true/false},
    ...
  ]
}

CRITICAL REMINDERS:
• Reply with JSON only (no fences, no extra text, no trailing commas)
• Use student understandable language and tone
• Do NOT put choices inside "content"
• Use $ only for math (no LaTeX symbols like \\neq, use ≠ instead)
• NO "**Solution:**" heading in solution field
• Do NOT repeat Shortcut in solution if already in strategy
• Strategy must include high-impact insights (1-3 sentences)
• Hint must be specific and actionable (1 sentence)
• Common Mistake ONLY if 75%+ students make it (1-2 bullets MAX, or leave empty)
${subject.name === "Mathematics" ? "• Mathematics solution: ONLY calculations with minimal wording" : ""}
• Follow RENDER & FORMAT RULES strictly for all fields
• POLICY, CORRECTNESS, RETURN EXACTLY THIS JSON and RENDER & FORMAT RULES
`;
}

function createUserPrompt(additionalInstructions: string = ""): string {
  return `Analyze the question image and return ONE JSON object per the OUTPUT CONTRACT. Obey strictly POLICY, CORRECTNESS, RETURN EXACTLY THIS JSON and RENDER & FORMAT RULES:
Return ONLY the JSON object with no extra text.${additionalInstructions ? `\nAdditional instructions: ${additionalInstructions}` : ""}`;
}

function validateQuestionData(data: any): boolean {
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

function tryParseQuestionJson(raw: string): any | null {
  try {
    return JSON.parse(raw);
  } catch { }

  try {
    const noFences = stripCodeFences(raw);
    const candidate = extractFirstJsonObject(noFences);
    if (!candidate) return null;

    const fixedBackslashes = fixInvalidBackslashes(candidate);

    const sanitized = fixedBackslashes.replace(/\u0000/g, "");

    return JSON.parse(sanitized);
  } catch (e) {
    console.error("tryParseQuestionJson failed after sanitation:", e);
    return null;
  }
}

function stripCodeFences(text: string): string {
  return text.replace(/```[a-zA-Z]*\n([\s\S]*?)```/g, "$1").trim();
}

function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function fixInvalidBackslashes(jsonLike: string): string {
  return jsonLike.replace(/\\(?!["\\\/bfnrtu])/g, "\\\\");
}

/**
 * Validates and replaces LaTeX symbols with Unicode equivalents
 * @param text - Text to validate and transform
 * @returns Object with transformed text and found issues
 */
interface LatexValidationResult {
  transformedText: string;
  foundLatexCodes: Array<{
    latex: string;
    unicode: string;
    position: number;
  }>;
  hasIssues: boolean;
}

function validateAndReplaceLatexSymbols(text: string): LatexValidationResult {
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

/**
 * Cleans up solution text by removing unwanted prefixes and duplicate shortcuts
 * @param solution - Solution text to clean
 * @param strategy - Strategy text to check for duplicates
 * @returns Cleaned solution text
 */
function cleanSolutionText(solution: string, strategy?: string): string {
  // Remove "**Solution:**" prefix with optional whitespace/newlines
  let cleaned = solution.replace(/^\*\*Solution:\*\*\s*\n*\s*/i, '');
  
  // Also handle variations like "Solution:" without bold
  cleaned = cleaned.replace(/^Solution:\s*\n*\s*/i, '');
  
  // If strategy exists, check for duplicate shortcuts
  if (strategy) {
    // Extract shortcut section from solution
    const shortcutMatch = cleaned.match(/\*\*Shortcut\/Trick:\*\*\s*(.*?)(?=\n\n\*\*|\n\n-|\n\n$|$)/is);
    
    if (shortcutMatch) {
      const shortcutText = shortcutMatch[1].trim().toLowerCase();
      const strategyLower = strategy.toLowerCase();
      
      // Calculate similarity - if shortcut is very similar to strategy, remove it
      const words = shortcutText.split(/\s+/).filter(w => w.length > 3);
      const matchCount = words.filter(word => strategyLower.includes(word)).length;
      const similarity = words.length > 0 ? matchCount / words.length : 0;
      
      // If >60% of meaningful words in shortcut appear in strategy, remove shortcut section
      if (similarity > 0.6) {
        cleaned = cleaned.replace(/\*\*Shortcut\/Trick:\*\*\s*.*?(?=\n\n\*\*|\n\n-|\n\n$|$)/is, '').trim();
      }
    }
  }
  
  return cleaned.trim();
}

/**
 * Cleans up common mistake text - removes if empty or too vague
 * @param commonMistake - Common mistake text
 * @returns Cleaned common mistake text or undefined if should be removed
 */
function cleanCommonMistake(commonMistake?: string): string | undefined {
  if (!commonMistake || commonMistake.trim() === '') {
    return undefined;
  }
  
  const trimmed = commonMistake.trim();
  
  // Remove if it's just a placeholder or too vague
  const vaguePhrases = [
    'no common mistake',
    'no specific mistake',
    'not applicable',
    'n/a',
    'none',
  ];
  
  const lowerTrimmed = trimmed.toLowerCase();
  if (vaguePhrases.some(phrase => lowerTrimmed.includes(phrase))) {
    return undefined;
  }
  
  // Count actual mistake entries (should have "Mistake:" and "Fix:")
  const mistakeCount = (trimmed.match(/Mistake:/gi) || []).length;
  
  if (mistakeCount === 0) {
    return undefined;
  }
  
  // Limit to 2 mistakes maximum
  if (mistakeCount > 2) {
    const mistakes = trimmed.split(/(?=-\s*Mistake:)/i).filter(m => m.trim());
    return mistakes.slice(0, 2).join('\n\n').trim();
  }
  
  return trimmed;
}

/**
 * Validates LaTeX symbols in question data fields
 * @param questionData - Question data to validate
 * @returns Validation result with warnings
 */
interface QuestionLatexValidation {
  isValid: boolean;
  warnings: string[];
  transformedData: QuestionData;
}

function validateQuestionLatexSymbols(
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

//Prompt Scrap
// **Approach:** Brief one-line strategy for solving

// **Understanding the Problem:** Extract given data and requirement.

// **Concept Application:** Introduce formula/law with $$ ... $$

// **Calculation:** Perform detailed math/chemistry steps with LaTeX. Each major calculation in a separate block, not numbered list.(Based on the question)

// **Final Answer:** State final result clearly, with units if needed. (Verify correctness.)

// **Shortcut/Trick :** Exam-friendly shortcut (if any)

// **Exploratory:** Provide one concise paragraph of relevant knowledge or advanced concepts that are not in the NCERT syllabus but are connected to the question.(If any for conceptual question)
