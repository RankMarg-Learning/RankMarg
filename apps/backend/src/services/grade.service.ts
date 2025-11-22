import { GradeEnum, SubmitStatus } from "@repo/db/enums";
import { Attempts, metrics, attemptsData } from "@/types/attemptConfig.type";
import { exam } from "@/constant/examJson";
import { ExamConfig, Subject } from "@/types/exam.type";
import { subjectDifficultyWt } from "./grade/subject_difficulty_wt";
import {
  CoreMetrics,
  DifficultyMetrics,
  SpeedMetrics,
  TrendMetrics,
} from "@/types/grade.type";
import { AttemptsConfig } from "./attempt.config";

export class StudentGradeService {
  public attemptsData: attemptsData;
  public readonly attempts: Attempts[];
  public readonly metrics: metrics;
  public readonly examCode: string;
  public readonly examData: ExamConfig;
  public readonly isPaidUser: boolean;
  private readonly attemptConfig: AttemptsConfig;

  constructor(
    userId: string,
    nDays_Data: number,
    examCode: string,
    isPaidUser: boolean
  ) {
    this.attemptConfig = new AttemptsConfig({
      userId: userId,
      startDate: new Date(Date.now() - nDays_Data * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      examCode: examCode,
    });

    this.attempts = this.attemptConfig.attempts;
    this.metrics = this.attemptConfig.metrics;
    this.examCode = examCode;
    this.isPaidUser = isPaidUser;
    const examData = exam[examCode as keyof typeof exam];
    this.examData = examData;
  }

  async calculateUserGrade(): Promise<GradeEnum> {
    await this.attemptConfig.init();

    this.attemptsData = this.attemptConfig.getAttemptsData();

    if (this.isPaidUser) {
      return this.calculateUserGradeDeep();
    } else {
      return this.calculateUserGradeShallow();
    }
  }

  async calculateUserGradeShallow(): Promise<GradeEnum> {
    try {
      if (this.attempts.length === 0) {
        return GradeEnum.C;
      }
      const accuracy = this.metrics.accuracy / 100;
      return this.determineGradeFromScore(accuracy);
    } catch (error) {
      console.error("Error calculating user grade:", error);
      return GradeEnum.C;
    }
  }

  async calculateUserGradeDeep(): Promise<GradeEnum> {
    try {
      if (this.attempts.length === 0) {
        return GradeEnum.C;
      }

      const coreMetrics = this.calculateCoreMetrics();

      const trendMetrics = this.calculateTrendMetrics();

      const difficultyMetrics = this.calculateDifficultyMetrics();

      const speedMetrics = this.calculateSpeedMetrics();

      const finalScore = this.calculateWeightedScore({
        coreMetrics,
        trendMetrics,
        difficultyMetrics,
        speedMetrics,
      });

      return this.determineGradeFromScore(finalScore);
    } catch (error) {
      console.error("Error calculating user grade:", error);
      return GradeEnum.C;
    }
  }

  private calculateCoreMetrics(): CoreMetrics {
    const totalAttempts = this.attempts.length;
    const correctAttempts = this.metrics.no_correct;
    const accuracy = this.metrics.accuracy;

    const hintDependency =
      totalAttempts > 0 ? this.metrics.no_hints_used / totalAttempts : 0;

    const streakScore = Math.min(this.metrics.max_streak_questions / 10, 1);

    return {
      accuracy: accuracy,
      hintDependency: 1 - hintDependency,
      streakScore: streakScore,
      totalAttempts: totalAttempts,
      correctAttempts: correctAttempts,
    };
  }

  private calculateTrendMetrics(): TrendMetrics {
    if (this.attempts.length < 10) {
      return { consistency: 0.5, improvement: 0.5 };
    }

    const recentAttempts = this.attempts.slice(
      0,
      Math.floor(this.attempts.length / 2)
    );
    const olderAttempts = this.attempts.slice(
      Math.floor(this.attempts.length / 2)
    );

    const recentAccuracy =
      recentAttempts.filter((a) => a.status === SubmitStatus.CORRECT).length /
      recentAttempts.length;
    const olderAccuracy =
      olderAttempts.filter((a) => a.status === SubmitStatus.CORRECT).length /
      olderAttempts.length;

    const improvement = Math.max(
      0,
      Math.min(1, (recentAccuracy - olderAccuracy) / 0.5 + 0.5)
    );

    const accuracies = this.attempts.map((_, index) => {
      const windowSize = Math.min(5, this.attempts.length - index);
      const window = this.attempts.slice(index, index + windowSize);
      return (
        window.filter((a) => a.status === SubmitStatus.CORRECT).length /
        window.length
      );
    });

    const meanAccuracy =
      accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    const variance =
      accuracies.reduce(
        (sum, acc) => sum + Math.pow(acc - meanAccuracy, 2),
        0
      ) / accuracies.length;
    const consistency = Math.max(0, 1 - Math.sqrt(variance) * 2);

    return { consistency, improvement };
  }

  private calculateDifficultyMetrics(): DifficultyMetrics {
    const difficultyPerformance = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const difficultyCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const subjectDifficultyPerformance: {
      [subject: string]: { 1: 0; 2: 0; 3: 0; 4: 0 };
    } = {};
    const subjectDifficultyCounts: {
      [subject: string]: { 1: 0; 2: 0; 3: 0; 4: 0 };
    } = {};

    this.examData.subjects?.forEach((subject: Subject) => {
      subjectDifficultyPerformance[subject.id] = { 1: 0, 2: 0, 3: 0, 4: 0 };
      subjectDifficultyCounts[subject.id] = { 1: 0, 2: 0, 3: 0, 4: 0 };
    });

    this.attempts.forEach((attempt) => {
      const difficulty = attempt.question
        .difficulty as keyof typeof difficultyPerformance;
      const subjectId = attempt.question.subjectId;

      if (difficultyCounts[difficulty] !== undefined) {
        difficultyCounts[difficulty]++;
        if (attempt.status === SubmitStatus.CORRECT) {
          difficultyPerformance[difficulty]++;
        }
      }

      if (
        subjectId &&
        subjectDifficultyCounts[subjectId] &&
        subjectDifficultyCounts[subjectId][difficulty] !== undefined
      ) {
        subjectDifficultyCounts[subjectId][difficulty]++;
        if (attempt.status === SubmitStatus.CORRECT) {
          subjectDifficultyPerformance[subjectId][difficulty]++;
        }
      }
    });

    let weightedScore = 0;
    let totalWeight = 0;
    let subjectWeightedScores: { [subject: string]: number } = {};

    const globalDistribution = this.examData.global_difficulty_bias || {
      easy_pct: 40.0,
      medium_pct: 40.0,
      hard_pct: 15.0,
      very_hard_pct: 5.0,
    };

    const difficultyDistribution = {
      1: globalDistribution.easy_pct / 100,
      2: globalDistribution.medium_pct / 100,
      3: globalDistribution.hard_pct / 100,
      4: globalDistribution.very_hard_pct / 100,
    };

    Object.keys(difficultyPerformance).forEach((diff) => {
      const difficulty = parseInt(diff) as keyof typeof difficultyPerformance;
      const count = difficultyCounts[difficulty];
      if (count > 0) {
        const accuracy = difficultyPerformance[difficulty] / count;
        const examWeight = difficultyDistribution[difficulty];
        weightedScore += accuracy * examWeight;
        totalWeight += examWeight;
      }
    });

    this.examData.subjects?.forEach((subject: Subject) => {
      const subjectName = subject.name;
      const subjectDistribution = subject.difficulty_distribution;
      let subjectScore = 0;
      let subjectWeight = 0;

      Object.keys(subjectDifficultyPerformance[subjectName]).forEach((diff) => {
        const difficulty = parseInt(diff) as keyof typeof difficultyPerformance;
        const count = subjectDifficultyCounts[subjectName][difficulty];
        if (count > 0) {
          const accuracy =
            subjectDifficultyPerformance[subjectName][difficulty] / count;
          const subjectWeightValue = subjectDifficultyWt(
            difficulty,
            subjectDistribution
          );
          subjectScore += accuracy * subjectWeightValue;
          subjectWeight += subjectWeightValue;
        }
      });

      subjectWeightedScores[subjectName] =
        subjectWeight > 0 ? subjectScore / subjectWeight : 0;
    });

    const difficultyScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

    return {
      difficultyScore,
      difficultyPerformance,
      difficultyCounts,
      subjectWeightedScores,
      subjectDifficultyPerformance,
      subjectDifficultyCounts,
    };
  }

  private calculateSpeedMetrics(): SpeedMetrics {
    const avgTiming = this.metrics.avg_timing;
    const avgReactionTime = this.metrics.avg_reaction_time;

    const subjectWeightedOptimalTiming =
      this.calculateSubjectWeightedOptimalTiming();

    const optimalTiming =
      subjectWeightedOptimalTiming > 0 ? subjectWeightedOptimalTiming : 60;

    const speedScore = Math.max(
      0,
      1 - Math.abs(avgTiming - optimalTiming) / optimalTiming
    );

    return {
      speedScore,
      avgTiming,
      avgReactionTime,
      optimalTiming,
    };
  }

  private calculateSubjectWeightedOptimalTiming(): number {
    if (!this.examData.subjects || this.attempts.length === 0) {
      return 0;
    }

    const subjectAttemptCounts: { [subjectId: string]: number } = {};
    const subjectTimings: { [subjectId: string]: number[] } = {};

    this.attempts.forEach((attempt) => {
      const subjectId = attempt.question.subjectId;
      if (subjectId) {
        subjectAttemptCounts[subjectId] =
          (subjectAttemptCounts[subjectId] || 0) + 1;
        if (!subjectTimings[subjectId]) {
          subjectTimings[subjectId] = [];
        }
        subjectTimings[subjectId].push(attempt.timing || 0);
      }
    });

    let totalWeightedTiming = 0;
    let totalWeight = 0;

    this.examData.subjects.forEach((subject) => {
      const attemptCount = subjectAttemptCounts[subject.id] || 0;
      if (attemptCount > 0) {
        const subjectShare = subject.share_percentage / 100;
        const subjectOptimalTiming = subject.avg_time_per_question_in_secs;

        const weight = subjectShare * attemptCount;
        totalWeightedTiming += subjectOptimalTiming * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? totalWeightedTiming / totalWeight : 0;
  }

  private calculateWeightedScore(metrics: {
    coreMetrics: CoreMetrics;
    trendMetrics: TrendMetrics;
    difficultyMetrics: DifficultyMetrics;
    speedMetrics: SpeedMetrics;
  }): number {
    const { coreMetrics, trendMetrics, difficultyMetrics, speedMetrics } =
      metrics;

    const weights = {
      accuracy: 0.25, // 25% - Most important
      consistency: 0.2, // 20% - Consistency matters
      improvement: 0.15, // 15% - Growth mindset
      difficulty: 0.15, // 15% - Handling tough questions
      speed: 0.07, // 10% - Time management
      hints: 0.1, // 10% - Independence
      streak: 0.07, // 5% - Motivation
    };

    let subjectWeightedDifficultyScore = difficultyMetrics.difficultyScore;
    if (
      difficultyMetrics.subjectWeightedScores &&
      Object.keys(difficultyMetrics.subjectWeightedScores).length > 0
    ) {
      let totalSubjectScore = 0;
      let totalSubjectWeight = 0;

      this.examData.subjects?.forEach((subject: Subject) => {
        const subjectName = subject.name;
        const subjectShare = subject.share_percentage / 100;
        const subjectScore =
          difficultyMetrics.subjectWeightedScores[subjectName] || 0;

        totalSubjectScore += subjectScore * subjectShare;
        totalSubjectWeight += subjectShare;
      });

      if (totalSubjectWeight > 0) {
        subjectWeightedDifficultyScore = totalSubjectScore / totalSubjectWeight;
      }
    }

    const weightedScore =
      coreMetrics.accuracy * weights.accuracy +
      trendMetrics.consistency * weights.consistency +
      trendMetrics.improvement * weights.improvement +
      Math.min(subjectWeightedDifficultyScore, 1) * weights.difficulty +
      Math.min(speedMetrics.speedScore, 1) * weights.speed +
      coreMetrics.hintDependency * weights.hints +
      coreMetrics.streakScore * weights.streak;

    return Math.min(Math.max(weightedScore, 0), 1);
  }

  private determineGradeFromScore(score: number): GradeEnum {
    if (score >= 0.80) return GradeEnum.A_PLUS;
    if (score >= 0.7) return GradeEnum.A;
    if (score >= 0.55) return GradeEnum.B;
    if (score >= 0.35) return GradeEnum.C;
    return GradeEnum.D;
  }
}
