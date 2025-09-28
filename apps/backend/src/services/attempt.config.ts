import {
  Attempts,
  metrics,
  AttemptsConfigOptions,
  attemptsData,
} from "@/types/attemptConfig.type";
import prisma from "@repo/db";
import {
  AttemptType,
  GradeEnum,
  MistakeType,
  SubmitStatus,
} from "@repo/db/enums";

export class AttemptsConfig {
  public readonly startDate: Date;
  public readonly endDate: Date;
  public readonly userId: string;
  public readonly examCode: string;
  public readonly grade: GradeEnum;
  public readonly questionsPerDay: number;
  public readonly totalQuestions: number;
  public readonly newQuestions: number;
  public attempts: Attempts[] = [];

  public readonly metrics: metrics = {
    no_attempts: 0,
    no_correct: 0,
    no_incorrect: 0,
    no_hints_used: 0,
    avg_timing: 0,
    avg_reaction_time: 0,
    accuracy: 0,
    avg_speed: 0,
    avg_consistency: 0,
    avg_improvement: 0,
    max_streak_questions: 0,
  };

  public difficultyDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
  } = { 1: 0, 2: 0, 3: 0, 4: 0 };

  public mistakes_distribution: {
    type: MistakeType;
    count: number;
  }[] = [];

  constructor(params: AttemptsConfigOptions) {
    this.userId = params.userId;
    this.examCode = params.examCode;
    this.grade = params.grade || GradeEnum.C;
    this.startDate = params.startDate || new Date();
    this.endDate = params.endDate || new Date();
  }

  async init() {
    await this.fetchAttempts();
    await this.extractInfo();
  }

  public getAttemptsData(): attemptsData {
    const data = {
      metrics: this.metrics,
      difficultyDistribution: this.difficultyDistribution,
      mistakes_distribution: this.mistakes_distribution,
      attempts: this.attempts,
    };
    return data;
  }

  async fetchAttempts(): Promise<void> {
    try {
      const startDate = this.startDate;
      const endDate = this.endDate;

      const attempts = await prisma.attempt.findMany({
        where: {
          userId: this.userId,
          solvedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          questionId: true,
          type: true,
          answer: true,
          mistake: true,
          timing: true,
          reactionTime: true,
          status: true,
          hintsUsed: true,
          solvedAt: true,
          question: {
            select: {
              id: true,
              difficulty: true,
              questionTime: true,
              subjectId: true,
              topicId: true,
              subtopicId: true,
            },
          },
        },
        orderBy: {
          solvedAt: "desc",
        },
      });

      this.attempts = attempts.map((attempt) => ({
        ...attempt,
        type: attempt.type as AttemptType,
        status: attempt.status as SubmitStatus,
        mistake: attempt.mistake as MistakeType,
      }));
    } catch (error) {
      console.error("Error getting attempts:", error);
      throw new Error(
        `Failed to fetch user attempts: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async extractInfo(): Promise<void> {
    try {
      if (this.attempts.length === 0) {
        return;
      }

      let totalTiming = 0;
      let totalReactionTime = 0;
      let correctCount = 0;
      let incorrectCount = 0;
      let hintsUsedCount = 0;
      let currentStreak = 0;
      let maxStreak = 0;

      const difficultyCounts: { [key: number]: number } = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
      };
      const mistakeCounts: { [key: string]: number } = {};

      for (const attempt of this.attempts) {
        if (attempt.status === SubmitStatus.CORRECT) {
          correctCount++;
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else if (attempt.status === SubmitStatus.INCORRECT) {
          incorrectCount++;
          currentStreak = 0;
        }

        if (attempt.hintsUsed) {
          hintsUsedCount++;
        }

        totalTiming += attempt.timing;
        totalReactionTime += attempt.reactionTime;

        const difficulty = attempt.question
          .difficulty as keyof typeof difficultyCounts;
        if (difficultyCounts[difficulty] !== undefined) {
          difficultyCounts[difficulty]++;
        }

        const mistakeType = attempt.mistake as string;
        if (mistakeType && mistakeType !== "NONE") {
          mistakeCounts[mistakeType] = (mistakeCounts[mistakeType] || 0) + 1;
        }
      }

      const totalAttempts = this.attempts.length;

      this.metrics.no_attempts = totalAttempts;
      this.metrics.no_correct = correctCount;
      this.metrics.no_incorrect = incorrectCount;
      this.metrics.no_hints_used = hintsUsedCount;
      this.metrics.avg_timing =
        totalAttempts > 0 ? totalTiming / totalAttempts : 0;
      this.metrics.avg_reaction_time =
        totalAttempts > 0 ? totalReactionTime / totalAttempts : 0;
      this.metrics.accuracy =
        totalAttempts > 0 ? correctCount / totalAttempts : 0;
      this.metrics.avg_speed =
        this.metrics.avg_timing > 0
          ? correctCount / this.metrics.avg_timing
          : 0;
      this.metrics.max_streak_questions = maxStreak;

      this.difficultyDistribution = difficultyCounts as {
        1: number;
        2: number;
        3: number;
        4: number;
      };

      this.mistakes_distribution = Object.entries(mistakeCounts).map(
        ([type, count]) => ({
          type: type as MistakeType,
          count,
        })
      );
      this.mistakes_distribution = this.attempts.reduce(
        (acc, attempt) => {
          acc.push({ type: attempt.mistake as MistakeType, count: 1 });
          return acc;
        },
        [] as { type: MistakeType; count: number }[]
      );
    } catch (error) {
      console.error("Error extracting info:", error);
    }
  }
}
