import { PrismaClient } from '@prisma/client';

export class StudentGradeCalculator {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async calculateGrade(userId: string): Promise<string> {
        try {
            const userPerformance = await this.prisma.userPerformance.findUnique({
                where: { userId }
            });

            if (!userPerformance) {
                return 'D'; 
            }

            const subjectMasteries = await this.prisma.subjectMastery.findMany({
                where: { userId }
            });

            const topicMasteries = await this.prisma.topicMastery.findMany({
                where: { userId }
            });

            const avgMasteryLevel = subjectMasteries.reduce(
                (sum, subject) => sum + subject.masteryLevel, 0
            ) / (subjectMasteries.length || 1);

            const avgStrengthIndex = topicMasteries.reduce(
                (sum, topic) => sum + topic.strengthIndex, 0
            ) / (topicMasteries.length || 1);

            const recentTestPerformances = await this.prisma.testParticipation.findMany({
                where: {
                    userId,
                    status: 'COMPLETED'
                },
                orderBy: { endTime: 'desc' },
                take: 5 
            });

            const recentAvgScore = recentTestPerformances.length > 0
                ? recentTestPerformances.reduce((sum, test) => sum + (test.score || 0), 0) / recentTestPerformances.length
                : 0;

            const accuracy = userPerformance.accuracy;

            const grade = this.determineGrade(
                avgMasteryLevel,
                avgStrengthIndex,
                accuracy,
                recentAvgScore
            );

            return grade;
        } catch (error) {
            console.error('Error calculating student grade:', error);
            return 'C'; 
        }
    }

    
    private determineGrade(
        masteryLevel: number,
        strengthIndex: number,
        accuracy: number,
        recentTestScore: number
    ): string {

        const normalizedMastery = masteryLevel / 100; 
        const normalizedStrength = strengthIndex / 100; 
        const normalizedAccuracy = accuracy / 100; 
        const normalizedTestScore = recentTestScore / 100;

        const weightedScore =
            normalizedMastery * 0.3 +
            normalizedStrength * 0.2 +
            normalizedAccuracy * 0.35 +
            normalizedTestScore * 0.15;

        if (weightedScore >= 0.9) return 'A+';
        if (weightedScore >= 0.75) return 'A';
        if (weightedScore >= 0.6) return 'B';
        if (weightedScore >= 0.4) return 'C';
        return 'D';
    }
}