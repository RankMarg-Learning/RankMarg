import prisma from "../../lib/prisma";
import { GradeEnum } from "@repo/db/enums";
import { UserConfig } from "../attempt.config";

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
      const userConfig = new UserConfig({
        userId: user.id,
        examCode: user.examRegistrations[0].examCode || "",
        grade: null,
        nDays_Data: 7,
        isPaidUser: false,
      });
      const data = userConfig.getUserData();
    } catch (error) {
      console.error("Error calculating student grade:", error);
      return GradeEnum.C;
    }
  }
}
