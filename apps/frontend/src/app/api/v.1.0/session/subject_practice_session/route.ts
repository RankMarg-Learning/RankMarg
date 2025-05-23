export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";
import { endOfDay, startOfDay } from "date-fns";

export type SessionType = "all" | "individual" | "today";


export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("_type") || "all" as SessionType;
    const subjectId = searchParams.get("_subjectId");
    const done = searchParams.get("_done_item") === "true";
    const count = searchParams.get("_count") ? parseInt(searchParams.get("_count")!) : undefined;
    const subtopicLimit = searchParams.get("_subtopic_limit") ? parseInt(searchParams.get("_subtopic_limit")!) : 3;

    try {
        const session = await getAuthSession();

        const userId = session?.user?.id ;

        if (!userId) {
            return jsonResponse(null, { success: false, message: "User ID is required", status: 400 });
        }

        let queryWhere: any = {
            userId,
            ...(subjectId ? { subjectId } : {}),
            ...(done ? { isCompleted: true } : {})
        };

        if (type === "today") {
            //!Change this as per the cron update time 
            const todayStart = startOfDay(new Date());
            const todayEnd = endOfDay(new Date());

            queryWhere.createdAt = {
                gte: todayStart,
                lt: todayEnd
            };
        }

        // Fetch sessions with pagination if count is provided
        const sessions = await prisma.practiceSession.findMany({
            where: queryWhere,
            orderBy: {
                createdAt: "desc"
            },
            ...(count ? { take: count } : {}),
            select: {
                id: true,
                createdAt: true,
                correctAnswers: true,
                questionsSolved: true,
                duration: true,
                subjectId: true,
                startTime: true,
                isCompleted: true,
                questions: {
                    select: {
                        questionId: true
                    }
                }
            },
        });


        if (sessions.length === 0) {
            return jsonResponse([], { success: true, message: "No Practice Sessions Found", status: 200 });
        }

        // Get all subject IDs and fetch subject data
        const subjectIds = Array.from(new Set(sessions.map(s => s.subjectId).filter(Boolean)));
        const subjects = subjectIds.length > 0
            ? await prisma.subject.findMany({
                where: { id: { in: subjectIds } },
                select: { id: true, name: true }
            })
            : [];

        const subjectMap = subjects.reduce((acc, subject) => {
            acc[subject.id] = subject.name;
            return acc;
        }, {} as Record<string, string>);

        // Get all question IDs from the sessions
        const questionIds = sessions.flatMap(s => s.questions.map(q => q.questionId));

        // Fetch questions with topics and subtopics
        const questions = await prisma.question.findMany({
            where: {
                id: { in: questionIds }
            },
            select: {
                id: true,
                difficulty: true,
                topic: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                subTopic: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // Fetch the last attempt for each session
        const sessionIds = sessions.map(s => s.id);
        const lastAttempts = await prisma.attempt.findMany({
            where: {
                practiceSessionId: { in: sessionIds }
            },
            orderBy: {
                solvedAt: "desc"
            },
            distinct: ["practiceSessionId"],
            select: {
                practiceSessionId: true,
                solvedAt: true
            }
        });

        const lastAttemptMap = lastAttempts.reduce((acc, attempt) => {
            if (attempt.practiceSessionId) {
                acc[attempt.practiceSessionId] = attempt.solvedAt;
            }
            return acc;
        }, {} as Record<string, Date>);

        // Create a map of questions by ID
        const questionsMap = questions.reduce((acc, q) => {
            acc[q.id] = q;
            return acc;
        }, {} as Record<string, any>);

        // Process session data based on the type
        const formatted = sessions.map((session) => {
            // Get all questions for this session
            const sessionQuestions = session.questions.map(q => questionsMap[q.questionId]).filter(Boolean);

            // Group topics and subtopics
            const topicsMap: Record<string, { id: string, name: string, count: number }> = {};
            const subtopicsMap: Record<string, { id: string, name: string, count: number }> = {};

            // Calculate average difficulty
            let totalDifficulty = 0;
            let difficultyCounts = 0;

            sessionQuestions.forEach(question => {
                if (question?.difficulty) {
                    totalDifficulty += question.difficulty;
                    difficultyCounts++;
                }

                // Track topics
                if (question?.topic) {
                    const topicId = question.topic.id;
                    if (!topicsMap[topicId]) {
                        topicsMap[topicId] = {
                            id: topicId,
                            name: question.topic.name,
                            count: 0
                        };
                    }
                    topicsMap[topicId].count++;
                }

                // Track subtopics
                if (question?.subTopic) {
                    const subtopicId = question.subTopic.id;
                    if (!subtopicsMap[subtopicId]) {
                        subtopicsMap[subtopicId] = {
                            id: subtopicId,
                            name: question.subTopic.name,
                            count: 0
                        };
                    }
                    subtopicsMap[subtopicId].count++;
                }
            });

            // Sort topics and subtopics by count
            const sortedTopics = Object.values(topicsMap).sort((a, b) => b.count - a.count);

            // Apply subtopic limit from parameters
            const sortedSubtopics = Object.values(subtopicsMap)
                .sort((a, b) => b.count - a.count)
                .slice(0, subtopicLimit);

            const avgDifficulty = difficultyCounts > 0
                ? Math.round(totalDifficulty / difficultyCounts * 10) / 10
                : 0;

            const correctAnswers = session.correctAnswers ?? 0;
            const questionsSolved = session.questionsSolved ?? 0;
            const totalQuestions = session.questions.length;

            const score = `${correctAnswers}/${questionsSolved}`;
            const accuracy = questionsSolved > 0
                ? Math.round((correctAnswers / questionsSolved) * 100)
                : 0;

            // Base response that all types will have
            const baseResponse = {
                id: session.id,
                date: session.createdAt.toISOString(),
                title: session.subjectId && subjectMap[session.subjectId]
                    ? subjectMap[session.subjectId]
                    : 'Unknown Subject',
                questionsAttempted: questionsSolved,
                totalQuestions: totalQuestions,
                score,
                accuracy,
                duration: session.duration ,
                isCompleted: session.isCompleted
            };

            // Type-specific responses
            if (type === "today") {
                return {
                    ...baseResponse,
                    difficultyLevel: avgDifficulty,
                    startTime: session.startTime?.toISOString() || null,
                    lastAttempt: session.id in lastAttemptMap ? lastAttemptMap[session.id].toISOString() : null,
                    keySubtopics: sortedSubtopics.map(st => st.name),
                    timeRequired: session?.duration
                };
            } else {
                // "all" or other types
                return {
                    ...baseResponse,
                    topicName: sortedTopics.length > 0 ? sortedTopics[0].name : "N/A",
                    subtopics: sortedSubtopics.map(st => st.name)
                };
            }
        });

        return jsonResponse(formatted, { success: true, message: "Ok", status: 200 });
    } catch (error) {
        console.error("Error fetching practice sessions:", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
    }
}