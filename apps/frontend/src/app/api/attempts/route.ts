import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { AttemptType, SubmitStatus, Prisma } from "@prisma/client";
import { getAuthSession } from "@/utils/session";
import { AttemptCreateData, AttemptRequestBody } from "@/types";



export async function POST(req: Request): Promise<Response> {
    try {
        const body: AttemptRequestBody = await req.json();
        const { searchParams }: URL = new URL(req.url);
        const attemptType: AttemptType | null = searchParams.get("type") as AttemptType;

        const {
            questionId,
            isCorrect,
            answer,
            timing,
            reactionTime,
            isHintUsed,
            id,
        }: AttemptRequestBody = body;

        const session = await getAuthSession();
        if (!session?.user) {
            return jsonResponse(null, {
                success: false,
                message: "Unauthorized",
                status: 401,
            });
        }

        const userId: string = session.user.id;

        const isFirstAttemptToday: boolean = await checkFirstAttemptToday(userId);

        const attemptData: AttemptCreateData = {
            userId,
            questionId,
            type: attemptType,
            answer,
            reactionTime,
            status: isCorrect ? SubmitStatus.CORRECT : SubmitStatus.INCORRECT,
            hintsUsed: isHintUsed,
            timing,
        };

        if (attemptType === AttemptType.SESSION) {
            attemptData.practiceSessionId = id;
        } else if (attemptType === AttemptType.TEST) {
            attemptData.testParticipationId = id;
        }

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {

            await tx.attempt.create({ data: attemptData });

            if (attemptType === AttemptType.SESSION) {
                await updatePracticeSessionStats(tx, id, isCorrect);
            }

            if (isFirstAttemptToday) {
                await updateUserStreak(tx, userId, isCorrect);
            }
        });

        return jsonResponse(null, {
            success: true,
            message: "Attempt recorded successfully",
            status: 200,
        });

    } catch (error: unknown) {
        console.error("[AttemptAPI] Error:", error);
        return jsonResponse(null, {
            success: false,
            message: "Failed to record attempt",
            status: 500,
        });
    }
}


async function checkFirstAttemptToday(userId: string): Promise<boolean> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAttemptCount = await prisma.attempt.count({
        where: {
            userId,
            solvedAt: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    return todayAttemptCount === 0;
}


async function updatePracticeSessionStats(
    tx: Prisma.TransactionClient,
    sessionId: string,
    isCorrect: boolean,
): Promise<void> {

    const currentSession = await tx.practiceSession.findUnique({
        where: { id: sessionId },
        select: {
            questionsSolved: true,
            startTime: true,
            isCompleted: true,
            createdAt: true
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


async function updateUserStreak(
    tx: Prisma.TransactionClient,
    userId: string,
    isCorrect: boolean
): Promise<void> {

    const userPerformance = await tx.userPerformance.findUnique({
        where: { userId },
        select: { streak: true },
    });
    const currentStreak: number = userPerformance?.streak ?? 0;
    let newStreak: number;

    if (isCorrect) {
        newStreak = currentStreak + 1;
    } else {
        newStreak = 0;
    }

    await tx.userPerformance.upsert({
        where: { userId },
        update: { streak: newStreak },
        create: {
            userId,
            streak: newStreak,
            totalAttempts: 0,
            correctAttempts: 0,
            accuracy: 0,
        },
    });
}