import { SYSTEM_PROMPT } from "@/constant/agent.constant";
import OpenAI from "openai";
import { AttemptService } from "./attempt.service";
import { PerformanceSummary } from "@/type/attempt.type";

export class AgentService {
  private openai: OpenAI;
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }
  public async initAgent() {
    try {
      console.log("Initializing agent...");
      const response = await this.agentMain();
      if (response) {
        console.log("Agent initialized successfully:", response);
      } else {
        console.error("Agent initialization failed.");
      }
    } catch (error) {
      console.error("Error initializing agent:", error);
    }
  }

  private async agentMain(): Promise<string | null> {
    try {
      const prompt = await this.buildPrompt();
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error in agent thinking process:", error);
      return null;
    }
  }

  private async buildPrompt(): Promise<string> {
    try {
      const service = new AttemptService(
        "9deda5b8-9fd4-4195-9f34-0494215255fd",
        new Date("2025-06-24T00:00:00Z"),
        new Date("2025-06-27T23:59:59Z")
      );
      const performanceSummary: PerformanceSummary =
        await service.AIAgentDailyPerformanceSTRUC();

      const prompt = `You are an expert JEE/NEET coach. The student is preparing for JEE/NEET and needs to improve their performance in specific subtopics. Your goal is to provide a detailed and actionable analysis that will help the student focus on their weak areas and improve their overall performance. 
        Yesterday’s summary:
total: ${performanceSummary.total_questions},
subtopics JSON: ${JSON.stringify(performanceSummary.subtopic)},
mistakes JSON: ${JSON.stringify(performanceSummary.mistake_recorded)},
test: ${performanceSummary.isTestGiven ? "Yes" : "No"}  
        
        Identify each subtopic where student has significant issues based on the following criteria:
            1. Subtopics with more than 3 questions answered incorrectly.
            2. Subtopics with an average timing greater than 90 seconds per question.
            3. Subtopics with more than 2 hints used on average per question.
        Provide a detailed analysis of these subtopics, including:
            - The number of questions answered incorrectly.
            - The average timing per question.
            - The average number of hints used per question.
        Provide a comprehensive strategy to improve the student's performance in these subtopics, including:
            - Recommended study materials.
            - Tips for mastering the concepts.
        Provide the analysis in a structured format, including:
            - Subtopic name
            - Number of questions answered incorrectly
            - Average timing per question
            - Average number of hints used per question
            - Recommended study materials from Known resources 
            - Tips for mastering the concepts
        Use the following format for your response:
        \`\`\`json
        {
          "subtopics": [
            {
              "name": "Subtopic Name",
              "incorrect_count": 0,
              "avg_timing": 0,
              "avg_hints_used": 0,
              "study_materials": ["Material 1", "Material 2"],
              "tips": ["Tip 1", "Tip 2"]
            }
          ],
          "overall_strategies":[ "Strategy 1", "Strategy 2"]
        }
        \`\`\`
        Ensure that your analysis is clear, concise, and actionable.
        Use the provided performance summary to guide your analysis and recommendations.
        
        `;

      return prompt;
    } catch (error) {
      console.error("Error building prompt:", error);
      return "Error building prompt";
    }
  }
}

// const service = new AttemptService(
//   "9deda5b8-9fd4-4195-9f34-0494215255fd",
//   new Date("2025-06-18T00:00:00Z"),
//   new Date("2025-06-27T23:59:59Z")
// );
// const performanceSummary = service.AIAgentDailyPerformanceSTRUC();
// console.log(performanceSummary);
