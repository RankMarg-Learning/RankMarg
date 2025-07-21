import { SYSTEM_PROMPT } from "@/constant/agent.constant";
import OpenAI from "openai";
import { AttemptService } from "./attempt.service";
import { PerformanceSummary } from "@/type/attempt.type";
import { AgentResponse, connectMongo } from "@repo/db-mongo";
import {
  AgentConfig,
  AgentError,
  AgentMetrics,
  AgentProcessingOptions,
  AgentResponseDB,
  BatchProcessingOptions,
} from "@/type/agent.type";
import prisma from "@/lib/prisma";

export class AgentConfigService {
  private static readonly MODEL_CONFIGS: Record<string, AgentConfig> = {
    "gpt-4o-mini": {
      model: "gpt-4o-mini",
      maxTokens: 700,
      temperature: 0.1,
      maxRetries: 3,
      retryDelay: 1000,
    },
    "gpt-4o": {
      model: "gpt-4o",
      maxTokens: 700,
      temperature: 0.1,
      maxRetries: 3,
      retryDelay: 1000,
    },
    "gpt-3.5-turbo": {
      model: "gpt-3.5-turbo",
      maxTokens: 700,
      temperature: 0.1,
      maxRetries: 2,
      retryDelay: 500,
    },
  };

  private static readonly PLAN_MODEL_ACCESS: Record<string, string[]> = {
    BASIC: ["gpt-4o-mini"],
    PREMIUM: ["gpt-3.5-turbo", "gpt-4o-mini"],
    ENTERPRISE: ["gpt-3.5-turbo", "gpt-4o-mini", "gpt-4o"],
  };

  public static getConfigForStudent(
    studentId: string,
    planType: string = "BASIC"
  ): AgentConfig {
    const availableModels =
      this.PLAN_MODEL_ACCESS[planType] || this.PLAN_MODEL_ACCESS.BASIC;
    const preferredModel = availableModels[availableModels.length - 1];

    return (
      this.MODEL_CONFIGS[preferredModel] || this.MODEL_CONFIGS["gpt-3.5-turbo"]
    );
  }

  public static getAllConfigs(): Record<string, AgentConfig> {
    return { ...this.MODEL_CONFIGS };
  }
}

