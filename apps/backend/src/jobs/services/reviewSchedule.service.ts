import prisma from "@repo/db";
import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";
import { masteryConfig } from "../../services/mastery/MasteryConfig";
import { BaseJobService, UserBatch, JobConfig } from "./BaseJobService";

interface ReviewSchedulingInput {
  masteryLevel: number;
  strengthIndex: number;
  lastReviewedAt: Date;
  completedReviews: number;
  retentionStrength: number;
  examCode: string;
}

export class ReviewScheduleService extends BaseJobService {
  private readonly baseIntervalDays = 1;
  private readonly maxIntervalDays = 60;
  private readonly diminishingReturnsAfterDays = 7;
  private readonly diminishingFactor = 0.9;
  private readonly strengthWeight = 0.15;

  constructor(config: Partial<JobConfig> = {}) {
    super({
      batchSize: 100,
      concurrencyLimit: 10,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCaching: true,
      cacheTimeout: 5 * 60 * 1000,
      ...config,
    });
  }

  protected async getTotalUserCount(): Promise<number> {
    return await prisma.topicMastery.count();
  }

  protected async getUserBatch(
    batchSize: number,
    offset: number
  ): Promise<UserBatch[]> {
    const userTopicPairs = await prisma.topicMastery.findMany({
      select: { userId: true, topicId: true },
      skip: offset,
      take: batchSize,
      orderBy: { id: "asc" },
    });

    return userTopicPairs.map((pair) => ({
      userId: pair.userId,
      topicId: pair.topicId,
    }));
  }

  protected async processOneUser(user: UserBatch): Promise<void> {
    await this.updateReviewSchedule(user.userId, user.topicId);
  }

  public computeNextReviewSchedule(params: ReviewSchedulingInput): {
    nextReviewAt: Date;
    reviewInterval: number;
  } {
    const {
      masteryLevel,
      strengthIndex,
      lastReviewedAt,
      completedReviews,
      retentionStrength,
      examCode,
    } = params;

    const streamCfg = masteryConfig.getExamConfig(examCode);

    const baseMultiplier =
      1 + masteryLevel / 20 + streamCfg.masteryThresholdAdjustment;

    const strengthBonus = strengthIndex * this.strengthWeight;

    const reviewsBonus =
      completedReviews > 0 ? Math.log10(completedReviews + 1) * 0.3 : 0;

    const retentionFactor = 1 + Math.min(Math.max(retentionStrength, 0), 1) / 2;

    let intervalDays = this.baseIntervalDays * baseMultiplier * retentionFactor;
    intervalDays *= 1 + strengthBonus + reviewsBonus;

    if (intervalDays > this.diminishingReturnsAfterDays) {
      intervalDays =
        this.diminishingReturnsAfterDays +
        (intervalDays - this.diminishingReturnsAfterDays) *
          this.diminishingFactor;
    }

    const finalInterval = Math.min(
      Math.max(Math.round(intervalDays), 1),
      this.maxIntervalDays
    );
    const nextReviewAt = addDays(startOfDay(lastReviewedAt), finalInterval);

    return { nextReviewAt, reviewInterval: finalInterval };
  }

  public computeRetentionStrength(
    correctAttempts: number,
    totalAttempts: number,
    avgTime: number,
    examCode: string
  ): number {
    if (totalAttempts === 0) return 0.5;

    const idealTime =
      masteryConfig.getExamConfig(examCode).idealTimePerQuestion;

    const accuracy = correctAttempts / totalAttempts; // [0,1]
    const timeRatio = idealTime / Math.max(avgTime, 1); // > 0, higher is better
    const timeEfficiency = Math.min(Math.max(timeRatio, 0), 1); // clamp [0,1]

    const retention = accuracy * 0.7 + timeEfficiency * 0.3;
    return Math.min(Math.max(retention, 0), 1);
  }

