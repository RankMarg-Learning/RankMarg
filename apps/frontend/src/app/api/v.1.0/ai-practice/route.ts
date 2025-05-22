import { jsonResponse } from "@/utils/api-response";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/utils/session";
import { endOfDay, startOfDay } from "date-fns";
import { cache } from "react";
import { unstable_cache } from "next/cache";

const getSession = cache(async () => {
    return await getAuthSession();
});

const getSubjectMap = unstable_cache(
    async () => {
        const subjects = await prisma.subject.findMany({
            select: { id: true, name: true }
        });
        return Object.fromEntries(subjects.map(s => [s.id, s.name]));
    },
    ["subject-map"],
    { revalidate: 3600 } 
);

export async function GET(req: Request) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return jsonResponse(null, {
                success: false,
                message: "Unauthorized",
                status: 401
            });
        }

        const userId = session.user.id;
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        const recentSessions = await prisma.practiceSession.findMany({
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

        const subjectIdToName = await getSubjectMap();

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

        recentSessions.map(session => {
            const questionCount = session.questions.length;
            const attempts = session.attempts || [];
            const attemptedIds = new Set(attempts.map(a => a.questionId));
            const correctCount = attempts.filter(a => a.status === 'CORRECT').length;
            const totalTime = attempts.reduce((sum, a) => sum + (a.timing || 0), 0);

            session.questions.forEach(q => {
                const name = q.question.subTopic?.name;
                if (name) overallSubtopics.add(name);
            });

            overallTotalQuestions += questionCount;
            overallAttempts += attemptedIds.size;
            overallCorrect += correctCount;
            overallTimeSpent += totalTime;

            const subjectName = subjectIdToName[session.subjectId ?? ''] ?? 'Unknown';

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

            return {
                sessionId: session.id,
                subjectId: session.subjectId,
                subjectName,
                totalQuestions: questionCount,
                attempted: attemptedIds.size,
                correctAnswers: correctCount,
                timeSpent: parseFloat(totalTime.toFixed(2)),
                accuracyRate: attemptedIds.size > 0
                    ? parseFloat((correctCount / attemptedIds.size * 100).toFixed(2))
                    : 0,
            };
        });

        const subjectWiseSummary = Object.entries(subjectSummaries).map(
            ([subject, data]) => {
                return {
                    subject,
                    totalQuestions: data.totalQuestions,
                    correctAnswers: data.correctAnswers,
                    totalAttempts: data.attempted,
                    accuracyRate: data.attempted > 0
                        ? parseFloat((data.correctAnswers / data.attempted * 100).toFixed(2))
                        : 0,
                };
            }
        );

        const overallSummary = {
            totalQuestions: overallTotalQuestions,
            attempted: overallAttempts,
            correctAnswers: overallCorrect,
            timeSpent: parseFloat((overallTimeSpent / 60).toFixed(2)),
            accuracyRate: overallAttempts > 0
                ? parseFloat((overallCorrect / overallAttempts * 100).toFixed(2))
                : 0,
        };

        return jsonResponse({
            overallSummary,
            subjectWiseSummary,
        }, { success: true, message: "Ok", status: 200 });

    } catch (error) {
        console.error("Error in practice session summary API:", error);
        return jsonResponse(null, {
            success: false,
            message: "Internal Server Error",
            status: 500
        });
    }
}