export class AgentService {
  private openai: OpenAI;
  private metrics!: AgentMetrics;
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
    this.initializeDatabase();
    this.resetMetrics();
  }
  private async initializeDatabase(): Promise<void> {
    try {
      await connectMongo();
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw new Error("Failed to connect to database");
    }
  }
  private resetMetrics(): void {
    this.metrics = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      processingTime: 0,
      errors: [],
    };
  }

  public async processStudentAnalysis(
    options: AgentProcessingOptions
  ): Promise<AgentResponseDB | null> {
    const startTime = Date.now();
    try {
      const { studentId, startDate, endDate, forceReprocess = false } = options;
      const config = AgentConfigService.getConfigForStudent(studentId, "BASIC");

      const analysis = await this.generateStudentAnalysis(
        studentId,
        startDate,
        endDate,
        config
      );

      if (analysis) {
        await this.storeAnalysisResults(analysis);
        this.metrics.successful++;
      }

      this.metrics.totalProcessed++;
      this.metrics.processingTime += Date.now() - startTime;

      return analysis;
    } catch (error) {
      this.handleProcessingError(options.studentId, error as Error);
      return null;
    }
  }

  private async getTotalStudentsCount(): Promise<number> {
    return (await prisma.user.count()) || 100;
  }

  public async processAllStudents(): Promise<AgentMetrics> {
    const batchSize = 50;
    const concurrency = 3;
    let offset = 0;

    this.resetMetrics();
    const totalStartTime = Date.now();

    try {
      const totalStudents = await this.getTotalStudentsCount();
      console.log(`Starting processing for ${totalStudents} students`);

      while (offset < totalStudents) {
        console.log(
          `Processing batch: ${offset + 1} - ${Math.min(offset + batchSize, totalStudents)}`
        );

        const batchMetrics = await this.processStudentBatch({
          batchSize,
          offset,
          concurrency,
          skipRecentlyProcessed: true,
          hoursThreshold: 96,
        });

        // Aggregate metrics
        this.aggregateMetrics(batchMetrics);

        offset += batchSize;

        // Log progress
        this.logProgress(offset, totalStudents);

        // Delay between batches to prevent overwhelming the system
        await this.sleep(1000);
      }

      this.metrics.processingTime = Date.now() - totalStartTime;

      console.log("Processing completed:", this.metrics);
      return this.metrics;
    } catch (error) {
      console.error("Error processing all students:", error);
      throw error;
    }
  }

  public async processStudentBatch(
    options: BatchProcessingOptions
  ): Promise<AgentMetrics> {
    const {
      batchSize,
      offset,
      concurrency = 3,
      skipRecentlyProcessed = true,
      hoursThreshold = 96,
    } = options;

    this.resetMetrics();
    const startTime = Date.now();

    try {
      const students = await this.getStudentsForProcessing(
        batchSize,
        offset,
        skipRecentlyProcessed,
        hoursThreshold
      );

      if (students.length === 0) {
        console.log("No students found for processing");
        return this.metrics;
      }

      // Process students in concurrent batches
      const chunks = this.chunkArray(students, concurrency);

      for (const chunk of chunks) {
        const promises = chunk.map((student) =>
          this.processStudentAnalysis({
            studentId: student.id,
            startDate: this.getAnalysisStartDate(),
            endDate: this.getAnalysisEndDate(),
          }).catch((error) => {
            this.handleProcessingError(student.id, error);
            return null;
          })
        );

        await Promise.all(promises);

        // Small delay between batches to avoid rate limiting
        await this.sleep(500);
      }

      this.metrics.processingTime = Date.now() - startTime;
      return this.metrics;
    } catch (error) {
      console.error("Error in batch processing:", error);
      throw error;
    }
  }

  private async generateStudentAnalysis(
    studentId: string,
    startDate: Date,
    endDate: Date,
    config: AgentConfig
  ): Promise<AgentResponseDB | null> {
    const start = Date.now();
    try {
      const promptResponse = await this.buildAnalysisPrompt(
        studentId,
        startDate,
        endDate
      );

      if (!promptResponse.prompt || promptResponse.dataInsufficient) {
        console.log(
          `Insufficient data for student ${studentId}. Skipping analysis.`
        );
        return null;
      }

      const response = await this.openai.chat.completions.create({
        model: config.model,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: promptResponse.prompt,
          },
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      });

      const content = response.choices[0].message.content;
      const usage = response.usage;

      if (usage) {
        this.metrics.totalTokensUsed += usage.total_tokens;
      }
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      const parsedResponse = this.parseAgentResponse(content);

      return {
        studentId,
        startDate,
        endDate,
        subtopics: parsedResponse.subtopics,
        overall_strategies: parsedResponse.overall_strategies || [],
        metadata: {
          model: config.model,
          promptTokens: usage?.prompt_tokens || 0,
          completionTokens: usage?.completion_tokens || 0,
          latencyMs: Date.now() - start,
          generatedAt: new Date(),
          version: "2.0.0",
        },
      };
    } catch (error) {
      console.error(
        `Error generating analysis for student ${studentId}:`,
        error
      );
      throw error;
    }
  }

  private async storeAnalysisResults(analysis: AgentResponseDB): Promise<void> {
    try {
      const response = new AgentResponse(analysis);
      await response.save();
      console.log(`Analysis stored for student ${analysis.studentId}`);
    } catch (error) {
      console.error("Error storing analysis:", error);
      throw error;
    }
  }
  private parseAgentResponse(content: string): any {
    try {
      const cleanContent = content
        .replace(/^```json/, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();

      return JSON.parse(cleanContent);
    } catch (error) {
      console.error("Error parsing agent response:", error);
      throw new Error("Invalid JSON response from agent");
    }
  }
  private handleProcessingError(studentId: string, error: Error): void {
    const agentError: AgentError = {
      studentId,
      error: error.message,
      timestamp: new Date(),
      retryCount: 0,
    };

    this.metrics.errors.push(agentError);
    this.metrics.failed++;

    console.error(`Processing error for student ${studentId}:`, error.message);
  }

  private async buildAnalysisPrompt(
    studentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ prompt?: string; dataInsufficient?: boolean }> {
    try {
      const service = new AttemptService(studentId, startDate, endDate);
      const performanceSummary: PerformanceSummary =
        await service.AIAgentDailyPerformanceSTRUC();

      if (Object.keys(performanceSummary.subtopic).length < 5) {
        return { prompt: "", dataInsufficient: true };
      }

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

      return { prompt, dataInsufficient: false };
    } catch (error) {
      console.error("Error building prompt:", error);
      return { prompt: "", dataInsufficient: true };
    }
  }
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async getStudentsForProcessing(
    limit: number,
    offset: number,
    skipRecentlyProcessed: boolean,
    hoursThreshold: number
  ): Promise<{ id: string }[]> {
    const mockStudents = await prisma.user.findMany({
      skip: offset,
      take: limit,
      where: {
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    // if (skipRecentlyProcessed) {
    //   const recentResponses = await AgentResponse.find({
    //     studentId: { $in: mockStudents.map((s) => s.id) },
    //     metadata: {
    //       generatedAt: {
    //         $gte: this.getAnalysisStartDate(),
    //         $lte: this.getAnalysisEndDate(),
    //       },
    //     },
    //   });

    //   const recentlyProcessedIds = new Set(
    //     recentResponses.map((r) => r.studentId)
    //   );

    //   return mockStudents.filter((s) => !recentlyProcessedIds.has(s.id));
    // }
    return mockStudents;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  private getAnalysisStartDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 7); // 7 days ago
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private getAnalysisEndDate(): Date {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  }

  private logProgress(current: number, total: number): void {
    const percentage = ((current / total) * 100).toFixed(2);
    console.log(`Progress: ${current}/${total} (${percentage}%)`);
  }
  private aggregateMetrics(batchMetrics: AgentMetrics): void {
    this.metrics.totalProcessed += batchMetrics.totalProcessed;
    this.metrics.successful += batchMetrics.successful;
    this.metrics.failed += batchMetrics.failed;
    this.metrics.totalTokensUsed += batchMetrics.totalTokensUsed;
    this.metrics.totalCost += batchMetrics.totalCost;
    this.metrics.errors.push(...batchMetrics.errors);
  }
}
