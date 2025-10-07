import OpenAI from "openai";
import { QuestionType, QuestionFormat, QCategory } from "@repo/db/enums";
import { QuestionFormat as TypeAdminFormat } from "@/types/";
import ServerConfig from "@/config/server.config";

const openai = new OpenAI({
  apiKey: ServerConfig.openai.api_key,
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
    console.log("response:", response);
    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        message: "No response from GPT-4 Vision",
      };
    }

    try {
      const questionData = tryParseQuestionJson(content);
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

      questionData.subjectId = subject.id;
      if (topicId) {
        questionData.topicId = topicId;

        if (questionData.subtopicId) {
          console.log("questionData.subtopicId:", questionData.subtopicId);
          console.log("subtopics:", subtopics);
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
${
  subject.name === "Physics"
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
- My Render System is based on react-markdown with 'remark-math' and 'rehype-katex'.
- Tables: GitHub-style with a header row (| Col1 | Col2 | ... |).
- Index-to-space rule wrap with $..$ (e.g. x_i -> $x_i$ or x^{-2} -> $x^{-2}$, \sqrt{x} -> $\sqrt{x}$ and many more)
${subject.name === "Chemistry" ? "- Transform all element-symbol in render format.(e.g. CO2 -> $CO_2$,SO_4^{-1} -> $SO_4^{-1}$)" : ""}
${subject.name === "Mathematics" ? "- For difficult symbol use unicode format like $\\not\\subset$ -> $⊄$ and many more" : ""} 
- Math delimiters: Use ONLY $...$ for inline and $$ on its own lines for display and use the following format:
    $$
    ....
    $$
    use for calculation steps (Centered) and $$...$$ for logical steps (Not Centered)
- Do NOT use \( \) or \[ \].
- Control characters or invalid escapes must not appear.
- Don't wrap text inside $..$.
- For New Line content show use \n\n

CONTENT vs OPTIONS RULES:
• Only stem in "content"
• Choices in "options" (keep order) with isCorrect
• No A)/B) in stem
• If content has diagram the describe the diagram inside square brackets so we will generate and add it. (If needed)

SOLUTION RULES AND REGULATIONS:
- Subheading in bold format like this: (eg. **Shortcut/Trick:** , **Exploratory:** , **Did You Know:** ,**Final Answer:** ,etc)
${
  subject.name === "Physics"
    ? `
    [NOTE]: USE MINIMUM THEORETICAL EXPLANATION AND ONLY SHOW THE CALCULATION STEPS.
  - Given data: [like, Given: 10kg, 20kg, 30kg...] (If Needed)
  - If solution needed the visualize (diagram / table / etc) Describe the diagram inside square brackets so we will generate and add it. (If needed)
  - Establish relevant equations. (If needed)
  - Reason through Physics. (If needed)
  - Solve Mathematics in step by step. (If needed)
  - Final answer with units.
  - Add Shortcut/Trick. (If Possible)
  - If-Then Scenario [like, If mass doubles then...](If Possible)
  `
    : subject.name === "Chemistry"
      ? `
    - Highlight the important point from the question.(If Needed)
    - If solution needed the visualize (diagram / table / etc) Describe the diagram inside square brackets so we will generate and add it. (If needed)
    - Solution steps like this:
      - Convert data into useful form.(If Needed)
      - Apply relevant formula or application.(If Needed)
      - Highlight assumptions or conditions. (If Possible)
      - Final answer.
      - Add Shortcut/Trick. (If Possible)
      - Quick recall [like, If you see this[...]-> think:[...]] (If Possible)
  `
      : subject.name === "Biology"
        ? `
        -  If solution needed the visualize (diagram / table / etc) Describe the diagram inside square brackets so we will generate and add it. (If needed)
        - Explain the solution step by step through bullets in minimual words and understandable manner.
        - Final answer.
        - Add Shortcut/Trick. (If Possible)
        - Did You Know [like, Did you know...] (If Possible)
        - Exploratory [like, Exploratory...] (If Possible)
  `
        : subject.name === "Mathematics"
          ? `
          - Solve the question with proper format and step by step untill Final answer gives (Skip Simple Calculation).
          - Add Shortcut/Trick. (If Possible)
  `
          : ``
}


POLICY:
• SI units, define symbols, formal student tone
• Keep type, format, options, isNumerical, isTrueFalse consistent
• Pick 2-4 categories
• In Solution make steps subtitle bold.

CORRECTNESS: use image to mark correct option.

RETURN EXACTLY THIS JSON (no extra text and each field need to follow strict rules like RENDER & FORMAT RULES):
{
  "title": "string",
  "content": "Full question stem only exactly like image (no answer choices). Use Markdown for structure and tables when helpful. Follow RENDER & FORMAT RULES",
  "type": "MULTIPLE_CHOICE" | "INTEGER" | "SUBJECTIVE",
  "format": "SINGLE_SELECT" | "MULTIPLE_SELECT" | "TRUE_FALSE" | "MATCHING" | "ASSERTION_REASON" | "COMPREHENSION" ,
  "difficulty": 1|2|3|4,
  "topicId": "exact_topic_id_from_list_above",
  "subtopicId": "exact_subtopic_id_from_list_above",
  "subjectId": "${subject.id}",
  "solution": " Follow solution generations RULES AND REGULATIONS and always validate the Render & Format Rules",
  "strategy": "1-2 sentences on approach selection, checkpoints, pitfalls, elimination techniques, and time management.",
  "hint": "One guiding line without revealing the answer",
  "questionTime": 1-30,
  "isNumerical": If Options not Present then add here numerical value otherwise null,
  "isTrueFalse": false|true,
  "commonMistake": "2 IMP Mistakes bullets, each in this format: '- Mistake: <what> | Fix: <instead>\n\n'.",
  "book": "Reference if mentioned",
  "pyqYear": "[Exam Name] Year (e.g., [JEE Main] 2024), null if not mentioned",
  "categories": ["CALCULATION", "APPLICATION", "THEORETICAL", "TRICKY", "FACTUAL", "TRAP", "GUESS_BASED", "MULTI_STEP", "OUT_OF_THE_BOX", "ELIMINATION_BASED", "MEMORY_BASED", "CONFIDENCE_BASED", "CONCEPTUAL", "FORMULA_BASED"],
  "options": [
    {"content": "Option A, If equations are present then write them follow RENDER & FORMAT RULES", "isCorrect": true/false},
    ...
  ]
}

CRITICAL:
• Reply with JSON only (no fences, no extra text, no trailing commas)
• Do NOT put choices inside "content"
• Use $ only for math.
• Follow RENDER & FORMAT RULES
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

  if (data.questionTime < 1 || data.questionTime > 30) {
    console.error("Question time must be between 1 and 30 minutes");
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
  } catch {}

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

//Prompt Scrap
// **Approach:** Brief one-line strategy for solving

// **Understanding the Problem:** Extract given data and requirement.

// **Concept Application:** Introduce formula/law with $$ ... $$

// **Calculation:** Perform detailed math/chemistry steps with LaTeX. Each major calculation in a separate block, not numbered list.(Based on the question)

// **Final Answer:** State final result clearly, with units if needed. (Verify correctness.)

// **Shortcut/Trick :** Exam-friendly shortcut (if any)

// **Exploratory:** Provide one concise paragraph of relevant knowledge or advanced concepts that are not in the NCERT syllabus but are connected to the question.(If any for conceptual question)
