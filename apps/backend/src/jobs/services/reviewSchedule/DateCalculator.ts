import { addDays, addHours, startOfDay } from "date-fns";

/**
 * Calculates review dates from intervals
 */
export class DateCalculator {
  calculateNextReviewDate(lastReviewedAt: Date, intervalDays: number): Date {
    const wholeDays = Math.floor(intervalDays);
    const fractionalDay = intervalDays - wholeDays;
    const hours = Math.round(fractionalDay * 24);

    let nextReview = addDays(startOfDay(lastReviewedAt), wholeDays);
    if (hours > 0) {
      nextReview = addHours(nextReview, hours);
    }

    // Ensure next review is never in the past
    const now = new Date();
    if (nextReview < now) {
      return now;
    }

    return nextReview;
  }
}

