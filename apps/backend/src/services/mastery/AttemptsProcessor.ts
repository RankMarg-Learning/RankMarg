import prisma from "../../lib/prisma";
import { MasteryAttempt } from "../../type/mastery.api.types";

export class AttemptsProcessor {
  async attempts(userId: string, cutoffDate: Date): Promise<MasteryAttempt[]> {
    return await prisma.attempt.findMany({
      where: {
        userId,
        solvedAt: { gte: cutoffDate },
      },
      select: {
        userId: true,
        timing: true,
        reactionTime: true,
        type: true,
        status: true,
        hintsUsed: true,
        solvedAt: true,
        question: {
          select: {
            id: true,
            difficulty: true,
            questionTime: true,
            subtopicId: true,
            topicId: true,
            subjectId: true,
          },
        },
      },
      orderBy: { solvedAt: "desc" },
    });
  }
  organizeAttempts(attempts: MasteryAttempt[]) {
    const subtopicAttempts = new Map<string, MasteryAttempt[]>();
    const subtopicIds = new Set<string>();

    for (const attempt of attempts) {
      const { question } = attempt;

      if (question.subtopicId) {
        subtopicIds.add(question.subtopicId);
        if (!subtopicAttempts.has(question.subtopicId)) {
          subtopicAttempts.set(question.subtopicId, []);
        }
        subtopicAttempts.get(question.subtopicId)?.push(attempt);
      }
    }

    return {
      subtopicAttempts,
      subtopicIds,
    };
  }
}
