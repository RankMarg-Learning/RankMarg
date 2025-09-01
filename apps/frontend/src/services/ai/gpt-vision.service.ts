import OpenAI from 'openai';
import { QuestionType, QuestionFormat, QCategory } from '@repo/db/enums';
import { QuestionFormat as TypeAdminFormat } from '@/types/typeAdmin';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  base64Image: string,
  imageType: string,
  subject: any,
  topicId: string | null,
  subtopics: {id: string, name: string}[]
): Promise<ProcessingResult> {
  try {
    const systemPrompt = createSystemPrompt(subject, topicId, subtopics);
    const userPrompt = createUserPrompt();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageType};base64,${base64Image}`,
                detail: "low" 
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0, 
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    console.log("content:", content);
    if (!content) {
      return {
        success: false,
        message: 'No response from GPT-4 Vision'
      };
    }

    try {
      const questionData = tryParseQuestionJson(content);
      if (!questionData) {
        return {
          success: false,
          message: 'Failed to parse AI response'
        };
      }
      
      if (!validateQuestionData(questionData)) {
        return {
          success: false,
          message: 'Invalid question data structure from AI'
        };
      }

      questionData.subjectId = subject.id;
      if (topicId) {
        questionData.topicId = topicId;
        
        if (questionData.subtopicId) {
          const validSubtopic = subtopics.find(st => st.id === questionData.subtopicId );
          if (!validSubtopic) {
            return {
              success: false,
              message: `Selected subtopic does not belong to the chosen topic (${topicId})`
            };
          }
        }
      }

      return {
        success: true,
        data: questionData
      };

    } catch (parseError) {
      console.error('Error parsing GPT response:', parseError);
      return {
        success: false,
        message: 'Failed to parse AI response'
      };
    }

  } catch (error) {
    console.error('GPT Vision processing error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

function createSystemPrompt(subject: any, topicId: string | null, subtopics: {id: string, name: string}[]): string {
  const subtopicsList = subtopics.map(st => `- ${st.name} (ID: ${st.id})`).join('\n');

  return `You are an expert NEET/JEE question author for RankMarg's Personalized Practice Platform. Produce ONE exam-quality question with clean JSON fields and Markdown that renders correctly.

SUBJECT: ${subject.name} (ID: ${subject.id})
TOPIC: ${topicId ? `Topic ID ${topicId}` : 'Not selected — choose from available topics'}
ALLOWED SUBTOPICS (for the chosen topic only):
${subtopicsList}

STRICT RENDER & FORMAT RULES:
- Markdown only. No HTML. No code fences anywhere in string fields.
- Tables: GitHub-style with a header row (| Col1 | Col2 | ... |).
- Math delimiters: Use ONLY $...$ for inline and $$ on its own lines for display. Do NOT use \\( \\) or \\[ \\].
- Backslashes in LaTeX: Use single backslashes (e.g., \\alpha, \\frac{}{}). Do NOT double-escape.
- Control characters or invalid escapes must not appear.

CONTENT VS OPTIONS (MANDATORY):
- Put only the question stem in "content". Do NOT put choices/options inside "content".
- Extract all choices into the "options" array. Keep their original reading order. Mark the correct one(s) via isCorrect.
- Never prefix choices in "content" with A)/B)/C)/D) or similar. Choices belong only in "options".

CORRECTNESS PROTOCOL:
- First, solve the problem. Then set the correct option(s) accordingly.
- In "Final Answer & Verification", state the final numeric/algebraic result (with units). If MCQ, also state the correct option letter AND the exact matching option text.
- If the computed answer and the marked correct option do not match, fix the mismatch before returning JSON. No guessing.

QUESTION POLICY:
- Use SI units, define uncommon symbols, keep language formal and concise.
- Ensure consistency between type, format, options, isNumerical, isTrueFalse.
- Choose 2–4 categories that best characterize the problem.
- Time vs. difficulty guideline: 1→1–3m, 2→3–6m, 3→6–10m, 4→10–20m.

