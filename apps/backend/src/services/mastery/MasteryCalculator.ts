import {
  MasteryAttempt,
  EnhancedMasteryData,
  UserProfileData,
  PerformanceTrend,
  MasteryCalculationContext,
} from "../../type/mastery.api.types";
import { MasteryConfig } from "./MasteryConfig";
import { MistakeType } from "@repo/db/enums";
import { differenceInDays } from "date-fns";

export interface StrengthIndexData {
  totalAttempts: number;
  correctAttempts: number;
  streak: number;
  lastCorrectDate: Date | null;
  avgTime: number;
}

export class MasteryCalculator {
  private config: MasteryConfig;

  constructor(config: MasteryConfig) {
    this.config = config;
  }

  calculateMasteryScore(
    data: EnhancedMasteryData,
    context: MasteryCalculationContext
  ): number {
    const { userProfile, performanceTrend, streamConfig } = context;

    // Base accuracy score (30% of total)
    const baseScore =
      data.totalAttempts > 0
        ? (data.correctAttempts / data.totalAttempts) * 30
        : 0;

    // Streak bonus with adaptive learning (15% of total)
    const streakBonus = this.calculateAdaptiveStreakBonus(
      data.streak,
      userProfile
    );

    // Time-based performance (10% of total)
    const timeScore = this.calculateTimeBasedScore(data, streamConfig);

    // Difficulty mastery (15% of total)
    const difficultyScore = this.calculateDifficultyMastery(data, userProfile);

    // Consistency and improvement (10% of total)
    const consistencyScore = this.calculateConsistencyScore(
      data,
      performanceTrend
    );

    // Spaced repetition effectiveness (10% of total)
    const spacedRepetitionScore = this.calculateSpacedRepetitionScore(data);

    // Forgetting curve factor (5% of total)
    const forgettingCurveScore = this.calculateForgettingCurveScore(data);

    // User profile adaptation (5% of total)
    const userProfileScore = this.calculateUserProfileScore(userProfile, data);

    // Mistake analysis penalty
    const mistakePenalty = this.calculateMistakePenalty(data.mistakeAnalysis);

    const masteryScore = Math.max(
      0,
      Math.min(
        baseScore +
          streakBonus +
          timeScore +
          difficultyScore +
          consistencyScore +
          spacedRepetitionScore +
          forgettingCurveScore +
          userProfileScore -
          mistakePenalty,
        100
      )
    );

    return Math.round(masteryScore);
  }

  calculateEnhancedMasteryData(
    attempts: MasteryAttempt[],
    context: MasteryCalculationContext
  ): EnhancedMasteryData {
    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter(
      (a) => a.status === "CORRECT"
    ).length;

    // Basic metrics
    const recentAttempts = attempts.slice(0, Math.min(15, attempts.length));
    const recentCorrect = recentAttempts.filter(
      (a) => a.status === "CORRECT"
    ).length;
    const totalTime = attempts.reduce((sum, a) => sum + (a.timing || 0), 0);
    const avgTime = totalAttempts > 0 ? totalTime / totalAttempts : 0;

    // Streak calculation
    let streak = 0;
    for (let i = 0; i < attempts.length; i++) {
      if (attempts[i].status === "CORRECT") {
        streak++;
      } else {
        break;
      }
    }

    // Last correct attempt
    const lastCorrectAttempt = attempts.find((a) => a.status === "CORRECT");
    const lastCorrectDate = lastCorrectAttempt?.solvedAt ?? null;

    // Difficulty analysis
    const difficultySum = attempts.reduce(
      (sum, a) => sum + (a.question.difficulty || 1),
      0
    );
    const avgDifficulty = totalAttempts > 0 ? difficultySum / totalAttempts : 1;

    // Repetition analysis
    const oneDayRepetitions = this.countRepetitionsWithinTimeframe(
      attempts,
      24
    );
    const threeDayRepetitions = this.countRepetitionsWithinTimeframe(
      attempts,
      72
    );

    // Enhanced metrics
    const mistakeAnalysis = this.analyzeMistakes(attempts);
    const difficultyDistribution = this.analyzeDifficultyDistribution(attempts);
    const timeDistribution = this.analyzeTimeDistribution(
      attempts,
      context.streamConfig
    );
    const spacedRepetitionScore =
      this.calculateSpacedRepetitionEffectiveness(attempts);
    const forgettingCurveFactor = this.calculateForgettingCurveFactor(
      attempts,
      context.referenceDate
    );
    const adaptiveLearningScore = this.calculateAdaptiveLearningScore(
      attempts,
      context
    );

    return {
      totalAttempts,
      correctAttempts,
      avgTime,
      totalTime,
      streak,
      lastCorrectDate,
      avgDifficulty,
      recentAccuracy:
        recentAttempts.length > 0 ? recentCorrect / recentAttempts.length : 0,
      oneDayRepetitions,
      threeDayRepetitions,
      mistakeAnalysis,
      difficultyDistribution,
      timeDistribution,
      spacedRepetitionScore,
      forgettingCurveFactor,
      adaptiveLearningScore,
    };
  }

