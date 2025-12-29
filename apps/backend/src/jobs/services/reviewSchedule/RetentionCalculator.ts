import { masteryConfig } from '../../../services/mastery/MasteryConfig';

/**
 * Calculates retention strength and recall probability
 */
export class RetentionCalculator {
  computeRetentionStrength(
    correctAttempts: number,
    totalAttempts: number,
    avgTime: number,
    examCode: string
  ): number {
    if (totalAttempts === 0) return 0.5;

    const idealTime = masteryConfig.getExamConfig(examCode).idealTimePerQuestion;

    // Component 1: Accuracy (70% weight)
    const accuracy = correctAttempts / totalAttempts;

    // Component 2: Speed efficiency (30% weight)
    const timeRatio = idealTime / Math.max(avgTime, 1);
    const speedEfficiency = Math.min(Math.max(timeRatio, 0), 1.5) / 1.5;

    // Combined retention with emphasis on accuracy
    const retention = accuracy * 0.70 + speedEfficiency * 0.30;

    return Math.min(Math.max(retention, 0), 1);
  }

  computeRecallProbability(
    retentionStrength: number,
    daysSinceReview: number
  ): number {
    // Exponential forgetting curve: P(t) = e^(-λt)
    // λ (decay rate) inversely proportional to retention strength
    
    const baseDecay = masteryConfig.forgettingCurveParams.decayRate;
    const adjustedDecay = baseDecay * (1.2 - retentionStrength);
    
    // Apply exponential decay
    const probability = Math.exp(-adjustedDecay * Math.max(daysSinceReview, 0));
    
    return Math.min(Math.max(probability, 0), 1);
  }
}