OUTPUT CONTRACT — RETURN ONLY THIS JSON OBJECT (no prose before/after):
{
  "title": "Max 100 chars",
  "content": "Full question stem only (no answer choices). Use Markdown for structure and tables when helpful. Keep display equations in isolated $$ blocks on separate lines.",
  "type": "MULTIPLE_CHOICE" | "INTEGER" | "SUBJECTIVE",
  "format": "SINGLE_SELECT" | "MULTIPLE_SELECT" | "TRUE_FALSE" | "MATCHING" | "ASSERTION_REASON" | "COMPREHENSION" | "MATRIX_MATCH",
  "difficulty": 1|2|3|4,
  "topicId": "exact_topic_id_from_list_above",
  "subtopicId": "exact_subtopic_id_from_list_above",
  "subjectId": "${subject.id}",
  "solution": "Use the exact section anchors below. Keep prose concise.\n\n**Approach:** One-line plan.\n**Given Data:** If applicable, include a Markdown table with columns: Symbol | Meaning | Value/Unit.\n**Concepts Used:** 1–3 bullets; each cites the law/relation and shows its key formula in a $$ block.\n**Derivation:** Clear steps; put major calculations in their own $$ blocks.\n**Final Answer & Verification:** State final result (with units) and, if MCQ, the correct option letter AND the exact matching option text; add a brief reasonableness check.\n**Shortcut/Trick (if any):** Optional concise tip.",
  "hint": "Exactly one guiding line.",
  "strategy": "5–8 sentences on approach selection, checkpoints, pitfalls, elimination techniques, and time management.",
  "questionTime": 1-30,
  "isNumerical": 0|1,
  "isTrueFalse": false|true,
  "commonMistake": "Exactly three bullets, each in this format: '- Mistake: <what> | Fix: <instead>'.",
  "book": "Reference if mentioned",
  "pyqYear": "[Exam Name] Year (e.g., [JEE Main] 2024)",
  "categories": ["CALCULATION", "APPLICATION", "THEORETICAL", "TRICKY", "FACTUAL", "TRAP", "GUESS_BASED", "MULTI_STEP", "OUT_OF_THE_BOX", "ELIMINATION_BASED", "MEMORY_BASED", "CONFIDENCE_BASED", "HIGH_WEIGHTAGE", "CONCEPTUAL", "FORMULA_BASED"],
  "options": [
    {"content": "Option A", "isCorrect": false},
    {"content": "Option B", "isCorrect": true},
    {"content": "Option C", "isCorrect": false},
    {"content": "Option D", "isCorrect": false}
  ]
}

CRITICAL:
- Return only the JSON object above. No code fences, no surrounding text, no trailing commas, valid quotes only.
- Do NOT include choices in "content"; use "options" only.
- Use $...$ and $$...$$ only for math; never use \( \) or \[ \].`;
}

function createUserPrompt(): string {
  return `Analyze the question image and return ONE JSON object per the OUTPUT CONTRACT. Obey strictly:

1) Markdown only; no HTML or code fences. Use GitHub-style tables when data is tabular.
2) Math: display in $$...$$ on its own lines; inline with $...$. Never use \( \) or \[ \].
3) LaTeX: use single backslashes (e.g., \frac, \sqrt, \alpha). Do NOT double-escape.
4) Put only the stem in "content"; do NOT include choices there. Extract choices to "options" and set isCorrect precisely.
5) Solve first, then ensure the final answer matches the marked correct option (letter AND exact text) for MCQ. If mismatch, correct it before returning.
6) Use the exact solution section anchors; keep display math in separate $$ blocks.
7) Provide a 5–8 sentence Strategy and exactly three Common Mistakes bullets in the format '- Mistake: ... | Fix: ...'.

