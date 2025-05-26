import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import { jsonResponse } from "@/utils/api-response";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { sessionId: string } }) {
    const { sessionId } = params;
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return jsonResponse(null, { success: false, message: "Unauthorized", status: 401 });
        }
        
        const practiceSession = await prisma.practiceSession.findUnique({
            where: {
                id: sessionId,
                userId: session.user.id,
            },
            include: {
                questions: {
                    include: {
                        question: {
                            include: {
                                options: true,
                                topic: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                },
                                category: {
                                    select: {
                                        category: true
                                    }
                                }
                            },
                        },
                    },
                },
                attempts: true,
            }
        });

        if (!practiceSession) {
            return jsonResponse(null, { success: false, message: "Practice session not found", status: 404 });
        }

        // // Get attempted question IDs
        // const attemptedQuestionIds = practiceSession.attempts.map(attempt => attempt.questionId);
        
        // // Separate unattempted and attempted questions
        // const unattemptedQuestions = practiceSession.questions.filter(
        //     q => !attemptedQuestionIds.includes(q.question.id)
        // );
        // const attemptedQuestions = practiceSession.questions.filter(
        //     q => attemptedQuestionIds.includes(q.question.id)
        // );
        
        // // Arrange questions: unattempted first, then attempted
        // const arrangedQuestions = [...unattemptedQuestions, ...attemptedQuestions];
        
        // // Update the practice session object with arranged questions
        // const arrangedPracticeSession = {
        //     ...practiceSession,
        //     questions: arrangedQuestions
        // };

        return jsonResponse(practiceSession, { success: true, message: "Ok", status: 200 });

    } catch (error) {
        console.log("[AiPracticeSession-Dynamic] :", error);
        return jsonResponse(error, { success: false, message: "Internal Server Error", status: 500 });
    }
}