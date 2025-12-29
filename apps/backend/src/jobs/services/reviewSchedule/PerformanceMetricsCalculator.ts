import { masteryConfig } from '../../../services/mastery/MasteryConfig';
import { PERFORMANCE_WEIGHTS } from './ReviewScheduleConfig';

export interface PerformanceMetrics {
  accuracy: number;
  avgTime: number;
  recentAccuracy: number;
  speedIndex: number;
  consistencyScore: number;
  improvementRate: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
}

/**
 * Calculates performance metrics from attempt history
 */
export class PerformanceMetricsCalculator {
  computePerformanceMetrics(
    attempts: Array<{ status: string; timing: number | null; solvedAt: Date }>,
    examCode: string
  ): PerformanceMetrics {
    if (attempts.length === 0) {
      return {
        accuracy: 0,
        avgTime: masteryConfig.getExamConfig(examCode).idealTimePerQuestion,
        recentAccuracy: 0,
        speedIndex: 1,
        consistencyScore: 0,
        improvementRate: 0,
        consecutiveCorrect: 0,
        consecutiveIncorrect: 0,
      };
    }

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter(a => a.status === 'CORRECT').length;
    const accuracy = correctAttempts / totalAttempts;

    // Recent performance (last 10 attempts)
    const recentAttempts = attempts.slice(0, Math.min(10, totalAttempts));
    const recentCorrect = recentAttempts.filter(a => a.status === 'CORRECT').length;
    const recentAccuracy = recentCorrect / recentAttempts.length;

    // Timing analysis
    const timings = attempts.filter(a => a.timing !== null).map(a => a.timing as number);
    const avgTime = timings.length > 0 
      ? timings.reduce((sum, t) => sum + t, 0) / timings.length
      : masteryConfig.getExamConfig(examCode).idealTimePerQuestion;

    const idealTime = masteryConfig.getExamConfig(examCode).idealTimePerQuestion;
    const speedIndex = Math.min(Math.max(idealTime / avgTime, 0.1), 2.0);

    // Consistency score (lower variance = better)
    let consistencyScore = 0.5;
    if (timings.length >= 3) {
      const variance = timings.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) / timings.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / avgTime;
      consistencyScore = Math.max(0, 1 - Math.min(coefficientOfVariation, 1));
    }

    // Improvement rate (comparing halves)
    let improvementRate = 0;
    if (totalAttempts >= 6) {
      const midpoint = Math.floor(totalAttempts / 2);
      const olderHalf = attempts.slice(midpoint);
      const newerHalf = attempts.slice(0, midpoint);
      
      const olderAccuracy = olderHalf.filter(a => a.status === 'CORRECT').length / olderHalf.length;
      const newerAccuracy = newerHalf.filter(a => a.status === 'CORRECT').length / newerHalf.length;
      
      improvementRate = newerAccuracy - olderAccuracy;
    }

    // Consecutive streaks (from most recent)
    let consecutiveCorrect = 0;
    let consecutiveIncorrect = 0;
    for (const attempt of attempts) {
      if (attempt.status === 'CORRECT') {
        consecutiveCorrect++;
        consecutiveIncorrect = 0;
      } else {
        consecutiveIncorrect++;
        consecutiveCorrect = 0;
      }
      if (consecutiveCorrect > 0 || consecutiveIncorrect > 0) break;
    }

    return {
      accuracy,
      avgTime,
      recentAccuracy,
      speedIndex,
      consistencyScore,
      improvementRate,
      consecutiveCorrect,
      consecutiveIncorrect,
    };
  }

  calculateConfidenceScore(metrics: PerformanceMetrics): number {
    const weights = PERFORMANCE_WEIGHTS;

    const accuracyComponent = metrics.accuracy * weights.accuracy;
    const speedComponent = (metrics.speedIndex / 2.0) * weights.speed;
    const consistencyComponent = metrics.consistencyScore * weights.consistency;
    const confidenceComponent = metrics.recentAccuracy * weights.confidence;
    const velocityComponent = ((metrics.improvementRate + 1) / 2) * weights.velocity;

    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    const confidence = 
      (accuracyComponent + speedComponent + consistencyComponent + 
       confidenceComponent + velocityComponent) / totalWeight;

    return Math.min(Math.max(confidence, 0), 1);
  }

  calculateLearningVelocity(
    attempts: Array<{ status: string; solvedAt: Date }>,
    masteryLevel: number
  ): number {
    if (attempts.length < 4) return 0;

    // Compare recent quarter vs earlier quarter
    const quarterSize = Math.floor(attempts.length / 4);
    const recentQuarter = attempts.slice(0, quarterSize);
    const earlierQuarter = attempts.slice(-quarterSize);

    const recentAccuracy = recentQuarter.filter(a => a.status === 'CORRECT').length / recentQuarter.length;
    const earlierAccuracy = earlierQuarter.filter(a => a.status === 'CORRECT').length / earlierQuarter.length;

    const rawVelocity = recentAccuracy - earlierAccuracy;

    // Normalize by mastery level (harder to improve at high mastery)
    const masteryNormalization = 1 - (masteryLevel / 100) * 0.6;

    return rawVelocity * masteryNormalization;
  }

  calculateAverageDifficulty(
    attempts: Array<{ question?: { difficulty?: number } }>
  ): number {
    const difficulties = attempts
      .map(a => a.question?.difficulty)
      .filter((d): d is number => d !== undefined && d !== null);

    if (difficulties.length === 0) return 0.5;

    // Normalize from 1-5 scale to 0-1 scale
    const normalized = difficulties.map(d => d / 5);
    return normalized.reduce((sum, d) => sum + d, 0) / normalized.length;
  }
}

