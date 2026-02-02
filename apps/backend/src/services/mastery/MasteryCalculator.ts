import {
  MasteryAttempt,
  EnhancedMasteryData,
  UserProfileData,
  PerformanceTrend,
  MasteryCalculationContext,
} from "../../types/mastery.api.types";
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

interface MistakeAnalysis {
  conceptual: number;
  calculation: number;
  reading: number;
  overconfidence: number;
  other: number;
}

interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

interface TimeDistribution {
  fast: number;
  normal: number;
  slow: number;
}

export class MasteryCalculator {
  private config: MasteryConfig;

  constructor(config: MasteryConfig) {
    this.config = config;
  }

  calculateMasteryScore(data: EnhancedMasteryData, context: MasteryCalculationContext): number {
    const { userProfile, performanceTrend, streamConfig } = context;

    const baseScore = data.totalAttempts > 0 ? (data.correctAttempts / data.totalAttempts) * 59 : 0;
    const streakBonus = this.calculateAdaptiveStreakBonus(data.streak, userProfile);
    const timeScore = this.calculateTimeBasedScore(data, streamConfig);
    const difficultyScore = this.calculateDifficultyMastery(data, userProfile);
    const consistencyScore = this.calculateConsistencyScore(data, performanceTrend);
    const spacedRepetitionScore = this.calculateSpacedRepetitionScore(data);
    const forgettingCurveScore = data.forgettingCurveFactor * 5;
    const mistakePenalty = this.calculateMistakePenalty(data.mistakeAnalysis);

    const masteryScore = Math.max(
      0,
      Math.min(
        baseScore + streakBonus + timeScore + difficultyScore + consistencyScore + spacedRepetitionScore + forgettingCurveScore - mistakePenalty,
        100
      )
    );

    return Math.round(masteryScore);
  }