  calculateStrengthIndex(
    data: StrengthIndexData,
    context: MasteryCalculationContext
  ): number {
    const { userProfile, performanceTrend } = context;

    // Base consistency score (40% of total)
    const consistencyScore = (data.correctAttempts / data.totalAttempts) * 40;

    // Adaptive streak bonus (15% of total)
    const streakBonus = this.calculateAdaptiveStreakBonus(
      data.streak,
      userProfile
    );

    // Time consistency (15% of total)
    const timeConsistency = this.calculateTimeConsistency(
      data.avgTime,
      context.streamConfig
    );

    // Decay penalty with user-specific factors (10% of total)
    const decayPenalty = this.calculateAdaptiveDecayPenalty(
      data.lastCorrectDate,
      userProfile
    );

    // Performance trend bonus (10% of total)
    const trendBonus = this.calculateTrendBonus(performanceTrend);

    // User engagement factor (10% of total)
    const engagementScore = this.calculateEngagementScore(userProfile);

    const strengthIndex = Math.max(
      0,
      Math.min(
        consistencyScore +
          streakBonus +
          timeConsistency +
          trendBonus +
          engagementScore -
          decayPenalty,
        100
      )
    );

    return Math.round(strengthIndex);
  }

  // Enhanced helper methods
  private calculateAdaptiveStreakBonus(
    streak: number,
    userProfile: UserProfileData
  ): number {
    const baseStreakBonus = Math.min(Math.log2(streak + 1) * 3, 15);

    // Adjust based on user's study pattern
    const studyHoursFactor = userProfile.studyHoursPerDay
      ? Math.min(userProfile.studyHoursPerDay / 8, 1.2)
      : 1.0;

    const targetYearFactor = userProfile.targetYear
      ? Math.min((userProfile.targetYear - new Date().getFullYear()) / 2, 1.1)
      : 1.0;

    return baseStreakBonus * studyHoursFactor * targetYearFactor;
  }

  private calculateTimeBasedScore(
    data: EnhancedMasteryData,
    streamConfig: any
  ): number {
    const idealTime = streamConfig.idealTimePerQuestion;
    const speedRatio = data.avgTime > 0 ? idealTime / data.avgTime : 1;

    // Reward optimal speed range (not too fast, not too slow)
    const optimalSpeedRange = 0.5 <= speedRatio && speedRatio <= 1.5;
    const speedScore = optimalSpeedRange
      ? 10
      : Math.max(0, Math.min(speedRatio * 5, 10));

    return speedScore;
  }

  private calculateDifficultyMastery(
    data: EnhancedMasteryData,
    _userProfile: UserProfileData
  ): number {
    const difficultyWeight = this.config.getDifficultyWeight(
      data.avgDifficulty
    );
    const accuracy =
      data.totalAttempts > 0 ? data.correctAttempts / data.totalAttempts : 0;

    // Higher difficulty questions get more weight
    const difficultyScore = accuracy * difficultyWeight * 15;

    // Bonus for handling harder questions well
    const hardQuestionBonus =
      data.difficultyDistribution.hard > 0
        ? Math.min(data.difficultyDistribution.hard * 2, 5)
        : 0;

    return Math.min(difficultyScore + hardQuestionBonus, 15);
  }

  private calculateConsistencyScore(
    _data: EnhancedMasteryData,
    performanceTrend: PerformanceTrend
  ): number {
    const consistencyFactor = performanceTrend.consistencyScore;
    const improvementBonus = Math.max(0, performanceTrend.improvementRate * 5);

    return consistencyFactor * 8 + improvementBonus;
  }

