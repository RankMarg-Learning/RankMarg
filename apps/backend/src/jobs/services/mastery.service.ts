import prisma from "@repo/db";
import { MetricType, Role } from "@repo/db/enums";
import { MasteryProcessor } from "../../services/mastery/MasteryProcessor";
import { BaseJobService, UserBatch, JobConfig } from "./BaseJobService";
import { captureServiceError } from "../../lib/sentry";

export class MasteryService extends BaseJobService {
  private MasteryProcessor: MasteryProcessor;

  constructor(config: Partial<JobConfig> = {}) {
    super({
      batchSize: 50,
      concurrencyLimit: 5,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCaching: true,
      cacheTimeout: 5 * 60 * 1000,
      ...config,
    });
    this.MasteryProcessor = new MasteryProcessor();
  }

  protected async getTotalUserCount(): Promise<number> {
    return await prisma.examUser.count({
      where: {
        user: { isActive: true },
      },
    });
  }

  protected async getUserBatch(
    batchSize: number,
    offset: number
  ): Promise<UserBatch[]> {
    const users = await prisma.examUser.findMany({
      select: {
        userId: true,
        exam: { select: { code: true } },
        user: { select: { isActive: true, updatedAt: true } },
      },
      where: {
        user: { isActive: true , role: { notIn: [Role.ADMIN, Role.INSTRUCTOR] } },
      },
      skip: offset,
      take: batchSize,
      orderBy: { registeredAt: "desc" },
    });

    return users.map((eu) => ({
      userId: eu.userId,
      examCode: eu.exam.code,
      user: eu.user,
    }));
  }

  protected async processOneUser(user: UserBatch): Promise<void> {
    const { userId, examCode } = user;

    // Update user mastery
    await this.MasteryProcessor.updateUserMastery(userId, examCode);

    // Update metrics for all metric types in parallel
    await Promise.all(
      Object.keys(MetricType).map(async (key) => {
        const metricType = MetricType[key as keyof typeof MetricType];
        await this.UpdateMetrics(userId, metricType);
      })
    );
  }

  public async processOneUserPublic({
    userId,
    examCode,
  }: {
    userId: string;
    examCode: string;
  }): Promise<void> {
    await this.processOneUser({ userId, examCode: examCode });
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
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "MasteryService",
          method: "UpdateMetrics",
          userId,
          additionalData: {
            metricType,
          },
        });
      }
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
}
