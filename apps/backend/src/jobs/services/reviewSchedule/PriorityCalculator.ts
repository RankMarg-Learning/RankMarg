import { differenceInCalendarDays } from 'date-fns';
import { LearningPhase, UrgencyLevel } from './ReviewScheduleConfig';

/**
 * Calculates priority scores for review scheduling
 */
export class PriorityCalculator {
  calculateComprehensivePriority(
    learningPhase: LearningPhase,
    urgencyLevel: UrgencyLevel,
    masteryLevel: number,
    retentionStrength: number,
    consecutiveIncorrect: number,
    lastReviewedAt: Date,
    daysUntilExam?: number
  ): number {
    let priority = 50; // Base priority

    // Component 1: Learning phase urgency (30 points max)
    const phaseScores = {
      ACQUISITION: 30,
      CONSOLIDATION: 22,
      PROFICIENCY: 15,
      MASTERY: 8,
      MAINTENANCE: 3,
    };
    priority += phaseScores[learningPhase];

    // Component 2: Exam urgency (25 points max)
    const urgencyScores = {
      CRITICAL: 25,
      HIGH: 18,
      MEDIUM: 12,
      LOW: 6,
      NONE: 0,
    };
    priority += urgencyScores[urgencyLevel];

    // Component 3: Struggling topic multiplier (20 points max)
    priority += Math.min(consecutiveIncorrect * 8, 20);

    // Component 4: Low mastery urgency (15 points max)
    if (masteryLevel < 50) {
      priority += (50 - masteryLevel) * 0.3;
    }

    // Component 5: Retention risk (10 points max)
    if (retentionStrength < 0.6) {
      priority += (0.6 - retentionStrength) * 16;
    }

    // Component 6: Overdue review penalty (10 points max)
    const daysSinceReview = differenceInCalendarDays(new Date(), lastReviewedAt);
    if (daysSinceReview > 14) {
      priority += Math.min((daysSinceReview - 14) * 0.5, 10);
    }

    // Component 7: Pre-exam weak topic critical boost
    if (daysUntilExam && daysUntilExam <= 21 && masteryLevel < 60) {
      priority += 15;
    }

    // Normalize to 0-100 scale
    return Math.min(Math.max(priority, 0), 100);
  }

  calculateRecommendedDailyLoad(
    learningPhase: LearningPhase,
    urgencyLevel: UrgencyLevel,
    masteryLevel: number
  ): number {
    const OPTIMAL_DAILY_REVIEWS = 15;
    const MAX_DAILY_NEW_TOPICS = 5;
    const MAX_DAILY_REVIEWS = 30;

    let baseLoad = OPTIMAL_DAILY_REVIEWS;

    // Adjust based on learning phase
    if (learningPhase === 'ACQUISITION') {
      baseLoad = MAX_DAILY_NEW_TOPICS;
    } else if (learningPhase === 'CONSOLIDATION') {
      baseLoad = 10;
    }

    // Adjust based on urgency
    const urgencyMultipliers = {
      CRITICAL: 2.0,
      HIGH: 1.5,
      MEDIUM: 1.2,
      LOW: 1.0,
      NONE: 1.0,
    };

    baseLoad *= urgencyMultipliers[urgencyLevel];

    // Cap at maximum
    return Math.min(baseLoad, MAX_DAILY_REVIEWS);
  }
}