  private calculateSpacedRepetitionScore(data: EnhancedMasteryData): number {
    const repetitionEffectiveness = Math.min(
      ((data.oneDayRepetitions * 0.5 + data.threeDayRepetitions * 0.8) /
        Math.max(data.totalAttempts, 1)) *
        20,
      10
    );

    return repetitionEffectiveness;
  }

  private calculateForgettingCurveScore(data: EnhancedMasteryData): number {
    return data.forgettingCurveFactor * 5;
  }

  private calculateUserProfileScore(
    userProfile: UserProfileData,
    _data: EnhancedMasteryData
  ): number {
    const studyHoursScore = userProfile.studyHoursPerDay
      ? Math.min(userProfile.studyHoursPerDay / 10, 2)
      : 0;

    const questionsPerDayScore = userProfile.questionsPerDay
      ? Math.min(userProfile.questionsPerDay / 20, 2)
      : 0;

    const activityScore = userProfile.isActive ? 1 : 0;

    return studyHoursScore + questionsPerDayScore + activityScore;
  }

  private calculateMistakePenalty(mistakeAnalysis: any): number {
    const conceptualPenalty = mistakeAnalysis.conceptual * 2;
    const calculationPenalty = mistakeAnalysis.calculation * 1.5;
    const readingPenalty = mistakeAnalysis.reading * 1;
    const overconfidencePenalty = mistakeAnalysis.overconfidence * 2.5;

    return Math.min(
      conceptualPenalty +
        calculationPenalty +
        readingPenalty +
        overconfidencePenalty,
      10
    );
  }

  private analyzeMistakes(attempts: MasteryAttempt[]): any {
    const mistakes = {
      conceptual: 0,
      calculation: 0,
      reading: 0,
      overconfidence: 0,
      other: 0,
    };

    for (const attempt of attempts) {
      if (attempt.mistake) {
        switch (attempt.mistake) {
          case MistakeType.CONCEPTUAL:
            mistakes.conceptual++;
            break;
          case MistakeType.CALCULATION:
            mistakes.calculation++;
            break;
          case MistakeType.READING:
            mistakes.reading++;
            break;
          case MistakeType.OVERCONFIDENCE:
            mistakes.overconfidence++;
            break;
          default:
            mistakes.other++;
        }
      }
    }

    return mistakes;
  }

  private analyzeDifficultyDistribution(attempts: MasteryAttempt[]): any {
    const distribution = { easy: 0, medium: 0, hard: 0 };

    for (const attempt of attempts) {
      const difficulty = attempt.question.difficulty || 1;
      if (difficulty <= 2) distribution.easy++;
      else if (difficulty <= 4) distribution.medium++;
      else distribution.hard++;
    }

    return distribution;
  }

  private analyzeTimeDistribution(
    attempts: MasteryAttempt[],
    streamConfig: any
  ): any {
    const idealTime = streamConfig.idealTimePerQuestion;
    const distribution = { fast: 0, normal: 0, slow: 0 };

    for (const attempt of attempts) {
      const time = attempt.timing || 0;
      const ratio = time / idealTime;

      if (ratio < 0.5) distribution.fast++;
      else if (ratio <= 1.5) distribution.normal++;
      else distribution.slow++;
    }

    return distribution;
  }

  private calculateSpacedRepetitionEffectiveness(
    attempts: MasteryAttempt[]
  ): number {
    // Calculate how well spaced repetition is working
    const questionAttempts: Record<string, MasteryAttempt[]> = {};

    for (const attempt of attempts) {
      if (!questionAttempts[attempt.question.id]) {
        questionAttempts[attempt.question.id] = [];
      }
      questionAttempts[attempt.question.id].push(attempt);
    }

    let effectiveness = 0;
    let totalRepetitions = 0;

    for (const questionId in questionAttempts) {
      const attemptsForQuestion = questionAttempts[questionId];
      if (attemptsForQuestion.length > 1) {
        totalRepetitions++;

        // Check if later attempts are better
        const firstAttempt =
          attemptsForQuestion[attemptsForQuestion.length - 1];
        const lastAttempt = attemptsForQuestion[0];

        if (
          lastAttempt.status === "CORRECT" &&
          firstAttempt.status !== "CORRECT"
        ) {
          effectiveness++;
        }
      }
    }

    return totalRepetitions > 0 ? effectiveness / totalRepetitions : 0;
  }

