import prisma from "../../lib/prisma";
import {
  MasteryAttempt,
  UserProfileData,
  PerformanceTrend,
} from "../../type/mastery.api.types";
import { subDays, startOfDay } from "date-fns";

export class AttemptsProcessor {
  async attempts(userId: string, cutoffDate: Date): Promise<MasteryAttempt[]> {
    const attempts = await prisma.attempt.findMany({
      where: {
        userId,
        solvedAt: { gte: cutoffDate },
      },
      select: {
        userId: true,
        timing: true,
        reactionTime: true,
        type: true,
        status: true,
        hintsUsed: true,
        solvedAt: true,
        mistake: true,
        question: {
          select: {
            id: true,
            difficulty: true,
            questionTime: true,
            subtopicId: true,
            topicId: true,
            subjectId: true,
          },
        },
      },
      orderBy: { solvedAt: "desc" },
    });

    // Transform to match MasteryAttempt interface
    return attempts.map((attempt) => ({
      ...attempt,
      mistake: attempt.mistake || undefined, // Convert null to undefined
    }));
  }

  async getUserProfile(userId: string): Promise<UserProfileData> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        stream: true,
        targetYear: true,
        studyHoursPerDay: true,
        questionsPerDay: true,
        grade: true,
        xp: true,
        coins: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    return {
      ...user,
      isActive: user.isActive ?? true, // Provide default value for null
    };
  }

  async getPerformanceTrend(
    userId: string,
    timeWindow: number
  ): Promise<PerformanceTrend> {
    const cutoffDate = startOfDay(subDays(new Date(), timeWindow));
    const weekAgo = startOfDay(subDays(new Date(), 7));
    const monthAgo = startOfDay(subDays(new Date(), 30));

    // Get recent attempts for trend analysis
    const recentAttempts = await prisma.attempt.findMany({
      where: {
        userId,
        solvedAt: { gte: cutoffDate },
      },
      select: {
        status: true,
        timing: true,
        solvedAt: true,
      },
      orderBy: { solvedAt: "desc" },
    });

    // Get historical data for comparison
    const weekAttempts = await prisma.attempt.findMany({
      where: {
        userId,
        solvedAt: { gte: weekAgo, lt: cutoffDate },
      },
      select: {
        status: true,
        timing: true,
      },
    });

    const monthAttempts = await prisma.attempt.findMany({
      where: {
        userId,
        solvedAt: { gte: monthAgo, lt: weekAgo },
      },
      select: {
        status: true,
        timing: true,
      },
    });

    // Calculate recent accuracy
    const recentCorrect = recentAttempts.filter(
      (a) => a.status === "CORRECT"
    ).length;
    const recentAccuracy =
      recentAttempts.length > 0 ? recentCorrect / recentAttempts.length : 0;

    // Calculate week accuracy
    const weekCorrect = weekAttempts.filter(
      (a) => a.status === "CORRECT"
    ).length;
    const weekAccuracy =
      weekAttempts.length > 0 ? weekCorrect / weekAttempts.length : 0;

    // Calculate month accuracy
    const monthCorrect = monthAttempts.filter(
      (a) => a.status === "CORRECT"
    ).length;
    const monthAccuracy =
      monthAttempts.length > 0 ? monthCorrect / monthAttempts.length : 0;

    // Calculate trends
    const accuracyTrend = recentAccuracy - weekAccuracy;
    const speedTrend = this.calculateSpeedTrend(recentAttempts, weekAttempts);
    const consistencyScore = this.calculateConsistencyScore(recentAttempts);
    const improvementRate = this.calculateImprovementRate(
      recentAccuracy,
      weekAccuracy,
      monthAccuracy
    );

    return {
      recentAccuracy,
      accuracyTrend,
      speedTrend,
      consistencyScore,
      improvementRate,
      lastWeekPerformance: weekAccuracy,
      lastMonthPerformance: monthAccuracy,
    };
  }

  private calculateSpeedTrend(
    recentAttempts: any[],
    weekAttempts: any[]
  ): number {
    const recentAvgTime =
      recentAttempts.length > 0
        ? recentAttempts.reduce((sum, a) => sum + (a.timing || 0), 0) /
          recentAttempts.length
        : 0;

    const weekAvgTime =
      weekAttempts.length > 0
        ? weekAttempts.reduce((sum, a) => sum + (a.timing || 0), 0) /
          weekAttempts.length
        : 0;

    if (weekAvgTime === 0) return 0;
    return (weekAvgTime - recentAvgTime) / weekAvgTime; // Positive = faster, Negative = slower
  }

  private calculateConsistencyScore(attempts: any[]): number {
    if (attempts.length < 2) return 1.0;

    const accuracies = [];
    const batchSize = Math.max(1, Math.floor(attempts.length / 5));

    for (let i = 0; i < attempts.length; i += batchSize) {
      const batch = attempts.slice(i, i + batchSize);
      const correct = batch.filter((a) => a.status === "CORRECT").length;
      accuracies.push(correct / batch.length);
    }

    if (accuracies.length < 2) return 1.0;

    // Calculate standard deviation of accuracies
    const mean =
      accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    const variance =
      accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) /
      accuracies.length;
    const stdDev = Math.sqrt(variance);

    // Convert to consistency score (0-1, higher is more consistent)
    return Math.max(0, 1 - stdDev);
  }

  private calculateImprovementRate(
    recent: number,
    week: number,
    month: number
  ): number {
    if (week === 0) return 0;
    if (month === 0) return (recent - week) / week;

    const recentWeekRate = (recent - week) / week;
    const weekMonthRate = (week - month) / month;

    return (recentWeekRate + weekMonthRate) / 2;
  }

  organizeAttempts(attempts: MasteryAttempt[]) {
    const subtopicAttempts = new Map<string, MasteryAttempt[]>();
    const topicAttempts = new Map<string, MasteryAttempt[]>();
    const subjectAttempts = new Map<string, MasteryAttempt[]>();

    const subtopicIds = new Set<string>();
    const topicIds = new Set<string>();
    const subjectIds = new Set<string>();

    for (const attempt of attempts) {
      const { question } = attempt;

      // Organize by subtopic (primary)
      if (question.subtopicId) {
        subtopicIds.add(question.subtopicId);
        if (!subtopicAttempts.has(question.subtopicId)) {
          subtopicAttempts.set(question.subtopicId, []);
        }
        subtopicAttempts.get(question.subtopicId)?.push(attempt);
      }

      // Organize by topic (fallback or additional)
      if (question.topicId) {
        topicIds.add(question.topicId);
        if (!topicAttempts.has(question.topicId)) {
          topicAttempts.set(question.topicId, []);
        }
        topicAttempts.get(question.topicId)?.push(attempt);
      }

      // Organize by subject (fallback or additional)
      if (question.subjectId) {
        subjectIds.add(question.subjectId);
        if (!subjectAttempts.has(question.subjectId)) {
          subjectAttempts.set(question.subjectId, []);
        }
        subjectAttempts.get(question.subjectId)?.push(attempt);
      }
    }

    return {
      subtopicAttempts,
      topicAttempts,
      subjectAttempts,
      subtopicIds,
      topicIds,
      subjectIds,
    };
  }

  // Enhanced method to handle questions without subtopicId
  async getQuestionHierarchy(questionIds: string[]) {
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: {
        id: true,
        subtopicId: true,
        topicId: true,
        subjectId: true,
        subTopic: {
          select: {
            id: true,
            name: true,
            topicId: true,
            topic: {
              select: {
                id: true,
                name: true,
                subjectId: true,
                subject: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        topic: {
          select: {
            id: true,
            name: true,
            subjectId: true,
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const hierarchyMap = new Map();

    for (const question of questions) {
      const hierarchy = {
        questionId: question.id,
        subtopic: question.subTopic
          ? {
              id: question.subTopic.id,
              name: question.subTopic.name,
              topicId: question.subTopic.topicId,
            }
          : null,
        topic: question.topic
          ? {
              id: question.topic.id,
              name: question.topic.name,
              subjectId: question.topic.subjectId,
            }
          : null,
        subject: question.subject
          ? {
              id: question.subject.id,
              name: question.subject.name,
            }
          : null,
      };

      hierarchyMap.set(question.id, hierarchy);
    }

    return hierarchyMap;
  }
}
