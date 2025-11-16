import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import prisma from "@repo/db";
import { Prisma } from "@prisma/client";
import { AttemptType, MetricType, SubmitStatus } from "@repo/db/enums";
import { NextFunction, Response } from "express";

interface AttemptRequestBody {
  questionId: string;
  isCorrect: boolean;
  answer: string;
  timing: number;
  reactionTime?: number;
  isHintUsed: boolean;
  id: string;
}
interface AttemptCreateData {
  userId: string;
  questionId: string;
  type: AttemptType;
  answer: string;
  reactionTime?: number;
  status: SubmitStatus;
  hintsUsed: boolean;
  timing: number;
  practiceSessionId?: string;
  testParticipationId?: string;
}
interface MetricUpdateItem {
  userId: string;
  metricType: MetricType;
  increment: number;
}
interface MistakeRequestBody {
  attemptId: string;
  mistake: string;
}

export class AttemptsController {
  createAttempt = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: AttemptRequestBody = req.body;
      const attemptType: AttemptType | null = req.query.type as AttemptType;
      const {
        questionId,
        isCorrect,
        answer,
        timing,
        reactionTime,
        isHintUsed,
        id,
      } = body;

      const userId = req.user?.id;
      const attemptData: AttemptCreateData = {
        userId,
        questionId,
        type: attemptType,
        answer,
        reactionTime,
        status: isCorrect ? SubmitStatus.CORRECT : SubmitStatus.INCORRECT,
        hintsUsed: isHintUsed,
        timing,
        ...(attemptType === AttemptType.SESSION
          ? { practiceSessionId: id }
          : {}),
        ...(attemptType === AttemptType.TEST
          ? { testParticipationId: id }
          : {}),
      };
      const createdAttempt = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const newAttempt = await tx.attempt.create({
            data: attemptData,
            select: { id: true, questionId: true, answer: true },
          });

          const promises: Promise<any>[] = [];

          if (attemptType === AttemptType.SESSION) {
            promises.push(updatePracticeSessionStats(tx, id, isCorrect));
          }

          promises.push(updateUserPerformanceOptimized(tx, userId, isCorrect));

          promises.push(updateUserMetricsOptimized(tx, userId, isCorrect));

          await Promise.all(promises);

          return newAttempt;
        }
      );
      ResponseUtil.success(res, createdAttempt, "Attempt created");
    } catch (error) {
      next(error);
    }
  };
  getAttempts = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { type } = req.query;
      if (type !== "calendar") {
        ResponseUtil.error(res, "Invalid type parameter", 400);
      }
      const userId = req.user?.id;
      const calendarData = (await prisma.$queryRaw`
      SELECT 
          DATE("solvedAt") as date,
          COUNT(*) as "totalAttempts"
      FROM "Attempt" 
      WHERE "userId" = ${userId}
          AND "solvedAt" IS NOT NULL
      GROUP BY DATE("solvedAt")
      ORDER BY DATE("solvedAt") DESC
      LIMIT 365
  `) as Array<{
        date: Date;
        totalAttempts: bigint;
      }>;
      const formattedCalendarData = calendarData.map((day) => ({
        date: day.date.toISOString().split("T")[0],
        totalAttempts: Number(day.totalAttempts),
      }));
      ResponseUtil.success(res, formattedCalendarData, "Ok", 200, undefined, {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=30",
        Vary: "Authorization",
      });
    } catch (error) {
      next(error);
    }
  };
  updateMistakeByAttemptId = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body: MistakeRequestBody = req.body;
      const { attemptId, mistake } = body;
      if (!attemptId || !mistake) {
        ResponseUtil.error(
          res,
          "Attempt ID and mistake reason are required",
          400
        );
      }
      const userId = req.user?.id;
      const updatedAttempt = await prisma.attempt.updateMany({
        where: { id: attemptId, userId: userId },
        data: { mistake: mistake },
      });
      if (updatedAttempt.count === 0) {
        ResponseUtil.error(res, "Attempt not found or unauthorized", 404);
      }
      ResponseUtil.success(res, "Mistake feedback recorded successfully");
    } catch (error) {
      next(error);
    }
  };
}

async function updatePracticeSessionStats(
  tx: Prisma.TransactionClient,
  sessionId: string,
  isCorrect: boolean
): Promise<void> {
  const currentSession = await tx.practiceSession.findUnique({
    where: { id: sessionId },
    select: {
      questionsSolved: true,
      startTime: true,
    },
  });

  if (!currentSession) {
    throw new Error(`Practice session ${sessionId} not found`);
  }

  const updateData: Prisma.PracticeSessionUpdateInput = {
    questionsSolved: { increment: 1 },
  };

  if (!currentSession.startTime && currentSession.questionsSolved === 0) {
    updateData.startTime = new Date();
  }

  if (isCorrect) {
    updateData.correctAnswers = { increment: 1 };
  }

  await tx.practiceSession.update({
    where: { id: sessionId },
    data: updateData,
  });
}

async function updateUserMetricsOptimized(
  tx: Prisma.TransactionClient,
  userId: string,
  isCorrect: boolean
): Promise<void> {
  const metricsToUpdate: MetricUpdateItem[] = [
    {
      userId,
      metricType: MetricType.TOTAL_QUESTIONS,
      increment: 1,
    },
  ];

  if (isCorrect) {
    metricsToUpdate.push({
      userId,
      metricType: MetricType.CORRECT_ATTEMPTS,
      increment: 1,
    });
  }

  await Promise.all(
    metricsToUpdate.map(({ userId, metricType, increment }) =>
      tx.metric.upsert({
        where: {
          userId_metricType: {
            userId: userId,
            metricType: metricType,
          },
        },
        update: {
          currentValue: { increment },
        },
        create: {
          userId,
          metricType,
          currentValue: increment,
          previousValue: 0,
        },
      })
    )
  );
}

async function updateUserPerformanceOptimized(
  tx: Prisma.TransactionClient,
  userId: string,
  isCorrect: boolean
): Promise<void> {
  const result = await tx.userPerformance.upsert({
    where: { userId },
    update: {
      totalAttempts: { increment: 1 },
      correctAttempts: isCorrect ? { increment: 1 } : undefined,
    },
    create: {
      userId,
      totalAttempts: 1,
      correctAttempts: isCorrect ? 1 : 0,
      accuracy: isCorrect ? 100 : 0,
    },
    select: {
      totalAttempts: true,
      correctAttempts: true,
    },
  });

  if (result.totalAttempts > 1) {
    const newAccuracy = (result.correctAttempts / result.totalAttempts) * 100;
    await tx.userPerformance.update({
      where: { userId },
      data: { accuracy: newAccuracy },
    });
  }
}
