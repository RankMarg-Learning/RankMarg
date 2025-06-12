import prisma from "@/lib/prisma"
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";
import { Stream } from "@prisma/client";

interface SubjectData {
  subject: any;
  topicIds: string[];
}

export async function POST(req: Request) {

    try {
        const authSession = await getAuthSession();
        if (!authSession?.user) {
            return jsonResponse(null, { success: false, message: "Unauthorized", status: 401 });
        }

        const userStream = authSession.user.stream as Stream;
        
        const currentTopics = await prisma.currentStudyTopic.findMany({
            where: { 
                userId: authSession.user.id,
                isCurrent: true,
                isCompleted: false
            },
            include: {
                subject: true,
                topic: true,
            },
        });

        if (!currentTopics.length) {
            return jsonResponse(null, { success: false, message: "No current topic found", status: 404 });
        }

        const subjectTopicsMap = new Map<string, SubjectData>();
        currentTopics.forEach(cst => {
            if (!subjectTopicsMap.has(cst.subjectId)) {
                subjectTopicsMap.set(cst.subjectId, {
                    subject: cst.subject,
                    topicIds: []
                });
            }
            subjectTopicsMap.get(cst.subjectId)?.topicIds.push(cst.topicId);
        });

        const createdSessions = [];
        const sessionErrors = [];

        for (const [subjectId, subjectData] of Array.from(subjectTopicsMap.entries())) {
            try {
                const questionsFromTopics = await prisma.question.findMany({
                    where: {
                        topicId: { in: subjectData.topicIds },
                        stream: userStream,
                        isPublished: true,
                        difficulty: { lte: 2 }
                    },
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                });

                const remainingCount = Math.max(0, 5 - questionsFromTopics.length);
                const questionsFromSubject = remainingCount > 0 
                    ? await prisma.question.findMany({
                        where: {
                            subjectId,
                            stream: userStream,
                            isPublished: true,
                            difficulty: { lte: 2 },
                            id: { notIn: questionsFromTopics.map(q => q.id) }
                        },
                        take: remainingCount,
                        orderBy: { createdAt: 'desc' }
                    })
                    : [];

                const subjectQuestions = [...questionsFromTopics, ...questionsFromSubject];

                if (!subjectQuestions.length) {
                    console.warn(`No questions found for subject: ${subjectData.subject.name}`);
                    continue;
                }

                const practiceSession = await prisma.practiceSession.create({
                    data: {
                        userId: authSession.user.id,
                        subjectId,
                        questionsSolved: 0,
                        correctAnswers: 0,
                        isCompleted: false,
                        startTime: new Date(),
                        duration: subjectQuestions.length * 2,
                        questions: {
                            create: subjectQuestions.map(question => ({
                                questionId: question.id
                            }))
                        }
                    },
                    include: {
                        questions: {
                            include: {
                                question: {
                                    include: {
                                        options: true,
                                        subject: true,
                                        topic: true,
                                        subTopic: true
                                    }
                                }
                            }
                        }
                    }
                });

                createdSessions.push(practiceSession);
            } catch (error) {
                console.error(`Error creating session for subject ${subjectId}:`, error);
                sessionErrors.push({ subjectId, error: error instanceof Error ? error.message : 'Unknown error' });
            }



        }

        if (createdSessions.length === 0) {
            return jsonResponse(null, { 
                success: false, 
                message: "Failed to create any practice sessions", 
                status: 500 
            });
        }

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