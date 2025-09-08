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
  subtopics: {id: string, name: string}[],
  gptModel: string = "gpt-4o-mini"
): Promise<ProcessingResult> {
  try {
    const systemPrompt = createSystemPrompt(subject, topicId, subtopics);
    const userPrompt = createUserPrompt();

    const response = await openai.chat.completions.create({
      model: gptModel, 
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
      // max_tokens: 3000,
      // temperature: 0, 
      response_format: { type: "json_object" }
    });
    console.log("response:", response);
    const content = response.choices[0]?.message?.content;
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
          console.log("questionData.subtopicId:", questionData.subtopicId);
          console.log("subtopics:", subtopics);
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

  return `Role: Expert NEET/JEE question author for RankMarg. Write ONE exam-ready question and reply ONLY with the JSON below.

SUBJECT: ${subject.name} (ID:${subject.id})
TOPIC: ${topicId ? topicId : 'CHOOSE'}
SUBTOPICS:
${subtopicsList}

**Difficulty**:  
(Decide based on the following strict rules and change difficulty according to subject inside NEET/JEE syllabus)  
- 1 (Easy): Direct formula substitution or factual recall.  
- 2 (Moderate): Requires 1–2 concepts, small calculation/application.  
- 3 (Hard): Multi-step reasoning, deeper conceptual link, longer calculation.  
- 4 (Very Hard): Involves multiple concepts together, advanced application, or tricky logical steps. 
- If question is based on subject inside NEET/JEE syllabus then change difficulty according to subject inside NEET/JEE syllabus.

STRICT RENDER & FORMAT RULES:
- Tables: GitHub-style with a header row (| Col1 | Col2 | ... |).
- Math delimiters: Use ONLY $...$ for inline and $$ on its own lines for display and use the following format:
    $$
    ....
    $$
    use for calculation steps (Centered) and $$...$$ for logical steps (Not Centered)
- Do NOT use \( \) or \[ \].
- Control characters or invalid escapes must not appear.
- For New Line content show use \n\n

CONTENT vs OPTIONS:
• Only stem in "content"
• Choices in "options" (keep order) with isCorrect
• No A)/B) in stem

CORRECTNESS: use image to mark correct option.

POLICY:
• SI units, define symbols, formal tone
• Keep type, format, options, isNumerical, isTrueFalse consistent
• Pick 2-4 categories

RETURN EXACTLY THIS JSON (no extra text):
{
  "title": "string",
  "content": "Full question stem only (no answer choices). Use Markdown for structure and tables when helpful. Keep display equations in isolated $$ blocks on separate lines.",
  "type": "MULTIPLE_CHOICE" | "INTEGER" | "SUBJECTIVE",
  "format": "SINGLE_SELECT" | "MULTIPLE_SELECT" | "TRUE_FALSE" | "MATCHING" | "ASSERTION_REASON" | "COMPREHENSION" ,
  "difficulty": 1|2|3|4,
  "topicId": "exact_topic_id_from_list_above",
  "subtopicId": "exact_subtopic_id_from_list_above",
  "subjectId": "${subject.id}",
  "solution": "**Approach:**Brief one-line strategy for solving  

**Understanding the Problem:** Extract given data and requirement.  

**Concept Application:** Introduce formula/law with $$ ... $$  

**Calculation:** Perform detailed math/chemistry steps with LaTeX. Each major calculation in a separate block, not numbered list.(Based on the question)  

**Final Answer:** State final result clearly, with units if needed. (Verify correctness.)  

INSTRUCTIONS: Based on the question types include the above steps in the solutionor add steps according to need for NEET/JEE aspirants (for example if calculation based question then include step 3 LIKE THIS).
"

Shortcut/Trick :Exam-friendly shortcut (if any) ",
  "strategy": "2-3 sentences on approach selection, checkpoints, pitfalls, elimination techniques, and time management.",
  "hint": "One guiding line without revealing the answer",
  "questionTime": 1-30,
  "isNumerical": If Options not Present then add here numerical value otherwise null,
  "isTrueFalse": false|true,
  "commonMistake": "2 Mistakes bullets, each in this format: '- Mistake: <what> | Fix: <instead>\n\n'.",
  "book": "Reference if mentioned",
  "pyqYear": "[Exam Name] Year (e.g., [JEE Main] 2024), null if not mentioned",
  "categories": ["CALCULATION", "APPLICATION", "THEORETICAL", "TRICKY", "FACTUAL", "TRAP", "GUESS_BASED", "MULTI_STEP", "OUT_OF_THE_BOX", "ELIMINATION_BASED", "MEMORY_BASED", "CONFIDENCE_BASED", "CONCEPTUAL", "FORMULA_BASED"],
  "options": [
    {"content": "Option A", "isCorrect": true/false},
    ...
  ]
}

CRITICAL:
• Reply with JSON only (no fences, no extra text, no trailing commas)
• Do NOT put choices inside "content"
• Use $ only for math.`;
}

function createUserPrompt(): string {
  return `Analyze the question image and return ONE JSON object per the OUTPUT CONTRACT. Obey strictly:
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

  if (!data.categories || !Array.isArray(data.categories) || data.categories.length === 0) {
    console.error('At least one category is required');
    return false;
  }

  const validCategories = Object.values(QCategory);
  const validatedCategories = data.categories
    .map(category => {
      const normalizedCategory = category.replace(/\s+/g, '_').toUpperCase();
      if (!validCategories.includes(normalizedCategory)) {
        console.warn(`Skipping invalid category: ${category}. Must be one of: ${validCategories.join(', ')}`);
        return null;
      }
      return normalizedCategory;
    })
    .filter(category => category !== null);

  if (validatedCategories.length === 0) {
    console.error('No valid categories found after filtering');
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

    const sanitized = fixedBackslashes.replace(/\u0000/g, '');

    return JSON.parse(sanitized);
  } catch (e) {
    console.error('tryParseQuestionJson failed after sanitation:', e);
    return null;
  }
}

function stripCodeFences(text: string): string {
  return text.replace(/```[a-zA-Z]*\n([\s\S]*?)```/g, '$1').trim();
}

function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function fixInvalidBackslashes(jsonLike: string): string {
  return jsonLike.replace(/\\(?!["\\\/bfnrtu])/g, '\\\\');
}
