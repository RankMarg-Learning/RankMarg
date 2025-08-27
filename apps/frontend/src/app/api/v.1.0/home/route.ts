export const dynamic = "force-dynamic";

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { jsonResponse } from '@/utils/api-response';
import { getAuthSession } from '@/utils/session';
import { getDayWindow } from '@/lib/dayRange';

const QuerySchema = z.object({
    subtopicsCount: z.coerce.number().int().positive().default(3),
    sessionsCount: z.coerce.number().int().positive().default(3)
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = QuerySchema.safeParse({
            subtopicsCount: searchParams.get('subtopicsCount') ?? 3,
            sessionsCount: searchParams.get('sessionsCount') ?? 3
        });

        if (!query.success) {
            return jsonResponse(null, {
                message: 'Invalid query parameters',
                success: false,
                status: 400,
            });
        }

        const { subtopicsCount, sessionsCount } = query.data;

        const session = await getAuthSession();
        if (!session?.user?.id) {
            return jsonResponse(null, {
                message: 'Unauthorized',
                success: false,
                status: 401,
            });
        }
        const userId = session.user.id;

        const { from: todayStart, to: todayEnd } = getDayWindow();

        // Fetch everything in parallel where possible
        const [user, attemptsAgg, userPerformance, rawCurrentTopics, rawSessions] = await prisma.$transaction([
            prisma.user.findUnique({ where: { id: userId }, select: { studyHoursPerDay: true } }),
            prisma.attempt.aggregate({
                where: {
                    userId,
                    type: 'SESSION',
                    solvedAt: { gte: todayStart, lt: todayEnd }
                },
                _sum: { timing: true }
            }),
            prisma.userPerformance.findUnique({
                where: { userId },
                select: { accuracy: true, avgScore: true, totalAttempts: true, streak: true }
            }),
            prisma.currentStudyTopic.findMany({
                where: { 
                    userId,
                    isCurrent: true
                },
                orderBy: { startedAt: 'desc' },
                select: {
                    id: true,
                    isCurrent: true,
                    isCompleted: true,
                    startedAt: true,
                    subject: { select: { id: true, name: true } },
                    topic: { select: { id: true, name: true } }
                }
            }),
            prisma.practiceSession.findMany({
                where: {
                    userId,
                    createdAt: { gte: todayStart, lt: todayEnd }
                },
                orderBy: { createdAt: 'desc' },
                take: sessionsCount,
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
                            question: {
                                select: {
                                    id: true,
                                    difficulty: true,
                                    topic: { select: { id: true, name: true } },
                                    subTopic: { select: { id: true, name: true } }
                                }
                            }
                        }
                    },
                    attempts: {
                        orderBy: { solvedAt: 'desc' },
                        take: 1,
                        select: { solvedAt: true }
                    }
                }
            })
        ]);

        // Map subject names (session has only subjectId, no relation)
        const subjectIds = Array.from(new Set((rawSessions || []).map(s => s.subjectId).filter(Boolean))) as string[];
        const subjects = subjectIds.length
            ? await prisma.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, name: true } })
            : [];
        const subjectMap = subjects.reduce<Record<string, string>>((acc, s) => {
            acc[s.id] = s.name;
            return acc;
        }, {});

        // Calculate today's time studied (in seconds) from aggregate
        const todaysSecondsStudied = (() => {
            const t = (attemptsAgg as any)?._sum?.timing;
            const n = typeof t === 'number' ? t : 0;
            return isFinite(n) ? n : 0;
        })();

        // Goal in seconds (preserving existing behavior)
        const defaultStudyHours = 1;
        const dailyGoalSeconds = user?.studyHoursPerDay
            ? (user.studyHoursPerDay * 60 * 60 / 6)
            : (defaultStudyHours * 60 * 60);

        // Top revision subtopics from today's sessions grouped by subject
        const subtopicFrequency = new Map<string, { 
            name: string, 
            count: number, 
            subjectId: string, 
            subjectName: string,
            topicId: string,
            topicName: string 
        }>();
        
        for (const s of rawSessions || []) {
            const subjectName = subjectMap[s.subjectId] || 'Unknown Subject';
            for (const q of s.questions || []) {
                const st = q.question?.subTopic;
                const topic = q.question?.topic;
                if (st?.id && st?.name && topic?.id && topic?.name) {
                    const key = st.id;
                    if (subtopicFrequency.has(key)) {
                        subtopicFrequency.get(key)!.count += 1;
                    } else {
                        subtopicFrequency.set(key, { 
                            name: st.name, 
                            count: 1,
                            subjectId: s.subjectId,
                            subjectName: subjectName,
                            topicId: topic.id,
                            topicName: topic.name
                        });
                    }
                }
            }
        }
        
        // Group by subject
        const subtopicsBySubject = new Map<string, {
            subjectId: string;
            subjectName: string;
            subtopics: Array<{
                id: string;
                name: string;
                count: number;
                topicId: string;
                topicName: string;
            }>;
        }>();
        
        for (const [subtopicId, data] of Array.from(subtopicFrequency.entries())) {
            const subjectKey = data.subjectId;
            if (!subtopicsBySubject.has(subjectKey)) {
                subtopicsBySubject.set(subjectKey, {
                    subjectId: data.subjectId,
                    subjectName: data.subjectName,
                    subtopics: []
                });
            }
            subtopicsBySubject.get(subjectKey)!.subtopics.push({
                id: subtopicId,
                name: data.name,
                count: data.count,
                topicId: data.topicId,
                topicName: data.topicName
            });
        }
        
        // Sort subtopics by count within each subject and take top ones
        for (const subject of Array.from(subtopicsBySubject.values())) {
            subject.subtopics.sort((a, b) => b.count - a.count);
        }
        
        // Get top subtopics for display (first 3-4 from all subjects combined)
        const allSubtopics = Array.from(subtopicFrequency.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, subtopicsCount)
            .map(s => s.name);
        
        const revisionSubtopics = {
            display: allSubtopics,
            grouped: Array.from(subtopicsBySubject.values())
        };

        // Performance and level
        const safePerformance = {
            accuracy: userPerformance?.accuracy ?? 0,
            avgScore: userPerformance?.avgScore ?? 0,
            totalAttempts: userPerformance?.totalAttempts ?? 0,
            streak: userPerformance?.streak ?? 0,
        };
        const level = calculateUserLevel(safePerformance);

        // Current studies - prioritize current topics and show all topics
        const currentStudies = [] as Array<{
            id: string;
            isCurrent: boolean;
            isCompleted: boolean;
            startedAt: Date;
            subjectName: string;
            topicName: string;
        }>;
        
        for (const item of rawCurrentTopics || []) {
            if (!item.subject?.name || !item.topic?.name) continue;
            currentStudies.push({
                id: item.id,
                isCurrent: item.isCurrent,
                isCompleted: item.isCompleted,
                startedAt: item.startedAt,
                subjectName: item.subject.name,
                topicName: item.topic.name,
            });
        }

        // Sessions formatting
        const sessions = (rawSessions || []).map(s => {
            const sessionQuestions = (s.questions || []).map(q => q.question).filter(Boolean);

            const topicsMap: Record<string, { id: string, name: string, count: number }> = {};
            const subtopicsMap: Record<string, { id: string, name: string, count: number }> = {};
            let totalDifficulty = 0;
            let difficultyCounts = 0;

            for (const q of sessionQuestions) {
                if (typeof q?.difficulty === 'number') {
                    totalDifficulty += q.difficulty;
                    difficultyCounts++;
                }
                if (q?.topic?.id && q?.topic?.name) {
                    const id = q.topic.id;
                    if (!topicsMap[id]) topicsMap[id] = { id, name: q.topic.name, count: 0 };
                    topicsMap[id].count++;
                }
                if (q?.subTopic?.id && q?.subTopic?.name) {
                    const id = q.subTopic.id;
                    if (!subtopicsMap[id]) subtopicsMap[id] = { id, name: q.subTopic.name, count: 0 };
                    subtopicsMap[id].count++;
                }
            }

            const sortedSubtopics = Object.values(subtopicsMap).sort((a, b) => b.count - a.count).slice(0, 10);
            const avgDifficulty = difficultyCounts > 0 ? Math.round(((totalDifficulty / difficultyCounts) * 10) / 10) : 0;

            const correctAnswers = s.correctAnswers ?? 0;
            const questionsSolved = s.questionsSolved ?? 0;
            const totalQuestions = s.questions?.length ?? 0;
            const score = `${correctAnswers}/${questionsSolved}`;
            const accuracy = questionsSolved > 0 ? Math.round((correctAnswers / questionsSolved) * 100) : 0;

            return {
                id: s.id,
                date: s.createdAt?.toISOString() || new Date().toISOString(),
                title: s.subjectId && subjectMap[s.subjectId] ? subjectMap[s.subjectId] : 'Unknown Subject',
                questionsAttempted: questionsSolved,
                totalQuestions,
                score,
                accuracy,
                duration: s.duration || 0,
                isCompleted: s.isCompleted ?? false,
                difficultyLevel: avgDifficulty,
                startTime: s.startTime?.toISOString() || null,
                lastAttempt: s.attempts && s.attempts[0]?.solvedAt ? s.attempts[0].solvedAt.toISOString() : null,
                keySubtopics: sortedSubtopics.map(st => st.name),
                timeRequired: s.duration || 0,
            };
        });

        return jsonResponse({
            dashboardData: {
                todaysProgress: {
                    minutesStudied: todaysSecondsStudied,
                    goalMinutes: dailyGoalSeconds,
                    percentComplete: Math.min(100, Math.round((todaysSecondsStudied / dailyGoalSeconds) * 100)),
                },
                revisionSubtopics,
                userStats: {
                    streak: safePerformance.streak,
                    level,
                    accuracy: safePerformance.accuracy,
                    totalQuestionsSolved: safePerformance.totalAttempts,
                },
            },
            currentStudies,
            sessions,
        }, { message: 'Ok', success: true, status: 200, headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' } });

    } catch (error) {
        console.error('Home API error:', error);
        return jsonResponse(null, {
            message: 'Internal server error',
            success: false,
            status: 500,
        });
    }
}

function calculateUserLevel(performance: { accuracy: number; avgScore: number; totalAttempts: number; streak: number; } | null): number {
    if (!performance) return 1;
    const accuracy = typeof performance.accuracy === 'number' ? performance.accuracy : 0;
    const avgScore = typeof performance.avgScore === 'number' ? performance.avgScore : 0;
    const totalAttempts = typeof performance.totalAttempts === 'number' ? performance.totalAttempts : 0;

    const accuracyOutOf10 = Math.max(0, Math.min(100, accuracy)) / 10;
    const avgScoreOutOf10 = Math.max(0, Math.min(100, avgScore)) / 10;
    const questionsFactor = totalAttempts > 0 ? Math.min(1, Math.log10(totalAttempts + 1) / 2.004) : 0;
    const attemptsOutOf10 = questionsFactor * 10;

    const weightAccuracy = 0.4;
    const weightAttempts = 0.3;
    const weightAvgScore = 0.3;

    const totalScore = (
        accuracyOutOf10 * weightAccuracy +
        attemptsOutOf10 * weightAttempts +
        avgScoreOutOf10 * weightAvgScore
    );

    const level = Math.max(1, Math.min(10, Math.round(totalScore)));
    return level;
}