Return ONLY the JSON object with no extra text.`;
}

function validateQuestionData(data: any): boolean {
  const requiredFields = [
    'title', 'content', 'type', 'format', 'difficulty',
    'topicId', 'subjectId', 'solution', 'questionTime'
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }
  if (data.difficulty < 1 || data.difficulty > 4) {
    console.error('Difficulty must be between 1 and 4');
    return false;
  }

  if (data.questionTime < 1 || data.questionTime > 30) {
    console.error('Question time must be between 1 and 30 minutes');
    return false;
  }

  const validTypes = Object.values(QuestionType);
  if (!validTypes.includes(data.type)) {
    console.error(`Invalid question type: ${data.type}. Must be one of: ${validTypes.join(', ')}`);
    return false;
  }

  const validFormats = Object.values(QuestionFormat);
  if (!validFormats.includes(data.format)) {
    console.error(`Invalid question format: ${data.format}. Must be one of: ${validFormats.join(', ')}`);
    return false;
  }

  if (data.type === QuestionType.MULTIPLE_CHOICE) {
    if (!Array.isArray(data.options) || data.options.length === 0) {
      console.error('Options must be a non-empty array for MULTIPLE_CHOICE questions');
      return false;
    }

    const correctOptions = data.options.filter((opt: any) => opt.isCorrect);
    if (correctOptions.length === 0) {
      console.error('At least one option must be correct for MULTIPLE_CHOICE questions');
      return false;
    }
  }

  if (data.categories && Array.isArray(data.categories)) {
    const validCategories = Object.values(QCategory);
    for (const category of data.categories) {
      // Normalize category by replacing spaces with underscores and converting to uppercase
      const normalizedCategory = category.replace(/\s+/g, '_').toUpperCase();
      if (!validCategories.includes(normalizedCategory)) {
        console.error(`Invalid category: ${category}. Must be one of: ${validCategories.join(', ')}`);
        return false;
      }
      // Update the category to the normalized version
      data.categories[data.categories.indexOf(category)] = normalizedCategory;
    }
  }

  if (data.isNumerical !== undefined && ![0, 1].includes(data.isNumerical)) {
    console.error('isNumerical must be 0 or 1');
    return false;
  }

  // Ensure richer pedagogical fields
  if (!data.strategy || typeof data.strategy !== 'string' || data.strategy.split('.').filter(Boolean).length < 3) {
    console.error('Strategy must be provided with sufficient depth');
    return false;
  }

  if (!data.commonMistake || typeof data.commonMistake !== 'string' || !/^-\s*Mistake:.*\|\s*Fix:/im.test(data.commonMistake)) {
    console.error('CommonMistake must include bullets in "Mistake: ... | Fix: ..." format');
    return false;
  }

  // Require exactly three bullets for CommonMistake
  const mistakeBullets = (data.commonMistake.match(/^\s*-\s*Mistake:/gim) || []).length;
  if (mistakeBullets !== 3) {
    console.error('CommonMistake must have exactly three bullets');
    return false;
  }

  // Ensure solution contains the required section anchors
  if (typeof data.solution !== 'string') {
    console.error('Solution must be a string');
    return false;
  }
  const requiredSections = [
    'Approach:',
    'Concepts Used:',
    'Derivation:',
    'Final Answer & Verification:'
  ];
  for (const section of requiredSections) {
    if (!data.solution.includes(section)) {
      console.error(`Solution missing required section: ${section}`);
      return false;
    }
  }

  return true;
}

// Attempts to robustly parse model output into JSON.
// Handles code fences, leading/trailing text, and invalid escape sequences like \s, \d in LaTeX.
function tryParseQuestionJson(raw: string): any | null {
  // Fast path
  try {
    return JSON.parse(raw);
  } catch {}

  try {
    const noFences = stripCodeFences(raw);
    const candidate = extractFirstJsonObject(noFences);
    if (!candidate) return null;

    // Fix invalid escape sequences (e.g., \s, \d) by doubling backslashes when not a valid JSON escape
    const fixedBackslashes = fixInvalidBackslashes(candidate);

    // Remove control characters outside of JSON escapes that can break parsing
    const sanitized = fixedBackslashes.replace(/\u0000/g, '');

    return JSON.parse(sanitized);
  } catch (e) {
    console.error('tryParseQuestionJson failed after sanitation:', e);
    return null;
  }
}

function stripCodeFences(text: string): string {
  // Remove ```json ... ``` or ``` ... ``` fences
  return text.replace(/```[a-zA-Z]*\n([\s\S]*?)```/g, '$1').trim();
}

function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function fixInvalidBackslashes(jsonLike: string): string {
  // Replace backslashes that are NOT followed by a valid JSON escape char with escaped backslash
  // Valid escapes: \ \" \/ \b \f \n \r \t \u
  // Regex: \\ (?!["\\/bfnrtu])
  return jsonLike.replace(/\\(?!["\\\/bfnrtu])/g, '\\\\');
}