  private calculateForgettingCurveFactor(
    attempts: MasteryAttempt[],
    referenceDate: Date
  ): number {
    if (attempts.length === 0) return 0;

    const lastAttempt = attempts[0];
    const daysSinceLastAttempt = differenceInDays(
      referenceDate,
      lastAttempt.solvedAt || referenceDate
    );

    return this.config.calculateForgettingCurve(daysSinceLastAttempt);
  }

  private calculateAdaptiveLearningScore(
    attempts: MasteryAttempt[],
    _context: MasteryCalculationContext
  ): number {
    if (attempts.length < 3) return 0;

    // Check if user is improving over time
    const recentAttempts = attempts.slice(0, Math.min(10, attempts.length));
    const olderAttempts = attempts.slice(
      -Math.min(10, attempts.length - recentAttempts.length)
    );

    const recentAccuracy =
      recentAttempts.filter((a) => a.status === "CORRECT").length /
      recentAttempts.length;
    const olderAccuracy =
      olderAttempts.filter((a) => a.status === "CORRECT").length /
      olderAttempts.length;

    const improvement = recentAccuracy - olderAccuracy;

    return Math.max(0, improvement * 10);
  }

  private calculateTimeConsistency(avgTime: number, streamConfig: any): number {
    const idealTime = streamConfig.idealTimePerQuestion;
    const consistency =
      avgTime > 0 ? Math.max(5 - Math.abs(avgTime - idealTime) / 10, 0) : 10;
    return consistency;
  }

  private calculateAdaptiveDecayPenalty(
    lastCorrectDate: Date | null,
    userProfile: UserProfileData
  ): number {
    if (!lastCorrectDate) return 0;

    const daysSinceLastCorrect = differenceInDays(new Date(), lastCorrectDate);
    const baseDecay = Math.min(Math.log2(daysSinceLastCorrect + 1) * 3, 20);

    // Adjust decay based on user's study pattern
    const studyHoursFactor = userProfile.studyHoursPerDay
      ? Math.max(0.5, 1 - userProfile.studyHoursPerDay / 10)
      : 1.0;

    return baseDecay * studyHoursFactor;
  }

  private calculateTrendBonus(performanceTrend: PerformanceTrend): number {
    const accuracyBonus = Math.max(0, performanceTrend.accuracyTrend * 5);
    const speedBonus = Math.max(0, performanceTrend.speedTrend * 3);
    const improvementBonus = Math.max(0, performanceTrend.improvementRate * 2);

    return accuracyBonus + speedBonus + improvementBonus;
  }

  private calculateEngagementScore(userProfile: UserProfileData): number {
    let score = 0;

    if (userProfile.isActive) score += 3;
    if (userProfile.studyHoursPerDay && userProfile.studyHoursPerDay >= 2)
      score += 3;
    if (userProfile.questionsPerDay && userProfile.questionsPerDay >= 5)
      score += 2;
    if (userProfile.xp > 1000) score += 2;

    return Math.min(score, 10);
  }

  private countRepetitionsWithinTimeframe(
    attempts: MasteryAttempt[],
    hours: number
  ): number {
    const questionAttempts: Record<string, MasteryAttempt[]> = {};

    for (const attempt of attempts) {
      if (!questionAttempts[attempt.question.id]) {
        questionAttempts[attempt.question.id] = [];
      }
      questionAttempts[attempt.question.id].push(attempt);
    }

    let repetitionCount = 0;

    for (const questionId in questionAttempts) {
      const attemptsForQuestion = questionAttempts[questionId].sort(
        (a, b) => (a.solvedAt?.getTime() ?? 0) - (b.solvedAt?.getTime() ?? 0)
      );

      if (attemptsForQuestion.length < 2) continue;

      for (let i = 1; i < attemptsForQuestion.length; i++) {
        const timeDiff =
          ((attemptsForQuestion[i].solvedAt?.getTime() ?? 0) -
            (attemptsForQuestion[i - 1].solvedAt?.getTime() ?? 0)) /
          (1000 * 60 * 60);

        if (timeDiff <= hours) {
          repetitionCount++;
        }
      }
    }

    return repetitionCount;
  }
}
