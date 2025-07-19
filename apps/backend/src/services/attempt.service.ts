import prisma from "@/lib/prisma";
import {
  AttemptService_ANA,
  DifficultyStats,
  PerformanceSummary,
} from "@/type/attempt.type";
import { AttemptType, SubmitStatus } from "@prisma/client";

export class AttemptService {
  private userId: string;
  private startAt: Date;
  private endAt: Date;
  private attempts: AttemptService_ANA[] = [];
  private isInitialized = false;

  constructor(userId: string, startAt: Date, endAt: Date) {
    this.userId = userId;
    this.startAt = startAt;
    this.endAt = endAt;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.attempts = await this.fetchAttempts();
    this.isInitialized = true;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private async fetchAttempts(): Promise<AttemptService_ANA[]> {
    const rawAttempts = await prisma.attempt.findMany({
      where: {
        userId: this.userId,
        solvedAt: {
          gte: this.startAt,
          lte: this.endAt,
        },
      },
      orderBy: { solvedAt: "desc" },
      select: {
        userId: true,
        type: true,
        mistake: true,
        timing: true,
        status: true,
        hintsUsed: true,
        solvedAt: true,
        question: {
          select: {
            difficulty: true,
            subject: {
              select: { name: true },
            },
            topic: {
              select: { name: true },
            },
            subTopic: {
              select: { name: true },
            },
          },
        },
      },
    });

    const curr_topic = await prisma.currentStudyTopic.findFirst({
      where: { userId: this.userId },
      orderBy: { startedAt: "desc" },
      select: {
        topic: {
          select: {
            name: true,
            subTopics: {
              select: { name: true },
            },
          },
        },
      },
    });

    return rawAttempts.map((attempt) => {
      const subTopicName = attempt.question.subTopic?.name || "Unknown";
      const isCurrentSubTopic = curr_topic?.topic.subTopics.some(
        (sub) => sub.name === subTopicName
      );

      return {
        userId: attempt.userId,
        type: attempt.type,
        mistake: attempt.mistake || "NONE",
        timing: attempt.timing || 0,
        status: attempt.status,
        hintsUsed: attempt.hintsUsed,
        difficulty: attempt.question.difficulty,
        subject: attempt.question.subject?.name || "Unknown",
        topic: attempt.question.topic?.name || "Unknown",
        subTopic: isCurrentSubTopic
          ? `${subTopicName} (Current)`
          : subTopicName,
        solvedAt: attempt.solvedAt || new Date(0),
      };
    });
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce(
      (groups, item) => {
        const groupKey = String(item[key]);
        groups[groupKey] = groups[groupKey] || [];
        groups[groupKey].push(item);
        return groups;
      },
      {} as Record<string, T[]>
    );
  }

  private calculateMistakeStats(attempts: AttemptService_ANA[]) {
    const mistakeCounts = {
      NONE: 0,
      CONCEPTUAL: 0,
      CALCULATION: 0,
      MISREADING: 0,
      OTHER: 0,
    };

    attempts.forEach((attempt) => {
      mistakeCounts[attempt.mistake as keyof typeof mistakeCounts]++;
    });

    const mostCommonMistake = Object.entries(mistakeCounts).reduce(
      (prev, curr) => (curr[1] > prev[1] ? curr : prev),
      ["NONE", 0]
    )[0];

    return { mistakeCounts, mostCommonMistake };
  }

  private calculateDifficultyStats(
    attempts: AttemptService_ANA[]
  ): Record<number, DifficultyStats> {
    const groupedByDifficulty = this.groupBy(attempts, "difficulty");
    const difficultyStats: Record<number, DifficultyStats> = {};

    for (const [difficulty, diffAttempts] of Object.entries(
      groupedByDifficulty
    )) {
      const total = diffAttempts.length;
      const correct = diffAttempts.filter(
        (a) => a.status === SubmitStatus.CORRECT
      ).length;
      const totalTime = diffAttempts.reduce((sum, a) => sum + a.timing, 0);
      const avg_time = total > 0 ? Number((totalTime / total).toFixed(2)) : 0;

      difficultyStats[Number(difficulty)] = { total, correct, avg_time };
    }

    return difficultyStats;
  }

  private calculateBasicStats(attempts: AttemptService_ANA[]) {
    const no_questions = attempts.length;
    const no_correct = attempts.filter(
      (a) => a.status === SubmitStatus.CORRECT
    ).length;

    const no_hints_used = attempts.filter((a) => a.hintsUsed).length;

    const totalTiming = attempts.reduce((sum, a) => sum + a.timing, 0);
    const totalDifficulty = attempts.reduce((sum, a) => sum + a.difficulty, 0);

    const avg_timing =
      no_questions > 0 ? Number((totalTiming / no_questions).toFixed(2)) : 0;
    const avg_difficulty =
      no_questions > 0
        ? Number((totalDifficulty / no_questions).toFixed(2))
        : 0;

    return {
      no_questions,
      no_correct,
      no_hints_used,
      avg_timing,
      avg_difficulty,
    };
  }

  public async AIAgentDailyPerformanceSTRUC(): Promise<PerformanceSummary> {
    await this.ensureInitialized();

    const performance: PerformanceSummary = {
      isTestGiven: this.attempts.some(
        (attempt) => attempt.type === AttemptType.TEST
      ),
      total_questions: this.attempts.length,
      subtopic: {},
      mistake_recorded: [
        {
          NONE: 0,
          CONCEPTUAL: 0,
          CALCULATION: 0,
          MISREADING: 0,
          OTHER: 0,
        },
      ],
    };

    // Group by subtopic and calculate stats
    const groupedBySubtopic = this.groupBy(this.attempts, "subTopic");

    for (const [subTopic, subTopicAttempts] of Object.entries(
      groupedBySubtopic
    )) {
      const basicStats = this.calculateBasicStats(subTopicAttempts);
      const difficultyStats = this.calculateDifficultyStats(subTopicAttempts);

      performance.subtopic[subTopic] = {
        ...basicStats,
        difficulty: difficultyStats,
      };
    }

    // Calculate overall mistake statistics
    const { mistakeCounts } = this.calculateMistakeStats(this.attempts);
    performance.mistake_recorded[0] = mistakeCounts;
    return performance;
  }
}
