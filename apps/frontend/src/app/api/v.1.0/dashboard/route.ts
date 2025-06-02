export const dynamic = "force-dynamic";

import { z } from 'zod';
import { startOfDay, endOfDay } from 'date-fns';
import { jsonResponse } from '@/utils/api-response';
import { AttemptsDashaboadProps, PerformanceDashboardProps } from '@/types/dashboard.types';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/utils/session';

const QuerySchema = z.object({
    subtopicsCount: z.coerce.number().int().positive().default(3),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const queryResult = QuerySchema.safeParse({
            subtopicsCount: searchParams.get('subtopicsCount') || 3,
        });

        if (!queryResult.success) {
            return jsonResponse(null, {
                message: 'Invalid query parameters',
                success: false,
                status: 400,
            })
        }

        const { subtopicsCount } = queryResult.data;

        const session = await getAuthSession();
        if (!session || !session.user?.id) {
            return jsonResponse(null, {
                message: 'Unauthorized',
                success: false,
                status: 401,
            })
        }
        const userId = session.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return jsonResponse(null, {
                message: 'User not found',
                success: false,
                status: 404,
            })
        }

        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        const attempts: AttemptsDashaboadProps[] = await prisma.attempt.findMany({
            where: {
                userId,
                type: 'SESSION',
                solvedAt: {
                    gte: todayStart,
                    lt: todayEnd,
                },
            },
            select: {
                timing: true,
            }
        }).catch(error => {
            console.error('Error fetching attempts:', error);
            return []; 
        });

        const todaysMinutesStudied = calculateTodayStudyTime(attempts);

        const defaultStudyHours = 1; 
        const dailyGoalMinutes = user.studyHoursPerDay 
            ? (user.studyHoursPerDay * 60*60/6) 
            : (defaultStudyHours * 60*60);

        const revisionSubtopics = await getTopUsedSubtopicsToday(userId, subtopicsCount)
            .catch(error => {
                console.error('Error fetching revision subtopics:', error);
                return []; 
            });

        const performance: PerformanceDashboardProps | null = await prisma.userPerformance.findUnique({
            where: { userId },
            select: {
                accuracy: true,
                avgScore: true,
                totalAttempts: true,
                streak: true,
            }
        }).catch(error => {
            console.error('Error fetching user performance:', error);
            return null; 
        });

        const safePerformance = {
            accuracy: performance?.accuracy ?? 0,
            avgScore: performance?.avgScore ?? 0,
            totalAttempts: performance?.totalAttempts ?? 0,
            streak: performance?.streak ?? 0,
        };

        const level = calculateUserLevel(safePerformance);

        return jsonResponse({
            todaysProgress: {
                minutesStudied: todaysMinutesStudied,
                goalMinutes: dailyGoalMinutes,
                percentComplete: Math.min(100, Math.round((todaysMinutesStudied / dailyGoalMinutes) * 100)),
            },
            revisionSubtopics: revisionSubtopics,
            userStats: {
                streak: safePerformance.streak,
                level,
                accuracy: safePerformance.accuracy,
                totalQuestionsSolved: safePerformance.totalAttempts,
            },
        }, { message: "Ok", success: true, status: 200 });

    } catch (error) {
        console.error('Dashboard API error:', error);
        return jsonResponse(null, {
            message: 'Internal server error',
            success: false,
            status: 500,
        })
    }
}

function calculateTodayStudyTime(attempts: AttemptsDashaboadProps[]): number {
    if (!attempts || attempts.length === 0) {
        return 0;
    }
    
    return attempts.reduce((total, attempt) => {
        const timing = attempt?.timing ?? 0;
        return total + (typeof timing === 'number' ? timing : 0);
    }, 0);
}

async function getTopUsedSubtopicsToday(userId: string, count: number): Promise<string[]> {
    try {
        if (!userId || count <= 0) {
            return [];
        }

        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        const groupedSubtopics = await prisma.practiceSessionQuestions.groupBy({
            by: ['questionId'],
            where: {
                practiceSession: {
                    userId,
                    createdAt: {
                        gte: todayStart,
                        lte: todayEnd,
                    }
                },
            },
        });

        if (!groupedSubtopics || groupedSubtopics.length === 0) {
            return [];
        }

        const questionIds = groupedSubtopics
            .map(q => q.questionId)
            .filter(id => id != null); 

        if (questionIds.length === 0) {
            return [];
        }

        const questions = await prisma.question.findMany({
            where: {
                id: { in: questionIds },
                subtopicId: { not: null }
            },
            select: {
                subtopicId: true,
                subTopic: {
                    select: { name: true }
                }
            }
        });

        if (!questions || questions.length === 0) {
            return [];
        }

        const frequencyMap = new Map<string, { name: string, count: number }>();

        for (const q of questions) {
            if (!q.subtopicId || !q.subTopic?.name) {
                continue; 
            }

            const id = q.subtopicId;
            const name = q.subTopic.name;

            if (frequencyMap.has(id)) {
                frequencyMap.get(id)!.count += 1;
            } else {
                frequencyMap.set(id, { name, count: 1 });
            }
        }

        return Array.from(frequencyMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, count)
            .map(entry => entry.name);

    } catch (error) {
        console.error('Error in getTopUsedSubtopicsToday:', error);
        return []; 
    }
}

function calculateUserLevel(performance: PerformanceDashboardProps | null): number {
    if (!performance) {
        return 1; 
    }

    const accuracy = typeof performance.accuracy === 'number' ? performance.accuracy : 0;
    const avgScore = typeof performance.avgScore === 'number' ? performance.avgScore : 0;
    const totalAttempts = typeof performance.totalAttempts === 'number' ? performance.totalAttempts : 0;

    const accuracyOutOf10 = Math.max(0, Math.min(100, accuracy)) / 10;
    const avgScoreOutOf10 = Math.max(0, Math.min(100, avgScore)) / 10;

    const questionsFactor = totalAttempts > 0 
        ? Math.min(1, Math.log10(totalAttempts + 1) / 2.004)
        : 0;
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