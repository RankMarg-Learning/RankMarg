import prisma from "@repo/db";
import { addDays, startOfDay } from "date-fns";


export class SubjectConstraintHandler {

  async findNextAvailableDateForSubject(
    userId: string,
    subjectId: string,
    proposedDate: Date,
    excludeTopicId: string
  ): Promise<Date> {
    
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
      return proposedDate;
    }

    const existingSchedules = await prisma.reviewSchedule.findMany({
      where: {
        userId,
        topicId: { in: topicIds },
      },
      select: {
        nextReviewAt: true,
      },
    });

    const occupiedDates = new Set<string>();
    existingSchedules.forEach((schedule) => {
      const dateKey = startOfDay(schedule.nextReviewAt).toISOString();
      occupiedDates.add(dateKey);
    });

    let candidateDate = startOfDay(proposedDate);
    const maxDaysToCheck = 365; // Safety limit
    let daysChecked = 0;

    while (daysChecked < maxDaysToCheck) {
      const dateKey:Date = new Date(candidateDate.toISOString());
      
      if (!occupiedDates.has(dateKey.toISOString())) {
        return candidateDate;
      }

      candidateDate = addDays(candidateDate, 1);
      daysChecked++;
    }

    return proposedDate;
  }
}

