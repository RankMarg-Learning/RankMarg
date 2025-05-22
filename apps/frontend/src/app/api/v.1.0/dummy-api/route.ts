import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";
import { endOfDay, startOfDay } from "date-fns";
import { NextApiRequest } from "next";
import jwt from "jsonwebtoken";

// Improved type definitions
export type SessionType = "all" | "individual" | "today";

interface SessionResponseBase {
    id: string;
    date: string;
    title: string;
    questionsAttempted: number;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    duration: number;
    isCompleted: boolean;
    totalTimeTaken: number;
}

interface AllSessionResponse extends SessionResponseBase {
    topicName: string;
    subtopics: string[];
}

interface TodaySessionResponse extends SessionResponseBase {
    difficultyLevel: number;
    startTime: string | null;
    lastAttempt: string | null;
    keySubtopics: string[];
}

type SessionResponse = AllSessionResponse | TodaySessionResponse;


function calculateAccuracy(correct: number, total: number): number {
    return total > 0 ? Math.round((correct / total) * 100) : 0;
}

export async function GET(req: NextApiRequest) {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("_type") || "all") as SessionType;
    const userId = searchParams.get("id");
    const subjectId = searchParams.get("_subjectId");
    const done = searchParams.get("_done_item") === "true";
    const count = searchParams.get("_count") ? parseInt(searchParams.get("_count")!) : undefined;
    const subtopicLimit = searchParams.get("_subtopic_limit") ? parseInt(searchParams.get("_subtopic_limit")!) : 3;

    try {
        const token = req.cookies["next-auth.session-token"];
        const secret = process.env.NEXTAUTH_SECRET;
        const jwtoken = jwt.verify(token, secret);
        console.log("Decoded JWT:", jwtoken);

        // // Authentication check
        // const session = await getAuthSession();
        // const userId = session?.user?.id;

        if (!userId) {
            return jsonResponse(null, {
                success: false,
                message: "Authentication required",
                status: 401
            });
        }

        // Build query conditions
        const dateFilter = type === "today" ? {
            createdAt: {
                gte: startOfDay(new Date()),
                lt: endOfDay(new Date())
            }
        } : {};

        // Single optimized query with all necessary relations
        const sessions = await prisma.practiceSession.findMany({
            where: {
                userId,
                ...(subjectId ? { subjectId } : {}),
                ...(done ? { isCompleted: true } : {}),
                ...dateFilter
            },
            orderBy: {
                createdAt: "desc"
            },
            ...(count ? { take: count } : {}),
            include: {
                questions: {
                    include: {
                        question: {
                            include: {
                                topic: { select: { id: true, name: true } },
                                subTopic: { select: { id: true, name: true } },
                            }
                        }
                    }
                },
                attempts: {
                    orderBy: {
                        solvedAt: "desc"
                    },
                    take: 1,
                    select: {
                        timing:true,
                        solvedAt: true
                    }
                }
            },
        });

        if (sessions.length === 0) {
            return jsonResponse([], {
                success: true,
                message: "No Practice Sessions Found",
                status: 200
            });
        }

        // Get subject names in a single query if needed
        const subjectIds = Array.from(
            new Set(sessions.map(s => s.subjectId).filter(Boolean))
        );

        const subjects = subjectIds.length > 0
            ? await prisma.subject.findMany({
                where: { id: { in: subjectIds as string[] } },
                select: { id: true, name: true }
            })
            : [];

        const subjectMap = Object.fromEntries(
            subjects.map(subject => [subject.id, subject.name])
        );

        // Process all sessions at once
        const formattedSessions: SessionResponse[] = sessions.map(session => {
            // Extract questions for this session with related data
            const sessionQuestions = session.questions.map(q => q.question).filter(Boolean);
            
            
            // Analyze topics and subtopics
            const topicsMap = new Map<string, { id: string, name: string, count: number }>();
            const subtopicsMap = new Map<string, { id: string, name: string, count: number }>();

            // Track difficulty
            let totalDifficulty = 0;
            let difficultyCounts = 0;

            // Process questions to extract metrics
            sessionQuestions.forEach(question => {
                // Track difficulty
                if (question?.difficulty) {
                    totalDifficulty += question.difficulty;
                    difficultyCounts++;
                }

                // Track topics
                if (question?.topic) {
                    const topicId = question.topic.id;
                    if (!topicsMap.has(topicId)) {
                        topicsMap.set(topicId, {
                            id: topicId,
                            name: question.topic.name,
                            count: 0
                        });
                    }
                    topicsMap.get(topicId)!.count++;
                }

                // Track subtopics
                if (question?.subTopic) {
                    const subtopicId = question.subTopic.id;
                    if (!subtopicsMap.has(subtopicId)) {
                        subtopicsMap.set(subtopicId, {
                            id: subtopicId,
                            name: question.subTopic.name,
                            count: 0
                        });
                    }
                    subtopicsMap.get(subtopicId)!.count++;
                }
            });

            // Calculate metrics
            const sortedTopics = Array.from(topicsMap.values())
                .sort((a, b) => b.count - a.count);

            const sortedSubtopics = Array.from(subtopicsMap.values())
                .sort((a, b) => b.count - a.count)
                .slice(0, subtopicLimit);

            const avgDifficulty = difficultyCounts > 0
                ? Math.round(totalDifficulty / difficultyCounts * 10) / 10
                : 0;
            const totalTimeTaken = session.attempts.reduce((sum, attempt) => sum + attempt.timing, 0);
            const correctAnswers = session.correctAnswers ?? 0;
            const questionsSolved = session.questionsSolved ?? 0;
            const totalQuestions = session.questions.length;
            const accuracy = calculateAccuracy(correctAnswers, questionsSolved);

            // Add safe time calculation
            const duration = session.duration || 0;
            const lastAttempt = session.attempts[0]?.solvedAt;

            // Base response that all types share
            const baseResponse: SessionResponseBase = {
                id: session.id,
                date: session.createdAt.toISOString(),
                title: session.subjectId && subjectMap[session.subjectId]
                    ? subjectMap[session.subjectId]
                    : 'General Practice',
                questionsAttempted: questionsSolved,
                totalQuestions: totalQuestions,
                correctAnswers: correctAnswers,
                accuracy,
                duration: duration,
                totalTimeTaken:totalTimeTaken,
                isCompleted: session.isCompleted
            };

            // Return type-specific responses
            if (type === "today") {
                return {
                    ...baseResponse,
                    difficultyLevel: avgDifficulty,
                    startTime: session.startTime?.toISOString() || null,
                    lastAttempt: lastAttempt ? lastAttempt.toISOString() : null,
                    keySubtopics: sortedSubtopics.map(st => st.name),
                    
                } as TodaySessionResponse;
            } else {
                // For "all" or other types
                return {
                    ...baseResponse,
                    topicName: sortedTopics.length > 0 ? sortedTopics[0].name : "N/A",
                    subtopics: sortedSubtopics.map(st => st.name)
                } as AllSessionResponse;
            }
        });

        return jsonResponse(formattedSessions, {
            success: true,
            message: "Success",
            status: 200
        });
    } catch (error) {
        console.error("Error fetching practice sessions:", error);



        return jsonResponse(null, {
            success: false,
            message: "Internal Server Error",
            status: 500
        });
    }
}