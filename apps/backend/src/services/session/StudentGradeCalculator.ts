import prisma from "../../lib/prisma";
import { GradeEnum } from "@repo/db/enums";

export class StudentGradeCalculator {
  async calculateGrade(userId: string): Promise<GradeEnum> {
    try {
      const userPerformance = await prisma.userPerformance.findUnique({
        where: { userId },
      });

      if (!userPerformance) {
        return GradeEnum.C;
      }

      const subjectMasteries = await prisma.subjectMastery.findMany({
        where: { userId },
      });

      const topicMasteries = await prisma.topicMastery.findMany({
        where: { userId },
      });

      const avgMasteryLevel =
        subjectMasteries.reduce(
          (sum, subject) => sum + subject.masteryLevel,
          0
        ) / (subjectMasteries.length || 1);

      const avgStrengthIndex =
        topicMasteries.reduce((sum, topic) => sum + topic.strengthIndex, 0) /
        (topicMasteries.length || 1);

      const recentTestPerformances = await prisma.testParticipation.findMany({
        where: {
          userId,
          status: "COMPLETED",
        },
        orderBy: { endTime: "desc" },
        take: 5,
      });

      const recentAvgScore =
        recentTestPerformances.length > 0
          ? recentTestPerformances.reduce(
              (sum, test) => sum + (test.score || 0),
              0
            ) / recentTestPerformances.length
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
      console.error("Error calculating student grade:", error);
      return GradeEnum.C;
    }
  }

  private determineGrade(
    masteryLevel: number,
    strengthIndex: number,
    accuracy: number,
    recentTestScore: number
  ): GradeEnum {
    const normalizedMastery = masteryLevel / 100;
    const normalizedStrength = strengthIndex / 100;
    const normalizedAccuracy = accuracy / 100;
    const normalizedTestScore = recentTestScore / 100;

    const weightedScore =
      normalizedMastery * 0.3 +
      normalizedStrength * 0.2 +
      normalizedAccuracy * 0.35 +
      normalizedTestScore * 0.15;

    if (weightedScore >= 0.9) return GradeEnum.A_PLUS;
    if (weightedScore >= 0.75) return GradeEnum.A;
    if (weightedScore >= 0.6) return GradeEnum.B;
    if (weightedScore >= 0.4) return GradeEnum.C;
    return GradeEnum.D;
  }
}
