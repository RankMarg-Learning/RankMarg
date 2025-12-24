import { UrgencyLevel } from './ReviewScheduleConfig';

/**
 * Calculates exam urgency level based on days until exam
 */
export class UrgencyLevelCalculator {
  determineUrgencyLevel(
    daysUntilExam: number | undefined,
    masteryLevel: number
  ): UrgencyLevel {
    if (!daysUntilExam || daysUntilExam <= 0 || daysUntilExam > 180) {
      return 'NONE';
    }

    // Critical: Last week before exam
    if (daysUntilExam <= 7) {
      return 'CRITICAL';
    }

    // High: 1-3 weeks before exam
    if (daysUntilExam <= 21) {
      return 'HIGH';
    }

    // Medium: 3-6 weeks before exam
    if (daysUntilExam <= 45) {
      return 'MEDIUM';
    }

    // Low: 6 weeks - 3 months before exam
    if (daysUntilExam <= 90) {
      return 'LOW';
    }

    return 'NONE';
  }
}

