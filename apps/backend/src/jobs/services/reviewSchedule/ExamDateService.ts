import prisma from "@repo/db";
import { differenceInDays } from "date-fns";

/**
 * Service for exam date lookups
 */
export class ExamDateService {
  async getDaysUntilExam(userId: string): Promise<number | undefined> {
    const examUser = await prisma.examUser.findFirst({
      where: { userId },
      select: { exam: { select: { examDate: true } } },
      orderBy: { registeredAt: 'desc' },
    });

    if (!examUser?.exam?.examDate) return undefined;

    const daysUntil = differenceInDays(examUser.exam.examDate, new Date());
    return daysUntil > 0 ? daysUntil : undefined;
  }
}

