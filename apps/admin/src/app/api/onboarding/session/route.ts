import prisma from "@/lib/prisma"
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";

interface SubjectData {
  topicIds: string[];
}

export async function POST(req: Request) {

    try {
        const authSession = await getAuthSession();
        if (!authSession?.user) {
            return jsonResponse(null, { success: false, message: "Unauthorized", status: 401 });
        }

        
        const currentTopics = await prisma.currentStudyTopic.findMany({
            where: { 
                userId: authSession.user.id,
                isCurrent: true,
                isCompleted: false
            },
            select: {
                subjectId: true,
                topicId: true,
            },
        });

        if (!currentTopics.length) {
            return jsonResponse(null, { success: false, message: "No current topic found", status: 404 });
        }

        const subjectTopicsMap = new Map<string, SubjectData>();
        currentTopics.forEach(cst => {
            if (!subjectTopicsMap.has(cst.subjectId)) {
                subjectTopicsMap.set(cst.subjectId, {
                    topicIds: []
                });
            }
            subjectTopicsMap.get(cst.subjectId)?.topicIds.push(cst.topicId);
        });

        const createdSessionIds: string[] = [];
        const sessionErrors: Array<{ subjectId: string, error: string }> = [];

        await Promise.all(
            Array.from(subjectTopicsMap.entries()).map(async ([subjectId, subjectData]) => {
                try {
                    const questionsFromTopics = await prisma.question.findMany({
                        where: {
                            topicId: { in: subjectData.topicIds },
                            isPublished: true,
                            difficulty: { lte: 2 }
                        },
                        select: { id: true },
                        take: 5,
                        orderBy: { createdAt: 'desc' }
                    });

                    const remainingCount = Math.max(0, 5 - questionsFromTopics.length);
                    const questionsFromSubject = remainingCount > 0 
                        ? await prisma.question.findMany({
                            where: {
                                subjectId,
                                isPublished: true,
                                difficulty: { lte: 2 },
                                id: { notIn: questionsFromTopics.map(q => q.id) }
                            },
                            select: { id: true },
                            take: remainingCount,
                            orderBy: { createdAt: 'desc' }
                        })
                        : [];

                    const subjectQuestionIds = [...questionsFromTopics, ...questionsFromSubject].map(q => q.id);

                    if (!subjectQuestionIds.length) {
                        console.warn(`No questions found for subject: ${subjectId}`);
                        return;
                    }

                    const practiceSession = await prisma.practiceSession.create({
                        data: {
                            userId: authSession.user.id,
                            subjectId,
                            questionsSolved: 0,
                            correctAnswers: 0,
                            isCompleted: false,
                            startTime: new Date(),
                            duration: subjectQuestionIds.length * 2,
                        },
                        select: { id: true }
                    });

                    await prisma.practiceSessionQuestions.createMany({
                        data: subjectQuestionIds.map(questionId => ({
                            practiceSessionId: practiceSession.id,
                            questionId,
                        }))
                    });

                    createdSessionIds.push(practiceSession.id);
                } catch (error) {
                    console.error(`Error creating session for subject ${subjectId}:`, error);
                    sessionErrors.push({ subjectId, error: error instanceof Error ? error.message : 'Unknown error' });
                }
            })
        );

        if (createdSessionIds.length === 0) {
            return jsonResponse(null, { 
                success: false, 
                message: "Failed to create any practice sessions", 
                status: 500 
            });
        }

        const createdSessions = await prisma.practiceSession.findMany({
            where: { id: { in: createdSessionIds } },
            include: {
                questions: {
                    include: {
                        question: {
                            include: {
                                options: true,
                                subject: true,
                                topic: true,
                                subTopic: true,
                            }
                        }
                    }
                }
            }
        });

        return jsonResponse(createdSessions, { 
            success: true, 
            message: `Created ${createdSessions.length} practice session(s) successfully`, 
            status: 201 
        });

    } catch (error) {
        console.error("[Onboarding Practice Session]:", error);
        return jsonResponse(null, { 
            success: false, 
            message: "Internal Server Error", 
            status: 500 
        });
    }
}