import OpenAI from "openai";
import ServerConfig from "@/config/server.config";
import { createSystemPrompt, createUserPrompt } from "./utils/prompt-builder";
import { tryParseQuestionJson } from "./utils/json-parser";
import {
  QuestionData,
  validateQuestionData,
  validateQuestionLatexSymbols,
} from "./utils/question-validator";

const openai = new OpenAI({
  apiKey: ServerConfig.openai.api_key,
});

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
