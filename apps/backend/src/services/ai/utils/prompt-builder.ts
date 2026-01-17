/**
 * Prompt Builder Utility
 * Handles creation of system and user prompts for GPT Vision API
 * 
 * This module constructs comprehensive prompts for the GPT-4 Vision model to analyze
 * question images and generate structured question data for NEET/JEE preparation.
 */

/**
 * Subject information interface
 */
interface Subject {
  id: string;
  name: string;
}

/**
 * Subtopic information interface
 */
interface Subtopic {
  id: string;
  name: string;
}

/**
 * Generates difficulty guidelines based on the subject
 * @param subjectName - Name of the subject (Physics, Chemistry, Biology, Mathematics)
 * @returns Formatted difficulty guidelines string
 */
function getDifficultyGuidelines(subjectName: string): string {
  switch (subjectName) {
    case "Physics":
      return `
  - 1 (Easy): Direct formula substitution, single concept, <40 sec.  
  - 2 (Medium): One concept with algebra/trig manipulation, ~1 min. 
  - 3 (Hard): Multi-step, 2 concepts linked (e.g., friction + NLM), ~1–2 min. 
  - 4 (Very Hard): Multi-concept integration, calculus/advanced logic, >3 min.
  `;

    case "Chemistry":
      return `
    - 1 (Easy): Direct NCERT fact, definition, or formula-based numerical, <25 sec.
    - 2 (Medium): Single concept with straightforward calculation/reasoning, ~1 min.
    - 3 (Hard): Multi-step problem, requires linking 2 concepts (e.g., thermodynamics + equilibrium, hybridisation + resonance), ~1–2 min.
    - 4 (Very Hard): Multi-concept integration, lengthy calculations, tricky exceptions or advanced mechanisms, >2–3 min.    
    `;

    case "Biology":
      return `
      - 1 (Easy):Direct NCERT fact or definition recall (one-line answer), <15 sec.
      - 2 (Medium): Single concept application (flow/process-based, e.g., respiration step order), ~25 sec–45 sec
      - 3 (Hard): Twisted recall, multi-step reasoning (e.g., exceptions in taxonomy, genetic cross with 2 traits),~1 min
      - 4 (Very Hard): Case-based/multi-concept integration (e.g., ecology + genetics, applied physiology), >1–2 min. 
    `;

    case "Mathematics":
      return `
      - 1 (Easy): Direct formula/application, single-step calculation (e.g., simple algebra or direct differentiation), <40 sec.
      - 2 (Medium): One concept with algebra/trig/logarithm manipulation, ~1 min.
      - 3 (Hard): Multi-step problem, requires linking 2 concepts (e.g., calculus + coordinate geometry, algebra + probability), ~1–2 min.
      - 4 (Very Hard): Multi-concept integration, lengthy proofs/advanced calculus or combinatorics, >2–3 min.
      `;

    default:
      return `
    - 1 (Easy): Direct formula substitution, single concept, <40 sec.  
    - 2 (Medium): One concept with algebra/trig manipulation, ~1 min. 
    - 3 (Hard): Multi-step, 2 concepts linked (e.g., friction + NLM), ~1–2 min. 
    - 4 (Very Hard): Multi-concept integration, calculus/advanced logic, >3 min.
  `;
  }
}

/**
 * Generates subject-specific format rules
 * @param subjectName - Name of the subject
 * @returns Subject-specific format rules
 */
function getSubjectSpecificFormatRules(subjectName: string): string {
  const rules: string[] = [];

  if (subjectName === "Chemistry") {
    rules.push("- Transform all element-symbol in render format.(e.g. CO2 -> $CO_2$,SO_4^{-1} -> $SO_4^{-1}$)");
  }

  if (subjectName === "Mathematics") {
    rules.push("- Transform difficult latex symbols in unicode format.(e.g. Instead of  \\neq give direct ≠ , \\notin -> ∉)");
  }

  return rules.join("\n");
}

/**
 * Generates solution generation rules based on subject
 * @param subjectName - Name of the subject
 * @returns Solution generation instructions
 */
function getSolutionRules(subjectName: string): string {
  switch (subjectName) {
    case "Physics":
      return `
    [NOTE]: USE MINIMUM THEORETICAL EXPLANATION AND ONLY SHOW THE CALCULATION STEPS.
  - Given data: [like, Given: 10kg, 20kg, 30kg...] (If Needed)
  - If solution needed the visualize which helps to solve the question faster and easier (diagram / table / logical diagram/ etc) Describe the diagram inside square brackets so we will generate and add it. (If needed)
  - Establish relevant equations. (If needed)
  - Reason through Physics. (If needed)
  - Solve Mathematics in step by step. (If needed)
  - Final answer with units.
  - Add **Shortcut/Trick:** ONLY if it's different from the strategy and provides unique value. (If Possible)
  - If-Then Scenario [like, If mass doubles then...](If Possible)
  `;

    case "Chemistry":
      return `
      INSTRUCTIONS: 
      [NOTE]: USE MINIMUM THEORETICAL EXPLANATION AND ONLY SHOW IMPORTANT ONES.
        - PROVIDE MINIMUM THEORETICAL EXPLANATION AND ONLY SHOW THE CALCULATION STEPS WHEN PHYSICAL CHEMISTRY QUESTION.
        - PROVIDE POINT WISE FACTS AND REASONING WHEN INORGANIC CHEMISTRY QUESTION.
        - PROVIDE STEPWISE MECHANISM DIAGRAM WITH DIAGRAM VISUALS DESCRIPTION IN SQUARE BRACKETS (eg. [Reaction of CO2 with NaOH forming NaHCO3]) AND FAST RECOGNITION RULES WHEN ORGANIC CHEMISTRY QUESTION (eg. Carboxylation reaction, SN1 reaction, etc).
      - **Shortcut/Trick:** Mention an exam-oriented shortcut ONLY if it's different from the strategy and adds unique value. (If Possible)
        Example: "For Kc < 1, reactants dominate → equilibrium lies left."
      - **Quick Recall:** Add one-line recall rule or pattern for long-term memory(If Possible).
  `;

    case "Biology":
      return `
        -  If solution needed the visualize (diagram / table / etc) Describe the diagram inside square brackets so we will generate and add it. (If needed)
        - Explain the solution step by step through bullets in minimal words and understandable manner.
        - Final answer.
        - Add **Shortcut/Trick:** ONLY if it's different from the strategy and provides unique value. (If Possible)
        - **Did You Know:** Interesting fact related to the topic (If Possible)
        - **Exploratory:** Advanced concept beyond NCERT but connected to question (If Possible)
  `;

    case "Mathematics":
      return `
            [CRITICAL]: ONLY CALCULATION STEPS WITH MINIMAL WORDING - NO LENGTHY EXPLANATIONS.
          - Show direct calculations with proper formatting and step by step until Final answer (Skip trivial arithmetic).
          - Use mathematical notation and equations - avoid wordy explanations.
          - Each step should be clear calculation, not paragraphs of text.
          - **Final Answer:** State the result clearly.
          - Add **Shortcut/Trick:** ONLY if it's different from the strategy and saves significant time. (If Possible)
  `;

    default:
      return "";
  }
}


