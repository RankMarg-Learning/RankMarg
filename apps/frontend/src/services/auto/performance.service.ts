import prisma from "@/lib/prisma";


export class PerformanceService {
    async processUserBatch(batchSize: number, offset: number) {
        const users = await prisma.user.findMany({
            select: { id: true },
            skip: offset,
            take: batchSize,
        });

        for (const user of users) {
            await this.updateUserPerformance(user.id);
        }
    }

    public async updateUserPerformance(userId: string) {
        const tx = await prisma.$transaction(async (prisma) => {
            const attemptsData = await prisma.attempt.aggregate({
                where: {
                    userId: userId
                },
                _count: {
                    id: true
                },
                _sum: {
                    timing: true
                }
            });
            const correctAttemptsCount = await prisma.attempt.count({
                where: {
                    userId: userId,
                    status: 'CORRECT'
                }
            });
            const testParticipations = await prisma.testParticipation.findMany({
                where: {
                    userId: userId,
                    status: 'COMPLETED'
                },
                select: {
                    score: true,
                    accuracy: true,
                    timing: true,
                    endTime: true
                },
                orderBy: {
                    endTime: 'desc'
                },
                take: 10 
            });
            const recentTestScores = testParticipations.map(test => ({
                score: test.score,
                accuracy: test.accuracy,
                timing: test.timing,
                date: test.endTime
            }));
            const avgScore = testParticipations.length > 0
                ? testParticipations.reduce((sum, test) => sum + (test.score || 0), 0) / testParticipations.length
                : 0;
            const highestScore = testParticipations.length > 0
                ? Math.max(...testParticipations.map(test => test.score || 0))
                : 0;
            const lowestScore = testParticipations.length > 0
                ? Math.min(...testParticipations.map(test => test.score || 0))
                : 0;
            const lastExamDate = testParticipations.length > 0
                ? testParticipations[0].endTime
                : null;


            const subjectMasteries = await prisma.subjectMastery.findMany({
                where: {
                    userId: userId
                },
                include: {
                    subject: true
                }
            });
            const subjectWiseAccuracy = {};
            for (const mastery of subjectMasteries) {
                const accuracy = mastery.totalAttempts > 0
                    ? (mastery.correctAttempts / mastery.totalAttempts) * 100
                    : 0;

                subjectWiseAccuracy[mastery.subject.name] = {
                    accuracy: accuracy,
                    totalAttempts: mastery.totalAttempts,
                    correctAttempts: mastery.correctAttempts,
                    masteryLevel: mastery.masteryLevel
                };
            }
            const recentPracticeSessions = await prisma.practiceSession.findMany({
                where: {
                    userId: userId,
                    isCompleted: true,
                    startTime: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                    }
                },
                select: {
                    duration: true,
                    startTime: true
                }
            });
            const avgDailyStudyHours = this.calculateAverageDailyStudyHours(recentPracticeSessions);
            const totalAttempts = attemptsData._count.id || 0;
            const accuracy = totalAttempts > 0
                ? (correctAttemptsCount / totalAttempts) * 100
                : 0;

            const updatedPerformance = await prisma.userPerformance.upsert({
                where: {
                    userId: userId
                },
                update: {
                    totalAttempts,
                    correctAttempts: correctAttemptsCount,
                    accuracy,
                    subjectWiseAccuracy: subjectWiseAccuracy,
                    recentTestScores: recentTestScores,
                    highestScore,
                    lowestScore,
                    avgScore,
                    lastExamDate,
                    avgDailyStudyHours
                },
                create: {
                    userId,
                    totalAttempts,
                    correctAttempts: correctAttemptsCount,
                    accuracy,
                    subjectWiseAccuracy: subjectWiseAccuracy,
                    recentTestScores: recentTestScores,
                    highestScore,
                    lowestScore,
                    avgScore,
                    lastExamDate,
                    avgDailyStudyHours
                }
            });
            await this.updateMetric(prisma, userId, 'TOTAL_QUESTIONS', totalAttempts);
            await this.updateMetric(prisma, userId, 'CORRECT_ATTEMPTS', correctAttemptsCount);
            const avgMasteryLevel = subjectMasteries.length > 0
                ? Math.round(subjectMasteries.reduce((sum, sm) => sum + sm.masteryLevel, 0) / subjectMasteries.length)
                : 0;
            await this.updateMetric(prisma, userId, 'MASTERY_LEVEL', avgMasteryLevel);
            const avgTestScore = Math.round(avgScore);
            await this.updateMetric(prisma, userId, 'TEST_SCORE', avgTestScore);
            return {
                userPerformance: updatedPerformance,
                metrics: {
                    TOTAL_QUESTIONS: totalAttempts,
                    CORRECT_ATTEMPTS: correctAttemptsCount,
                    MASTERY_LEVEL: avgMasteryLevel,
                    TEST_SCORE: avgTestScore
                }
            };
        });
        return tx;
    }
    public async updateMetric(prisma, userId, metricType, currentValue) {
        const existingMetric = await prisma.metric.findFirst({
            where: {
                userId,
                metricType
            }
        });

        if (existingMetric) {
            await prisma.metric.update({
                where: {
                    id: existingMetric.id
                },
                data: {
                    currentValue: currentValue,
                }
            });
        } else {
            await prisma.metric.create({
                data: {
                    userId,
                    metricType,
                    currentValue: currentValue,
                    previousValue: 0
                }
            });
        }
    }
    public calculateAverageDailyStudyHours(practiceSessions) {
        if (!practiceSessions || practiceSessions.length === 0) {
            return 0;
        }

        const sessionsByDay = {};
        practiceSessions.forEach(session => {
            const day = session.startTime.toISOString().split('T')[0];
            if (!sessionsByDay[day]) {
                sessionsByDay[day] = 0;
            }
            sessionsByDay[day] += (session.duration || 0) / 60; 
        });

        const totalDays = Object.keys(sessionsByDay).length;
        const totalHours: number = Object.values(sessionsByDay).reduce((sum: number, hours) => sum + Number(hours as number), 0) as number;

        return totalDays > 0 ? (totalHours / totalDays) : 0;
    }
}
