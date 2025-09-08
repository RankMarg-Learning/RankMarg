// Shifted to Backend
export const dynamic = "force-dynamic";

import { getDayWindow } from "@/lib/dayRange";
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";

export type SessionType = "all" | "individual" | "today";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("_type") || "all" as SessionType;
    const subjectId = searchParams.get("_subjectId");
    const done = searchParams.get("_done_item") === "true";
    const count = searchParams.get("_count") ? parseInt(searchParams.get("_count")!) : undefined;
    const subtopicLimit = searchParams.get("_subtopic_limit") ? parseInt(searchParams.get("_subtopic_limit")!) : 10;

    try {
        // Validate input parameters
        if (count !== undefined && (isNaN(count) || count <= 0)) {
            return jsonResponse(null, { 
                success: false, 
                message: "Invalid count parameter. Must be a positive number.", 
                status: 400 
            });
        }

        if (isNaN(subtopicLimit) || subtopicLimit <= 0) {
            return jsonResponse(null, { 
                success: false, 
                message: "Invalid subtopic_limit parameter. Must be a positive number.", 
                status: 400 
            });
        }

        if (!["all", "individual", "today"].includes(type)) {
            return jsonResponse(null, { 
                success: false, 
                message: "Invalid type parameter. Must be 'all', 'individual', or 'today'.", 
                status: 400 
            });
        }

        // Get user session with error handling
        let session;
        try {
            session = await getAuthSession();
        } catch (sessionError) {
            console.error("Error getting auth session:", sessionError);
            return jsonResponse(null, { 
                success: false, 
                message: "Authentication failed", 
                status: 401 
            });
        }

        const userId = session?.user?.id;

        if (!userId) {
            return jsonResponse(null, { 
                success: false, 
                message: "Authentication required. Please log in.", 
                status: 401 
            });
        }

        // Build query filters
        let queryWhere: any = {
            userId,
            ...(subjectId ? { subjectId } : {}),
            ...(done ? { isCompleted: true } : {})
        };

        if (type === "today") {
            try {
                const { from, to } = getDayWindow();

                queryWhere.createdAt = {
                    gte: from,
                    lt: to
                };
            } catch (dateError) {
                console.error("Error processing date filters:", dateError);
                return jsonResponse(null, { 
                    success: false, 
                    message: "Error processing date filters", 
                    status: 500 
                });
            }
        }

        // Fetch sessions with error handling
        let sessions;
        try {
            sessions = await prisma.practiceSession.findMany({
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
        } catch (dbError) {
            console.error("Database error fetching practice sessions:", dbError);
            return jsonResponse(null, { 
                success: false, 
                message: "Failed to fetch practice sessions", 
                status: 500 
            });
        }

        if (!sessions || sessions.length === 0) {
            return jsonResponse([], { 
                success: true, 
                message: "No practice sessions found", 
                status: 200 
            });
        }

        // Get subject data with error handling
        const subjectIds = Array.from(new Set(sessions.map(s => s.subjectId).filter(Boolean))) as string[];
        let subjects = [];
        let subjectMap: Record<string, string> = {};

        if (subjectIds.length > 0) {
            try {
                subjects = await prisma.subject.findMany({
                    where: { id: { in: subjectIds } },
                    select: { id: true, name: true }
                });

                subjectMap = subjects.reduce((acc, subject) => {
                    acc[subject.id] = subject.name;
                    return acc;
                }, {} as Record<string, string>);
            } catch (subjectError) {
                console.error("Error fetching subjects:", subjectError);
                // Continue without subject names rather than failing completely
                console.warn("Continuing without subject names due to database error");
            }
        }

        // Get question data with error handling
        const questionIds = sessions.flatMap(s => s.questions?.map(q => q.questionId) || []);
        let questions = [];
        let questionsMap: Record<string, any> = {};

        if (questionIds.length > 0) {
            try {
                questions = await prisma.question.findMany({
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

                questionsMap = questions.reduce((acc, q) => {
                    acc[q.id] = q;
                    return acc;
                }, {} as Record<string, any>);
            } catch (questionError) {
                console.error("Error fetching questions:", questionError);
                // Continue without question details rather than failing completely
                console.warn("Continuing without question details due to database error");
            }
        }

        // Get last attempts with error handling
        const sessionIds = sessions.map(s => s.id);
        let lastAttemptMap: Record<string, Date> = {};

        if (sessionIds.length > 0) {
            try {
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

                lastAttemptMap = lastAttempts.reduce((acc, attempt) => {
                    if (attempt.practiceSessionId && attempt.solvedAt) {
                        acc[attempt.practiceSessionId] = attempt.solvedAt;
                    }
                    return acc;
                }, {} as Record<string, Date>);
            } catch (attemptError) {
                console.error("Error fetching last attempts:", attemptError);
                // Continue without last attempt data rather than failing completely
                console.warn("Continuing without last attempt data due to database error");
            }
        }

        // Process session data with error handling
        const formatted = sessions.map((session) => {
            try {
                // Safely get session questions
                const sessionQuestions = (session.questions || [])
                    .map(q => questionsMap[q.questionId])
                    .filter(Boolean);

                // Group topics and subtopics
                const topicsMap: Record<string, { id: string, name: string, count: number }> = {};
                const subtopicsMap: Record<string, { id: string, name: string, count: number }> = {};

                // Calculate average difficulty
                let totalDifficulty = 0;
                let difficultyCounts = 0;

                sessionQuestions.forEach(question => {
                    try {
                        if (question?.difficulty && typeof question.difficulty === 'number') {
                            totalDifficulty += question.difficulty;
                            difficultyCounts++;
                        }

                        // Track topics
                        if (question?.topic?.id && question?.topic?.name) {
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
                        if (question?.subTopic?.id && question?.subTopic?.name) {
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
                    } catch (questionProcessError) {
                        console.error("Error processing question:", questionProcessError);
                        // Continue with next question
                    }
                });

                // Sort topics and subtopics by count
                const sortedTopics = Object.values(topicsMap).sort((a, b) => b.count - a.count);
                const sortedSubtopics = Object.values(subtopicsMap)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, Math.max(1, subtopicLimit)); // Ensure at least 1 subtopic if available

                const avgDifficulty = difficultyCounts > 0
                    ? Math.round(((totalDifficulty / difficultyCounts) * 10) / 10)
                    : 0;

                const correctAnswers = session.correctAnswers ?? 0;
                const questionsSolved = session.questionsSolved ?? 0;
                const totalQuestions = session.questions?.length ?? 0;

                const score = `${correctAnswers}/${questionsSolved}`;
                const accuracy = questionsSolved > 0
                    ? Math.round((correctAnswers / questionsSolved) * 100)
                    : 0;

                // Base response that all types will have
                const baseResponse = {
                    id: session.id,
                    date: session.createdAt?.toISOString() || new Date().toISOString(),
                    title: session.subjectId && subjectMap[session.subjectId]
                        ? subjectMap[session.subjectId]
                        : 'Unknown Subject',
                    questionsAttempted: questionsSolved,
                    totalQuestions: totalQuestions,
                    score,
                    accuracy,
                    duration: session.duration || 0,
                    isCompleted: session.isCompleted ?? false
                };

                // Type-specific responses
                if (type === "today") {
                    return {
                        ...baseResponse,
                        difficultyLevel: avgDifficulty,
                        startTime: session.startTime?.toISOString() || null,
                        lastAttempt: session.id in lastAttemptMap 
                            ? lastAttemptMap[session.id].toISOString() 
                            : null,
                        keySubtopics: sortedSubtopics.map(st => st.name),
                        timeRequired: session?.duration || 0
                    };
                } else {
                    // "all" or other types
                    return {
                        ...baseResponse,
                        topicName: sortedTopics.length > 0 ? sortedTopics[0].name : "N/A",
                        subtopics: sortedSubtopics.map(st => st.name)
                    };
                }
            } catch (sessionProcessError) {
                console.error("Error processing session:", sessionProcessError);
                // Return minimal session data if processing fails
                return {
                    id: session.id,
                    date: session.createdAt?.toISOString() || new Date().toISOString(),
                    title: 'Error Processing Session',
                    questionsAttempted: session.questionsSolved ?? 0,
                    totalQuestions: session.questions?.length ?? 0,
                    score: `${session.correctAnswers ?? 0}/${session.questionsSolved ?? 0}`,
                    accuracy: 0,
                    duration: session.duration || 0,
                    isCompleted: session.isCompleted ?? false,
                    error: "Error processing session data"
                };
            }
        });

        return jsonResponse(formatted, { 
            success: true, 
            message: "Practice sessions retrieved successfully", 
            status: 200 
        });

    } catch (error) {
        console.error("Unexpected error in GET /api/practice-sessions:", error);
        
        // Log additional context for debugging
        console.error("Request URL:", req.url);
        console.error("Search params:", {
            type,
            subjectId,
            done,
            count,
            subtopicLimit
        });

        return jsonResponse(null, { 
            success: false, 
            message: "An unexpected error occurred while processing your request", 
            status: 500 
        });
    }
}