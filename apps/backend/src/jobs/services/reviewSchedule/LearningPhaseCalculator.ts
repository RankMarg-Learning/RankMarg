import { LearningPhase } from './ReviewScheduleConfig';

/**
 * Calculates the current learning phase based on performance metrics
 */
export class LearningPhaseCalculator {
  determineLearningPhase(
    totalAttempts: number,
    masteryLevel: number,
    completedReviews: number,
    consecutiveCorrect: number,
    retentionStrength: number
  ): LearningPhase {
    // New topic or minimal attempts
    if (totalAttempts < 3 || masteryLevel < 20) {
      return 'ACQUISITION';
    }

    // Check for phase progression based on multiple criteria
    // MAINTENANCE: Nearly perfect mastery with sustained performance
    if (
      masteryLevel >= 95 &&
      completedReviews >= 15 &&
      consecutiveCorrect >= 8 &&
      retentionStrength >= 0.90
    ) {
      return 'MAINTENANCE';
    }

    // MASTERY: High mastery with consistent performance
    if (
      masteryLevel >= 85 &&
      completedReviews >= 10 &&
      consecutiveCorrect >= 6 &&
      retentionStrength >= 0.80
    ) {
      return 'MASTERY';
    }

    // PROFICIENCY: Good mastery with solid understanding
    if (
      masteryLevel >= 70 &&
      completedReviews >= 7 &&
      consecutiveCorrect >= 4 &&
      retentionStrength >= 0.70
    ) {
      return 'PROFICIENCY';
    }

    // CONSOLIDATION: Building foundation with improving performance
    if (
      masteryLevel >= 50 &&
      completedReviews >= 5 &&
      consecutiveCorrect >= 2 &&
      retentionStrength >= 0.55
    ) {
      return 'CONSOLIDATION';
    }

    // Default to ACQUISITION for everything else
    return 'ACQUISITION';
  }
}

