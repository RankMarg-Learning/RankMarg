export const dynamic = "force-dynamic";

import { z } from 'zod';


const QuerySchema = z.object({
    id: z.string().uuid(),
    subtopicsCount: z.coerce.number().int().positive().default(3),
});



export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const queryResult = QuerySchema.safeParse({
            id: searchParams.get('id'),
            subtopicsCount: searchParams.get('subtopicsCount') || 3,
        });

        if (!queryResult.success) {
            return jsonResponse(null, {
                message: 'Invalid query parameters',
                success: false,
                status: 400,
            })
        }

        const { id: userId, subtopicsCount } = queryResult.data;

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

        //!Change this as per the cron update time 
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
        });

        const todaysMinutesStudied = calculateTodayStudyTime(attempts);
        const dailyGoalMinutes = user.studyHoursPerDay ? (user.studyHoursPerDay * 60*60) / 4 : 60*60;


        const revisionSubtopics = await getTopUsedSubtopicsToday(userId, subtopicsCount);

        const performance: PerformanceDashboardProps = await prisma.userPerformance.findUnique({
            where: { userId },
            select: {
                accuracy: true,
                avgScore: true,
                totalAttempts: true,
                streak: true,
            }
        })

        const streak = performance.streak || 0;
        const level = calculateUserLevel(performance);



        return jsonResponse({
            todaysProgress: {
                minutesStudied: todaysMinutesStudied,
                goalMinutes: dailyGoalMinutes,
                percentComplete: Math.min(100, Math.round((todaysMinutesStudied / dailyGoalMinutes) * 100)),
            },
            revisionSubtopics: revisionSubtopics,
            userStats: {
                streak,
                level,
                accuracy: performance.accuracy || 0,
                totalQuestionsSolved: performance.totalAttempts || 0,
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
    return attempts.reduce((total, attempt) => {
        return total + (attempt.timing || 0);
    }, 0);
}



import { startOfDay, endOfDay } from 'date-fns';
import { jsonResponse } from '@/utils/api-response';
import { AttemptsDashaboadProps, PerformanceDashboardProps } from '@/types/dashboard.types';
import prisma from '@/lib/prisma';

async function getTopUsedSubtopicsToday(userId: string, count: number): Promise<string[]> {
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

    const questionIds = groupedSubtopics.map(q => q.questionId);


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

    const frequencyMap = new Map<string, { name: string, count: number }>();

    for (const q of questions) {
        const id = q.subtopicId!;
        const name = q.subTopic?.name ?? 'Unknown';

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
}



function calculateUserLevel(performance: PerformanceDashboardProps): number {
    if (!performance) return 1;

    const accuracyOutOf10 = performance.accuracy / 10;
    const avgScoreOutOf10 = performance.avgScore / 10;

    const questionsFactor = Math.min(1, Math.log10(performance.totalAttempts + 1) / 2.004);
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


