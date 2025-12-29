import prisma from "@repo/db";
import { addDays, startOfDay } from "date-fns";

/**
 * Handles subject-level scheduling constraints
 * Ensures only one topic per subject is scheduled per day
 */
export class SubjectConstraintHandler {
  /**
   * Finds the next available date for a topic in a subject, ensuring
   * only one topic per subject is scheduled per day
   */
  async findNextAvailableDateForSubject(
    userId: string,
    subjectId: string,
    proposedDate: Date,
    excludeTopicId: string
  ): Promise<Date> {
    // Get all topics in the same subject for this user
    const topicsInSubject = await prisma.topicMastery.findMany({
      where: {
        userId,
        topic: {
          subjectId,
        },
      },
      select: {
        topicId: true,
      },
    });

    const topicIds = topicsInSubject.map((t) => t.topicId).filter((id) => id !== excludeTopicId);

    if (topicIds.length === 0) {
      // No other topics in this subject, use proposed date
      return proposedDate;
    }

    // Get all scheduled review dates for other topics in this subject
    const existingSchedules = await prisma.reviewSchedule.findMany({
      where: {
        userId,
        topicId: { in: topicIds },
      },
      select: {
        nextReviewAt: true,
      },
    });

    // Create a set of dates that are already occupied (normalized to start of day)
    const occupiedDates = new Set<string>();
    existingSchedules.forEach((schedule) => {
      const dateKey = startOfDay(schedule.nextReviewAt).toISOString();
      occupiedDates.add(dateKey);
    });

    // Start checking from the proposed date
    let candidateDate = startOfDay(proposedDate);
    const maxDaysToCheck = 365; // Safety limit
    let daysChecked = 0;

    while (daysChecked < maxDaysToCheck) {
      const dateKey = candidateDate.toISOString();
      
      // If this date is not occupied, we can use it
      if (!occupiedDates.has(dateKey)) {
        return candidateDate;
      }

      // Move to next day
      candidateDate = addDays(candidateDate, 1);
      daysChecked++;
    }

    // Fallback: if we couldn't find a date within a year, return the proposed date
    // This should rarely happen in practice
    return proposedDate;
  }
}

