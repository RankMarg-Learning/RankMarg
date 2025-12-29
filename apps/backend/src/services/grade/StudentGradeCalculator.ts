import prisma from "../../lib/prisma";
import { GradeEnum } from "@repo/db/enums";
import { AttemptsConfig } from "../attempt.config";
import { captureServiceError } from "../../lib/sentry";
// import { UserConfig } from "../attempt.config";

export class StudentGradeCalculator {
  async calculateGrade(userId: string): Promise<GradeEnum> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          examRegistrations: {
            select: {
              examCode: true,
            },
          },
        },
      });
      if (!user) {
        return GradeEnum.C;
      }
      const userConfig = new AttemptsConfig({
        userId: user.id,
        examCode: user.examRegistrations[0].examCode || "",
        grade: null,
        isPaidUser: false,
      });
      const data = userConfig.getAttemptsData();
    } catch (error) {
      console.error("Error calculating student grade:", error);
      if (error instanceof Error) {
        captureServiceError(error, {
          service: "StudentGradeCalculator",
          method: "calculateGrade",
          userId,
        });
      }
      return GradeEnum.C;
    }
  }
}