  calculateEnhancedMasteryData(attempts: MasteryAttempt[], context: MasteryCalculationContext): EnhancedMasteryData {
    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter(a => a.status === "CORRECT").length;

    const recentAttempts = attempts.slice(0, Math.min(15, totalAttempts));
    const recentCorrect = recentAttempts.filter(a => a.status === "CORRECT").length;

    let totalTime = 0;
    let difficultySum = 0;

    for (const a of attempts) {
      totalTime += a.timing || 0;
      difficultySum += a.question.difficulty || 1;
    }

    const avgTime = totalAttempts > 0 ? totalTime / totalAttempts : 0;
    const avgDifficulty = totalAttempts > 0 ? difficultySum / totalAttempts : 1;

    let streak = 0;
    for (const attempt of attempts) {
      if (attempt.status === "CORRECT") streak++;
      else break;
    }

    const lastCorrectAttempt = attempts.find(a => a.status === "CORRECT");
    const lastCorrectDate = lastCorrectAttempt?.solvedAt ?? null;

    const mistakeAnalysis = this.analyzeMistakes(attempts);
    const difficultyDistribution = this.analyzeDifficultyDistribution(attempts);
    const timeDistribution = this.analyzeTimeDistribution(attempts, context.streamConfig);
    const spacedRepetitionScore = this.calculateSpacedRepetitionEffectiveness(attempts);
    const forgettingCurveFactor = this.calculateForgettingCurveFactor(attempts, context.referenceDate);
    const adaptiveLearningScore = this.calculateAdaptiveLearningScore(attempts);

    const oneDayRepetitions = this.countRepetitionsWithinTimeframe(attempts, 24);
    const threeDayRepetitions = this.countRepetitionsWithinTimeframe(attempts, 72);

    return {
      totalAttempts,
      correctAttempts,
      avgTime,
      totalTime,
      streak,
      lastCorrectDate,
      avgDifficulty,
      recentAccuracy: recentAttempts.length > 0 ? recentCorrect / recentAttempts.length : 0,
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

  calculateStrengthIndex(data: StrengthIndexData, context: MasteryCalculationContext): number {
    const { userProfile, performanceTrend } = context;

    const consistencyScore = (data.correctAttempts / data.totalAttempts) * 40;
    const streakBonus = this.calculateAdaptiveStreakBonus(data.streak, userProfile);
    const timeConsistency = this.calculateTimeConsistency(data.avgTime, context.streamConfig);
    const decayPenalty = this.calculateAdaptiveDecayPenalty(data.lastCorrectDate, userProfile);
    const trendBonus = this.calculateTrendBonus(performanceTrend);
    const engagementScore = this.calculateEngagementScore(userProfile);

    const strengthIndex = Math.max(0, Math.min(consistencyScore + streakBonus + timeConsistency + trendBonus + engagementScore - decayPenalty, 100));
    return Math.round(strengthIndex);
  }

  private calculateAdaptiveStreakBonus(streak: number, userProfile: UserProfileData): number {
    const baseStreakBonus = Math.min(Math.log2(streak + 1) * 3, 5);
    const studyHoursFactor = userProfile.studyHoursPerDay ? Math.min(userProfile.studyHoursPerDay / 8, 1.0) : 1.0;
    const targetYearFactor = userProfile.targetYear ? Math.min((userProfile.targetYear - new Date().getFullYear()) / 2, 1.0) : 1.0;
    return Math.min(baseStreakBonus * studyHoursFactor * targetYearFactor * 0.2, 1.0);
  }

  private calculateTimeBasedScore(data: EnhancedMasteryData, streamConfig: any): number {
    const idealTime = streamConfig.idealTimePerQuestion;
    const speedRatio = data.avgTime > 0 ? idealTime / data.avgTime : 1;
    return (speedRatio >= 0.5 && speedRatio <= 1.5) ? 10 : Math.max(0, Math.min(speedRatio * 5, 10));
  }

  private calculateDifficultyMastery(data: EnhancedMasteryData, _userProfile: UserProfileData): number {
    const difficultyWeight = this.config.getDifficultyWeight(data.avgDifficulty);
    const accuracy = data.totalAttempts > 0 ? data.correctAttempts / data.totalAttempts : 0;
    const difficultyScore = accuracy * difficultyWeight * 10;
    const hardQuestionBonus = data.difficultyDistribution.hard > 0 ? Math.min(data.difficultyDistribution.hard * 1.0, 3) : 0;
    return Math.min(difficultyScore + hardQuestionBonus, 10);
  }

  private calculateConsistencyScore(_data: EnhancedMasteryData, performanceTrend: PerformanceTrend): number {
    const consistencyFactor = performanceTrend.consistencyScore;
    const improvementBonus = Math.max(0, performanceTrend.improvementRate * 5);
    return consistencyFactor * 8 + improvementBonus;
  }

  private calculateSpacedRepetitionScore(data: EnhancedMasteryData): number {
    return Math.min(((data.oneDayRepetitions * 0.5 + data.threeDayRepetitions * 0.8) / Math.max(data.totalAttempts, 1)) * 10, 5);
  }

  private calculateMistakePenalty(mistakeAnalysis: MistakeAnalysis): number {
    return Math.min(
      mistakeAnalysis.conceptual * 2 +
      mistakeAnalysis.calculation * 1.5 +
      mistakeAnalysis.reading * 1 +
      mistakeAnalysis.overconfidence * 2.5,
      10
    );
  }

  private analyzeMistakes(attempts: MasteryAttempt[]): MistakeAnalysis {
    const mistakes: MistakeAnalysis = { conceptual: 0, calculation: 0, reading: 0, overconfidence: 0, other: 0 };

    for (const attempt of attempts) {
      if (!attempt.mistake) continue;
      switch (attempt.mistake) {
        case MistakeType.CONCEPTUAL: mistakes.conceptual++; break;
        case MistakeType.CALCULATION: mistakes.calculation++; break;
        case MistakeType.READING: mistakes.reading++; break;
        case MistakeType.OVERCONFIDENCE: mistakes.overconfidence++; break;
        default: mistakes.other++;
      }
    }

    return mistakes;
  }

  private analyzeDifficultyDistribution(attempts: MasteryAttempt[]): DifficultyDistribution {
    const distribution: DifficultyDistribution = { easy: 0, medium: 0, hard: 0 };

    for (const attempt of attempts) {
      const difficulty = attempt.question.difficulty || 1;
      if (difficulty <= 2) distribution.easy++;
      else if (difficulty <= 4) distribution.medium++;
      else distribution.hard++;
    }

    return distribution;
  }

  private analyzeTimeDistribution(attempts: MasteryAttempt[], streamConfig: any): TimeDistribution {
    const idealTime = streamConfig.idealTimePerQuestion;
    const distribution: TimeDistribution = { fast: 0, normal: 0, slow: 0 };

    for (const attempt of attempts) {
      const ratio = (attempt.timing || 0) / idealTime;
      if (ratio < 0.5) distribution.fast++;
      else if (ratio <= 1.5) distribution.normal++;
      else distribution.slow++;
    }

    return distribution;
  }

  private calculateSpacedRepetitionEffectiveness(attempts: MasteryAttempt[]): number {
    const questionAttempts = new Map<string, MasteryAttempt[]>();

    for (const attempt of attempts) {
      const qid = attempt.question.id;
      const arr = questionAttempts.get(qid);
      if (arr) arr.push(attempt);
      else questionAttempts.set(qid, [attempt]);
    }

    let effectiveness = 0;
    let totalRepetitions = 0;

    for (const attemptsForQuestion of questionAttempts.values()) {
      if (attemptsForQuestion.length > 1) {
        totalRepetitions++;
        const firstAttempt = attemptsForQuestion[attemptsForQuestion.length - 1];
        const lastAttempt = attemptsForQuestion[0];
        if (lastAttempt.status === "CORRECT" && firstAttempt.status !== "CORRECT") {
          effectiveness++;
        }
      }
    }

    return totalRepetitions > 0 ? effectiveness / totalRepetitions : 0;
  }

  private calculateForgettingCurveFactor(attempts: MasteryAttempt[], referenceDate: Date): number {
    if (attempts.length === 0) return 0;
    const lastAttempt = attempts[0];
    const daysSinceLastAttempt = differenceInDays(referenceDate, lastAttempt.solvedAt || referenceDate);
    return this.config.calculateForgettingCurve(daysSinceLastAttempt);
  }

  private calculateAdaptiveLearningScore(attempts: MasteryAttempt[]): number {
    if (attempts.length < 3) return 0;

    const recentCount = Math.min(10, attempts.length);
    const recentAttempts = attempts.slice(0, recentCount);
    const olderAttempts = attempts.slice(-Math.min(10, attempts.length - recentCount));

    if (olderAttempts.length === 0) return 0;

    const recentAccuracy = recentAttempts.filter(a => a.status === "CORRECT").length / recentAttempts.length;
    const olderAccuracy = olderAttempts.filter(a => a.status === "CORRECT").length / olderAttempts.length;

    return Math.max(0, (recentAccuracy - olderAccuracy) * 10);
  }

  private calculateTimeConsistency(avgTime: number, streamConfig: any): number {
    const idealTime = streamConfig.idealTimePerQuestion;
    return avgTime > 0 ? Math.max(5 - Math.abs(avgTime - idealTime) / 10, 0) : 10;
  }

  private calculateAdaptiveDecayPenalty(lastCorrectDate: Date | null, userProfile: UserProfileData): number {
    if (!lastCorrectDate) return 0;
    const daysSinceLastCorrect = differenceInDays(new Date(), lastCorrectDate);
    const baseDecay = Math.min(Math.log2(daysSinceLastCorrect + 1) * 3, 20);
    const studyHoursFactor = userProfile.studyHoursPerDay ? Math.max(0.5, 1 - userProfile.studyHoursPerDay / 10) : 1.0;
    return baseDecay * studyHoursFactor;
  }

  private calculateTrendBonus(performanceTrend: PerformanceTrend): number {
    return Math.max(0, performanceTrend.accuracyTrend * 5) +
      Math.max(0, performanceTrend.speedTrend * 3) +
      Math.max(0, performanceTrend.improvementRate * 2);
  }

  private calculateEngagementScore(userProfile: UserProfileData): number {
    let score = 0;
    if (userProfile.isActive) score += 3;
    if (userProfile.studyHoursPerDay && userProfile.studyHoursPerDay >= 2) score += 3;
    if (userProfile.questionsPerDay && userProfile.questionsPerDay >= 5) score += 2;
    if (userProfile.xp > 1000) score += 2;
    return Math.min(score, 10);
  }

  private countRepetitionsWithinTimeframe(attempts: MasteryAttempt[], hours: number): number {
    const questionAttempts = new Map<string, MasteryAttempt[]>();

    for (const attempt of attempts) {
      const qid = attempt.question.id;
      const arr = questionAttempts.get(qid);
      if (arr) arr.push(attempt);
      else questionAttempts.set(qid, [attempt]);
    }

    let repetitionCount = 0;
    const hoursMs = hours * 60 * 60 * 1000;

    for (const attemptsForQuestion of questionAttempts.values()) {
      if (attemptsForQuestion.length < 2) continue;

      attemptsForQuestion.sort((a, b) => (a.solvedAt?.getTime() ?? 0) - (b.solvedAt?.getTime() ?? 0));

      for (let i = 1; i < attemptsForQuestion.length; i++) {
        const timeDiff = (attemptsForQuestion[i].solvedAt?.getTime() ?? 0) - (attemptsForQuestion[i - 1].solvedAt?.getTime() ?? 0);
        if (timeDiff <= hoursMs) repetitionCount++;
      }
    }

    return repetitionCount;
  }
}