export function createSystemPrompt(
  subject: Subject,
  topicId: string | null,
  subtopics: Subtopic[]
): string {
  const subtopicsList = subtopics
    .map((st) => `- ${st.name} (ID: ${st.id})`)
    .join("\n");

  const difficultyGuidelines = getDifficultyGuidelines(subject.name);
  const formatRules = getSubjectSpecificFormatRules(subject.name);
  const solutionRules = getSolutionRules(subject.name);

  return `Role: Expert of ${subject.name} NEET/JEE question author for RankMarg. Write ONE exam-ready question and reply ONLY with the JSON below.

SUBJECT: ${subject.name} (ID:${subject.id})
SUBTOPICS:
${subtopicsList}

**Difficulty**:  
(Decide based on the following strict rules and change difficulty according to subject inside ${subject.name} syllabus)  
${difficultyGuidelines}

- If question is based on subject inside ${subject.name} syllabus then change difficulty according to subject inside ${subject.name} syllabus.

STRICT RENDER & FORMAT RULES:
- Tables: GitHub-style with a header row (| Col1 | Col2 | ... |).
- Index-to-space rule wrap with $..$ (e.g. x_i -> $x_i$ or x^{-2} -> $x^{-2}$ and many more)
${formatRules}
- Math delimiters: Use ONLY $...$ for inline and $$ on its own lines for display and use the following format:
    $$
    ....
    $$
    use for calculation steps (Centered) and $$...$$ for logical steps (Not Centered)
- Do NOT use \\( \\) or \\[ \\].
- Use \\dfrac for fractions.
- Use proper bracket format like this: (eg. 1,1 --> (1,1) , f x --> f(x) , etc)
- Control characters or invalid escapes must not appear.
- Don't wrap text inside $..$.
- For New Line content show use \\n\\n

CONTENT vs OPTIONS RULES:
• Only stem in "content"
• Choices in "options" (keep order) with isCorrect
• No A)/B) in stem
• If content has diagram the describe the diagram inside square brackets so we will generate and add it. (If needed)

SOLUTION RULES AND REGULATIONS:
[CRITICAL]: Do NOT include "**Solution:**" heading - start directly with solution content.
- Subheading in bold format like this: (eg. **Shortcut/Trick:** , **Exploratory:** , **Did You Know:** ,**Final Answer:** ,etc)
- IMPORTANT: If Shortcut/Trick is already covered in "strategy" field, DO NOT repeat it in solution.
${solutionRules}


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
  - Good: "Consider which trigonometric identity connects $\\sin^2 \\theta$ and $\\cos^2 \\theta$."
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
• Assign question categories strictly based on the dominant cognitive skill mandatorily required to solve the question, as explicitly intended by the exam syllabus—not by topic, difficulty, or student perception.
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
  "topicId": "${topicId}",
  "subtopicId": "exact_subtopic_id_from_list_above",
  "subjectId": "${subject.id}",
  "solution": "Follow solution generations RULES AND REGULATIONS and always validate the Render & Format Rules. NO '**Solution:**' heading.",
  "strategy": "Explain in 1–3 simple, student-friendly sentences how to approach the question. Point out smart shortcuts, or easy elimination clues if any. Keep the tone encouraging, clear, and exam-focused—no heavy theory."
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

/**
 * Creates a user prompt for GPT-4 Vision
 * 
 * This function generates the user-facing prompt that instructs the AI to
 * analyze the provided question image and return structured JSON.
 * 
 * @param additionalInstructions - Optional additional instructions to append to the prompt
 * @returns User prompt string
 */
export function createUserPrompt(additionalInstructions: string = ""): string {
  let prompt = `Analyze the question image and return ONE JSON object per the OUTPUT CONTRACT. Obey strictly POLICY, CORRECTNESS, RETURN EXACTLY THIS JSON and RENDER & FORMAT RULES:
Return ONLY the JSON object with no extra text.`;

  // Append additional instructions if provided
  if (additionalInstructions) {
    prompt += `\nAdditional instructions: ${additionalInstructions}`;
  }

  return prompt;
}

