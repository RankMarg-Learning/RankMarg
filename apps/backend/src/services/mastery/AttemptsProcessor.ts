import {
  AttemptType,
  GradeEnum,
  MistakeType,
  SubmitStatus,
} from "@repo/db/enums";
import prisma from "../../lib/prisma";
import {
  MasteryAttempt,
  UserProfileData,
  PerformanceTrend,
} from "../../types/mastery.api.types";
import { subDays, startOfDay } from "date-fns";
import { captureServiceError } from "../../lib/sentry";

export class AttemptsProcessor {
  async attempts(userId: string, cutoffDate: Date): Promise<MasteryAttempt[]> {
    const attempts = await prisma.attempt.findMany({
      where: { userId, solvedAt: { gte: cutoffDate } },
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

    return attempts.map(attempt => ({
      ...attempt,
      status: attempt.status as SubmitStatus,
      type: attempt.type as AttemptType,
      mistake: attempt.mistake as MistakeType,
    }));
  }

  async getUserProfile(userId: string): Promise<UserProfileData> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
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
      const error = new Error(`User ${userId} not found`);
      captureServiceError(error, {
        service: "AttemptsProcessor",
        method: "getUserProfile",
        userId,
      });
      throw error;
    }

    return {
      ...user,
      grade: user.grade as GradeEnum,
      isActive: user.isActive ?? true,
    };
  }

  async getPerformanceTrend(userId: string, timeWindow: number): Promise<PerformanceTrend> {
    const now = new Date();
    const cutoffDate = startOfDay(subDays(now, timeWindow));
    const weekAgo = startOfDay(subDays(now, 7));
    const monthAgo = startOfDay(subDays(now, 30));

    const allAttempts = await prisma.attempt.findMany({
      where: { userId, solvedAt: { gte: monthAgo } },
      select: { status: true, timing: true, solvedAt: true },
      orderBy: { solvedAt: "desc" },
    });

    const recentAttempts: typeof allAttempts = [];
    const weekAttempts: typeof allAttempts = [];
    const monthAttempts: typeof allAttempts = [];

    for (const attempt of allAttempts) {
      const solvedAt = attempt.solvedAt;
      if (!solvedAt) continue;

      if (solvedAt >= cutoffDate) {
        recentAttempts.push(attempt);
      } else if (solvedAt >= weekAgo) {
        weekAttempts.push(attempt);
      } else {
        monthAttempts.push(attempt);
      }
    }

    const calcAccuracy = (attempts: typeof allAttempts) => {
      if (attempts.length === 0) return 0;
      return attempts.filter(a => a.status === "CORRECT").length / attempts.length;
    };

    const recentAccuracy = calcAccuracy(recentAttempts);
    const weekAccuracy = calcAccuracy(weekAttempts);
    const monthAccuracy = calcAccuracy(monthAttempts);

    return {
      recentAccuracy,
      accuracyTrend: recentAccuracy - weekAccuracy,
      speedTrend: this.calculateSpeedTrend(recentAttempts, weekAttempts),
      consistencyScore: this.calculateConsistencyScore(recentAttempts),
      improvementRate: this.calculateImprovementRate(recentAccuracy, weekAccuracy, monthAccuracy),
      lastWeekPerformance: weekAccuracy,
      lastMonthPerformance: monthAccuracy,
    };
  }

  private calculateSpeedTrend(recentAttempts: any[], weekAttempts: any[]): number {
    const calcAvgTime = (attempts: any[]) => {
      if (attempts.length === 0) return 0;
      return attempts.reduce((sum, a) => sum + (a.timing || 0), 0) / attempts.length;
    };

    const recentAvgTime = calcAvgTime(recentAttempts);
    const weekAvgTime = calcAvgTime(weekAttempts);

    if (weekAvgTime === 0) return 0;
    return (weekAvgTime - recentAvgTime) / weekAvgTime;
  }

  private calculateConsistencyScore(attempts: any[]): number {
    if (attempts.length < 2) return 1.0;

    const batchSize = Math.max(1, Math.floor(attempts.length / 5));
    const accuracies: number[] = [];

    for (let i = 0; i < attempts.length; i += batchSize) {
      const batch = attempts.slice(i, i + batchSize);
      const correct = batch.filter((a: any) => a.status === "CORRECT").length;
      accuracies.push(correct / batch.length);
    }

    if (accuracies.length < 2) return 1.0;

    const mean = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length;
    const stdDev = Math.sqrt(variance);

    return Math.max(0, 1 - stdDev);
  }

  private calculateImprovementRate(recent: number, week: number, month: number): number {
    if (week === 0) return 0;
    if (month === 0) return (recent - week) / week;
    return ((recent - week) / week + (week - month) / month) / 2;
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

      if (question.subtopicId) {
        subtopicIds.add(question.subtopicId);
        const arr = subtopicAttempts.get(question.subtopicId);
        if (arr) arr.push(attempt);
        else subtopicAttempts.set(question.subtopicId, [attempt]);
      }

      if (question.topicId) {
        topicIds.add(question.topicId);
        const arr = topicAttempts.get(question.topicId);
        if (arr) arr.push(attempt);
        else topicAttempts.set(question.topicId, [attempt]);
      }

      if (question.subjectId) {
        subjectIds.add(question.subjectId);
        const arr = subjectAttempts.get(question.subjectId);
        if (arr) arr.push(attempt);
        else subjectAttempts.set(question.subjectId, [attempt]);
      }
    }

    return { subtopicAttempts, topicAttempts, subjectAttempts, subtopicIds, topicIds, subjectIds };
  }

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
                subject: { select: { id: true, name: true } },
              },
            },
          },
        },
        topic: {
          select: {
            id: true,
            name: true,
            subjectId: true,
            subject: { select: { id: true, name: true } },
          },
        },
        subject: { select: { id: true, name: true } },
      },
    });

    const hierarchyMap = new Map();

    for (const question of questions) {
      hierarchyMap.set(question.id, {
        questionId: question.id,
        subtopic: question.subTopic
          ? { id: question.subTopic.id, name: question.subTopic.name, topicId: question.subTopic.topicId }
          : null,
        topic: question.topic
          ? { id: question.topic.id, name: question.topic.name, subjectId: question.topic.subjectId }
          : null,
        subject: question.subject
          ? { id: question.subject.id, name: question.subject.name }
          : null,
      });
    }

    return hierarchyMap;
  }
}