  public computeRecallProbability(
    retentionStrength: number,
    daysSinceReview: number
  ): number {
    // Convert retention strength into an effective decay rate using the forgetting curve
    const baseDecay = masteryConfig.forgettingCurveParams.decayRate; // e.g., 0.1
    const adjustedDecay = Math.max(baseDecay * (1 - retentionStrength), 0.01);
    const probability = Math.exp(-adjustedDecay * Math.max(daysSinceReview, 0));
    return Math.min(Math.max(probability, 0), 1);
  }

  public async updateSchedulesForUser(userId: string): Promise<void> {
    const topics = await prisma.topicMastery.findMany({
      where: { userId },
      select: { topicId: true },
    });

    const concurrency = 10;
    for (let i = 0; i < topics.length; i += concurrency) {
      const chunk = topics.slice(i, i + concurrency);
      await Promise.all(
        chunk.map(({ topicId }) => this.updateReviewSchedule(userId, topicId))
      );
    }
  }

  public async updateReviewSchedule(userId: string, topicId: string) {
    const cacheKey = `review_schedule_${userId}_${topicId}`;

    const scheduleData = await this.getCachedData(cacheKey, async () => {
      const [topicMastery, currentSchedule, user] = await Promise.all([
        prisma.topicMastery.findUnique({
          where: { userId_topicId: { userId, topicId } },
        }),
        prisma.reviewSchedule.findUnique({
          where: { userId_topicId: { userId, topicId } },
        }),
        prisma.examUser.findFirst({
          where: { userId },
          select: { exam: { select: { code: true } } },
          orderBy: { registeredAt: "desc" },
        }),
      ]);

      return { topicMastery, currentSchedule, user };
    });

    const { topicMastery, currentSchedule, user } = scheduleData;

    if (!topicMastery) {
      throw new Error(
        `No mastery data found for user ${userId} and topic ${topicId}`
      );
    }

    const examCode = user?.exam.code || "DEFAULT";

    const now = new Date();
    let lastReviewedAt = now;
    let completedReviews = 0;
    let retentionStrength = currentSchedule?.retentionStrength ?? 0.5;

    if (currentSchedule) {
      lastReviewedAt = currentSchedule.lastReviewedAt;
      completedReviews = currentSchedule.completedReviews;
    }

    const attempts = await prisma.attempt.findMany({
      where: { userId, question: { topicId } },
      orderBy: { solvedAt: "desc" },
      take: 30,
      select: { status: true, timing: true, solvedAt: true },
    });

    const totalTime = attempts.reduce((sum, a) => sum + (a.timing || 0), 0);
    const avgTime =
      attempts.length > 0
        ? totalTime / attempts.length
        : masteryConfig.getExamConfig(examCode).idealTimePerQuestion;
    const correctAttempts = attempts.filter(
      (a) => a.status === "CORRECT"
    ).length;

    if (attempts.length > 0) {
      retentionStrength = this.computeRetentionStrength(
        correctAttempts,
        attempts.length,
        avgTime,
        examCode
      );
    }

    // Optional: adjust using forgetting curve since last review
    const daysSinceReview = differenceInCalendarDays(now, lastReviewedAt);
    const recallProbability = this.computeRecallProbability(
      retentionStrength,
      daysSinceReview
    );
    // Nudge interval slightly based on recallProbability (higher recall -> longer interval)
    const retentionAdjusted = Math.min(
      1,
      Math.max(0, retentionStrength * 0.8 + recallProbability * 0.2)
    );

    const review = this.computeNextReviewSchedule({
      masteryLevel: topicMastery.masteryLevel,
      strengthIndex: topicMastery.strengthIndex,
      lastReviewedAt,
      completedReviews,
      retentionStrength: retentionAdjusted,
      examCode,
    });

    return prisma.reviewSchedule.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: {
        nextReviewAt: review.nextReviewAt,
        reviewInterval: review.reviewInterval,
        retentionStrength,
      },
      create: {
        userId,
        topicId,
        lastReviewedAt,
        nextReviewAt: review.nextReviewAt,
        reviewInterval: review.reviewInterval,
        retentionStrength,
        completedReviews: 0,
      },
    });
  }
}
