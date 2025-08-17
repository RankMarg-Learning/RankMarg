import prisma from "../../lib/prisma";
import { MetricType } from "@repo/db/enums";
import { MasteryProcessor } from "../mastery/MasteryProcessor";

export class MasteryService {
  private MasteryProcessor: MasteryProcessor;

  constructor() {
    this.MasteryProcessor = new MasteryProcessor();
  }

  public async processAllUsers() {
    const batchSize = 50; // Reduced batch size for better performance
    let offset = 0;
    const count = await prisma.examUser.count();

    console.log(`Starting mastery processing for ${count} active users`);

    while (true) {
      if (offset >= count) {
        break;
      }

      try {
        await this.processUserBatch(batchSize, offset);
        console.log(`Processed batch: ${offset + batchSize}/${count} users`);
      } catch (error) {
        console.error(`Error processing batch at offset ${offset}:`, error);
      }

      offset += batchSize;
    }

    console.log("Completed mastery processing for all users");
  }

  public async processUserBatch(batchSize: number, offset: number) {
    // Get active exam-user pairs
    const users = await prisma.examUser.findMany({
      select: {
        userId: true,
        exam: { select: { code: true } },
        user: { select: { isActive: true, updatedAt: true } },
      },
      skip: offset,
      take: batchSize,
      orderBy: { registeredAt: "desc" },
    });

    const processingPromises = users
      .filter((eu) => eu.user?.isActive)
      .map(async (eu) => {
        try {
          await this.processOneUser(eu.userId, eu.exam.code);
        } catch (error) {
          console.error(`Error processing user ${eu.userId}:`, error);
          // Don't throw here to continue processing other users
        }
      });

    // Process users in parallel with concurrency limit
    await this.processWithConcurrencyLimit(processingPromises, 5);
  }

  private async processWithConcurrencyLimit(
    promises: Promise<void>[],
    concurrencyLimit: number
  ) {
    const chunks = [] as Promise<void>[][];
    for (let i = 0; i < promises.length; i += concurrencyLimit) {
      chunks.push(promises.slice(i, i + concurrencyLimit));
    }

    for (const chunk of chunks) {
      await Promise.all(chunk);
    }
  }

  public async processOneUser(userId: string, examCode: string) {
    try {
      // Update user mastery
      await this.MasteryProcessor.updateUserMastery(userId, examCode);

      // Update metrics for all metric types
      await Promise.all(
        Object.keys(MetricType).map(async (key) => {
          const metricType = MetricType[key as keyof typeof MetricType];
          await this.UpdateMetrics(userId, metricType);
        })
      );

      console.log(`Successfully processed user ${userId}`);
    } catch (error) {
      console.error(`Error processing user ${userId}:`, error);
      throw error;
    }
  }

  private async UpdateMetrics(userId: string, metricType: MetricType) {
    try {
      const existingMetric = await prisma.metric.findFirst({
        where: {
          userId,
          metricType,
        },
      });

      let currentValue = 0;

      // Calculate current value based on metric type
      switch (metricType) {
        case MetricType.TOTAL_QUESTIONS:
          currentValue = await this.calculateTotalQuestions(userId);
          break;
        case MetricType.CORRECT_ATTEMPTS:
          currentValue = await this.calculateCorrectAttempts(userId);
          break;
        case MetricType.MASTERY_LEVEL:
          currentValue = await this.calculateAverageMasteryLevel(userId);
          break;
        case MetricType.TEST_SCORE:
          currentValue = await this.calculateAverageTestScore(userId);
          break;
        default:
          currentValue = 0;
      }

      if (existingMetric) {
        await prisma.metric.update({
          where: {
            id: existingMetric.id,
          },
          data: {
            previousValue: existingMetric.currentValue,
            currentValue,
          },
        });
      } else {
        await prisma.metric.create({
          data: {
            userId,
            metricType,
            previousValue: 0,
            currentValue,
          },
        });
      }
    } catch (error) {
      console.error(
        `Error updating metric ${metricType} for user ${userId}:`,
        error
      );
    }
  }

  private async calculateTotalQuestions(userId: string): Promise<number> {
    const result = await prisma.attempt.count({
      where: { userId },
    });
    return result;
  }

  private async calculateCorrectAttempts(userId: string): Promise<number> {
    const result = await prisma.attempt.count({
      where: {
        userId,
        status: "CORRECT",
      },
    });
    return result;
  }

  private async calculateAverageMasteryLevel(userId: string): Promise<number> {
    const subjectMasteries = await prisma.subjectMastery.findMany({
      where: { userId },
      select: { masteryLevel: true },
    });

    if (subjectMasteries.length === 0) return 0;

    const totalMastery = subjectMasteries.reduce(
      (sum, mastery) => sum + mastery.masteryLevel,
      0
    );
    return Math.round(totalMastery / subjectMasteries.length);
  }

  private async calculateAverageTestScore(userId: string): Promise<number> {
    const testParticipations = await prisma.testParticipation.findMany({
      where: {
        userId,
        status: "COMPLETED",
      },
      select: { score: true },
    });

    if (testParticipations.length === 0) return 0;

    const totalScore = testParticipations.reduce(
      (sum, test) => sum + (test.score || 0),
      0
    );
    return Math.round(totalScore / testParticipations.length);
  }

  // Enhanced method to get user mastery summary
  public async getUserMasterySummary(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          grade: true,
        },
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const [subjectMasteries, topicMasteries, subtopicMasteries] =
        await Promise.all([
          prisma.subjectMastery.findMany({
            where: { userId },
            include: {
              subject: {
                select: { name: true },
              },
            },
          }),
          prisma.topicMastery.findMany({
            where: { userId },
            include: {
              topic: {
                select: { name: true },
              },
            },
          }),
          prisma.subtopicMastery.findMany({
            where: { userId },
            include: {
              subtopic: {
                select: { name: true },
              },
            },
          }),
        ]);

      const summary = {
        user,
        subjectMasteries,
        topicMasteries,
        subtopicMasteries,
        overallStats: {
          totalSubjects: subjectMasteries.length,
          totalTopics: topicMasteries.length,
          totalSubtopics: subtopicMasteries.length,
          averageSubjectMastery:
            subjectMasteries.length > 0
              ? Math.round(
                  subjectMasteries.reduce((sum, s) => sum + s.masteryLevel, 0) /
                    subjectMasteries.length
                )
              : 0,
          averageTopicMastery:
            topicMasteries.length > 0
              ? Math.round(
                  topicMasteries.reduce((sum, t) => sum + t.masteryLevel, 0) /
                    topicMasteries.length
                )
              : 0,
          averageSubtopicMastery:
            subtopicMasteries.length > 0
              ? Math.round(
                  subtopicMasteries.reduce(
                    (sum, st) => sum + st.masteryLevel,
                    0
                  ) / subtopicMasteries.length
                )
              : 0,
        },
      };

      return summary;
    } catch (error) {
      console.error(`Error getting mastery summary for user ${userId}:`, error);
      throw error;
    }
  }

  // Method to process specific user with detailed logging
  public async processUserWithLogging(userId: string, examCode: string) {
    console.log(
      `Starting mastery processing for user ${userId} with exam ${examCode}`
    );

    const startTime = Date.now();

    try {
      await this.processOneUser(userId, examCode);

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(
        `Completed mastery processing for user ${userId} in ${duration}ms`
      );

      return { success: true, duration };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.error(
        `Failed mastery processing for user ${userId} after ${duration}ms:`,
        error
      );

      return {
        success: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
