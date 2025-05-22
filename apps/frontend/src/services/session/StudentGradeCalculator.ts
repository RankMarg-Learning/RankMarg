import { PrismaClient } from '@prisma/client';

export class StudentGradeCalculator {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Calculate the student's grade based on performance metrics
     * Grade scale: A+, A, B, C, D (A+ being the highest)
     */
    async calculateGrade(userId: string): Promise<string> {
        try {
            // Get user performance data
            const userPerformance = await this.prisma.userPerformance.findUnique({
                where: { userId }
            });

            if (!userPerformance) {
                return 'D'; // Default grade for new users
            }

            // Calculate cumulative metrics for all subjects
            const subjectMasteries = await this.prisma.subjectMastery.findMany({
                where: { userId }
            });

            const topicMasteries = await this.prisma.topicMastery.findMany({
                where: { userId }
            });

            // Calculate average mastery level across subjects
            const avgMasteryLevel = subjectMasteries.reduce(
                (sum, subject) => sum + subject.masteryLevel, 0
            ) / (subjectMasteries.length || 1);

            // Calculate average strength index across topics
            const avgStrengthIndex = topicMasteries.reduce(
                (sum, topic) => sum + topic.strengthIndex, 0
            ) / (topicMasteries.length || 1);

            // Get recent test scores
            const recentTestPerformances = await this.prisma.testParticipation.findMany({
                where: {
                    userId,
                    status: 'COMPLETED'
                },
                orderBy: { endTime: 'desc' },
                take: 5 // Consider the last 5 tests
            });

            const recentAvgScore = recentTestPerformances.length > 0
                ? recentTestPerformances.reduce((sum, test) => sum + (test.score || 0), 0) / recentTestPerformances.length
                : 0;

            // Calculate overall accuracy
            const accuracy = userPerformance.accuracy;

            // Calculate comprehensive grade based on all factors
            const grade = this.determineGrade(
                avgMasteryLevel,
                avgStrengthIndex,
                accuracy,
                recentAvgScore
            );

            return grade;
        } catch (error) {
            console.error('Error calculating student grade:', error);
            return 'C'; // Default to middle grade if error occurs
        }
    }

    /**
     * Determine grade based on weighted factors
     */
    private determineGrade(
        masteryLevel: number,
        strengthIndex: number,
        accuracy: number,
        recentTestScore: number
    ): string {
        // Normalize scores to 0-1 range
        const normalizedMastery = masteryLevel / 100; // Assuming mastery level is on a 0-10 scale
        const normalizedStrength = strengthIndex / 100; // Assuming strength index is on a 0-1 scale
        const normalizedAccuracy = accuracy / 100; // Assuming accuracy is percentage
        const normalizedTestScore = recentTestScore / 100; // Assuming test scores are percentage

        // Calculate weighted score (can adjust weights as needed)
        const weightedScore =
            normalizedMastery * 0.3 +
            normalizedStrength * 0.2 +
            normalizedAccuracy * 0.35 +
            normalizedTestScore * 0.15;

        // Map score to grade
        if (weightedScore >= 0.9) return 'A+';
        if (weightedScore >= 0.75) return 'A';
        if (weightedScore >= 0.6) return 'B';
        if (weightedScore >= 0.4) return 'C';
        return 'D';
    }
}