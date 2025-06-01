export const dynamic = "force-dynamic";

import { jsonResponse } from "@/utils/api-response";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/utils/session";
import { endOfDay, startOfDay } from "date-fns";
import { cache } from "react";
import { unstable_cache } from "next/cache";

const getSession = cache(async () => {
    try {
        return await getAuthSession();
    } catch (error) {
        console.error("Session retrieval error:", error);
        throw new Error("Failed to retrieve session");
    }
});

const getSubjectMap = unstable_cache(
    async () => {
        try {
            const subjects = await prisma.subject.findMany({
                select: { id: true, name: true }
            });
            return Object.fromEntries(subjects.map(s => [s.id, s.name]));
        } catch (error) {
            console.error("Subject map retrieval error:", error);
            throw new Error("Failed to retrieve subject data");
        }
    },
    ["subject-map"],
    { revalidate: 3600 } 
);

export async function GET(req: Request) {
    try {
        let session;
        try {
            session = await getSession();
        } catch (error) {
            console.error("Session error:", error);
            return jsonResponse(null, {
                success: false,
                message: "Authentication service unavailable",
                status: 503
            });
        }

        if (!session?.user?.id) {
            return jsonResponse(null, {
                success: false,
                message: "Unauthorized - Invalid or missing session",
                status: 401
            });
        }

        const userId = session.user.id;

        let todayStart: Date;
        let todayEnd: Date;
        
        try {
            todayStart = startOfDay(new Date());
            todayEnd = endOfDay(new Date());
        } catch (error) {
            console.error("Date processing error:", error);
            return jsonResponse(null, {
                success: false,
                message: "Invalid date processing",
                status: 400
            });
        }

        let recentSessions;
        try {
            recentSessions = await prisma.practiceSession.findMany({
                where: {
                    userId,
                    createdAt: {
                        gte: todayStart,
                        lt: todayEnd,
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    id: true,
                    subjectId: true,
                    questions: {
                        select: {
                            question: {
                                select: {
                                    subTopic: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    attempts: {
                        select: {
                            questionId: true,
                            status: true,
                            timing: true,
                        },
                    },
                },
            });
        } catch (error) {
            console.error("Database query error (practice sessions):", error);
            return jsonResponse(null, {
                success: false,
                message: "Failed to retrieve practice sessions",
                status: 500
            });
        }

        if (!Array.isArray(recentSessions)) {
            console.error("Invalid data structure returned from database");
            return jsonResponse(null, {
                success: false,
                message: "Invalid data format",
                status: 500
            });
        }

        let subjectIdToName;
        try {
            subjectIdToName = await getSubjectMap();
        } catch (error) {
            console.error("Subject map error:", error);
            return jsonResponse(null, {
                success: false,
                message: "Failed to retrieve subject information",
                status: 500
            });
        }

        let overallTotalQuestions = 0;
        let overallAttempts = 0;
        let overallCorrect = 0;
        let overallTimeSpent = 0;
        const overallSubtopics = new Set<string>();
        const subjectSummaries: Record<string, {
            totalQuestions: number,
            attempted: number,
            correctAnswers: number,
        }> = {};

        try {
            recentSessions.forEach(session => {
                if (!session || typeof session !== 'object') {
                    console.warn("Invalid session object:", session);
                    return;
                }

                const questions = Array.isArray(session.questions) ? session.questions : [];
                const attempts = Array.isArray(session.attempts) ? session.attempts : [];
                
                const questionCount = questions.length;
                const attemptedIds = new Set(
                    attempts
                        .filter(a => a && typeof a.questionId !== 'undefined')
                        .map(a => a.questionId)
                );
                
                const correctCount = attempts.filter(a => 
                    a && a.status === 'CORRECT'
                ).length;
                
                const totalTime = attempts.reduce((sum, a) => {
                    const timing = typeof a?.timing === 'number' ? a.timing : 0;
                    return sum + timing;
                }, 0);

                questions.forEach(q => {
                    try {
                        const name = q?.question?.subTopic?.name;
                        if (name && typeof name === 'string') {
                            overallSubtopics.add(name);
                        }
                    } catch (error) {
                        console.warn("Error processing subtopic for question:", q, error);
                    }
                });

                overallTotalQuestions += questionCount;
                overallAttempts += attemptedIds.size;
                overallCorrect += correctCount;
                overallTimeSpent += totalTime;

                const subjectId = session.subjectId;
                const subjectName = (subjectId && subjectIdToName[subjectId]) 
                    ? subjectIdToName[subjectId] 
                    : 'Unknown Subject';

                if (!subjectSummaries[subjectName]) {
                    subjectSummaries[subjectName] = {
                        totalQuestions: 0,
                        attempted: 0,
                        correctAnswers: 0,
                    };
                }

                subjectSummaries[subjectName].totalQuestions += questionCount;
                subjectSummaries[subjectName].attempted += attemptedIds.size;
                subjectSummaries[subjectName].correctAnswers += correctCount;
            });
        } catch (error) {
            console.error("Error processing session data:", error);
            return jsonResponse(null, {
                success: false,
                message: "Error processing practice session data",
                status: 500
            });
        }

        let subjectWiseSummary;
        let overallSummary;

        try {
            subjectWiseSummary = Object.entries(subjectSummaries).map(
                ([subject, data]) => {
                    const accuracyRate = data.attempted > 0
                        ? Math.round((data.correctAnswers / data.attempted * 100) * 100) / 100
                        : 0;

                    return {
                        subject,
                        totalQuestions: data.totalQuestions,
                        correctAnswers: data.correctAnswers,
                        totalAttempts: data.attempted,
                        accuracyRate,
                    };
                }
            );

            const overallAccuracy = overallAttempts > 0
                ? Math.round((overallCorrect / overallAttempts * 100) * 100) / 100
                : 0;

            const timeSpentMinutes = Math.round((overallTimeSpent / 60) * 100) / 100;

            overallSummary = {
                totalQuestions: overallTotalQuestions,
                attempted: overallAttempts,
                correctAnswers: overallCorrect,
                timeSpent: timeSpentMinutes,
                accuracyRate: overallAccuracy,
                subtopicsCovered: overallSubtopics.size,
            };
        } catch (error) {
            console.error("Error building summary data:", error);
            return jsonResponse(null, {
                success: false,
                message: "Error calculating summary statistics",
                status: 500
            });
        }

        return jsonResponse({
            overallSummary,
            subjectWiseSummary,
        }, { 
            success: true, 
            message: "Practice session summary retrieved successfully", 
            status: 200 
        });

    } catch (error) {
        console.error("Unexpected error in practice session summary API:", error);
        return jsonResponse(null, {
            success: false,
            message: "An unexpected error occurred while processing your request",
            status: 500
        });
    }
}