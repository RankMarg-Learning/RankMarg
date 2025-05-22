import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { AttemptType } from "@prisma/client";
import { getAuthSession } from "@/utils/session";

export async function POST(req: Request) {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as AttemptType;

    const {
        questionId,
        isCorrect,
        answer,
        timing,
        reactionTime,
        isHintUsed,
        id,
    } = body;

    const session = await getAuthSession()
    if (!session || !session.user) {
        return jsonResponse(null, {
            success: false,
            message: "Unauthorized",
            status: 401,
        });
    }

    try {
        const attemptData: any = {
            userId: session.user.id,
            questionId,
            type,
            answer,
            reactionTime,
            status: isCorrect ? "CORRECT" : "INCORRECT",
            hintsUsed: isHintUsed,
            timing,
        };

        if (type === AttemptType.SESSION) {
            attemptData.practiceSessionId = id;
        } else if (type === AttemptType.TEST) {
            attemptData.testParticipationId = id;
        }

        await prisma.attempt.create({ data: attemptData });

        if (type === AttemptType.SESSION) {
            await prisma.practiceSession.update({
                where: { id },
                data: {
                    questionsSolved: {
                        increment: 1,
                    },
                    ...(isCorrect && {
                        correctAnswers: { increment: 1 },
                    }),
                },
            });
        }

        return jsonResponse(null, { success: true, message: "Ok", status: 200 });
    } catch (error) {
        console.log("[Attempt] :", error);
        return jsonResponse(null, {
            success: false,
            message: "Internal Server Error",
            status: 500,
        });
    }
}
