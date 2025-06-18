import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { AttemptType, SubmitStatus, Prisma, MetricType } from "@prisma/client";
import { getAuthSession } from "@/utils/session";
import { AttemptCreateData, AttemptRequestBody } from "@/types";

interface metricToUpdateType {
    userId: string;
    metricType: MetricType;
    increment: number;
}

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

        // Check if this is the first attempt today (optimized with single query)
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

        // Single optimized transaction
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Create attempt
            await tx.attempt.create({ data: attemptData });

            // Batch all updates in parallel where possible
            const promises: Promise<any>[] = [];

            // Update practice session stats if needed
            if (attemptType === AttemptType.SESSION) {
                promises.push(updatePracticeSessionStats(tx, id, isCorrect));
            }

            // Update user performance with optimized single query
            promises.push(updateUserPerformanceOptimized(tx, userId, isCorrect, isFirstAttemptToday));

            // Update metrics efficiently
            promises.push(updateUserMetricsOptimized(tx, userId, isCorrect));

            await Promise.all(promises);
        });

        return jsonResponse(null, {
            success: true,
            message: "Ok",
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

    const todayAttemptCount = await prisma.attempt.count({
        where: {
            userId,
            solvedAt: {
                gte: startOfDay,
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

// Highly optimized user metrics update
async function updateUserMetricsOptimized(
    tx: Prisma.TransactionClient,
    userId: string,
    isCorrect: boolean,
): Promise<void> {
    const metricsToUpdate:metricToUpdateType[] = [
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

// Completely optimized user performance update with single query
async function updateUserPerformanceOptimized(
    tx: Prisma.TransactionClient,
    userId: string,
    isCorrect: boolean,
    isFirstAttemptToday: boolean
): Promise<void> {
    // Single atomic upsert with calculated accuracy
    const result = await tx.userPerformance.upsert({
        where: { userId },
        update: {
            totalAttempts: { increment: 1 },
            correctAttempts: isCorrect ? { increment: 1 } : undefined,
            streak: isFirstAttemptToday ? (isCorrect ? { increment: 1 } : 0) : undefined,
        },
        create: {
            userId,
            totalAttempts: 1,
            correctAttempts: isCorrect ? 1 : 0,
            streak: isFirstAttemptToday && isCorrect ? 1 : 0,
            accuracy: isCorrect ? 100 : 0,
        },
        select: {
            totalAttempts: true,
            correctAttempts: true,
        },
    });

    // Calculate and update accuracy in a single query if this is an update
    if (result.totalAttempts > 1) {
        const newAccuracy = (result.correctAttempts / result.totalAttempts) * 100;
        await tx.userPerformance.update({
            where: { userId },
            data: { accuracy: newAccuracy },
        });
    }
}