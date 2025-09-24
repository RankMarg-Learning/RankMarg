import prisma from "../../lib/prisma";
import { GradeEnum, Role, SubscriptionStatus } from "@repo/db/enums";
import { createDefaultSessionConfig } from "../session/SessionConfig";
import { PracticeSessionGenerator } from "../session/PracticeSessionGenerator";

export class PracticeService {
  // ALL USERS PROCESS
  public async processAllUsers() {
    const batchSize = 100;
    let offset = 0;
    const userCount = await prisma.user.count();

    while (true) {
      if (offset >= userCount) break;

      await this.processUserBatch(batchSize, offset);
      offset += batchSize;
    }
  }

  // BATCH PROCESSING
  public async processUserBatch(batchSize: number, offset: number) {
    const users = await prisma.user.findMany({
      where: {
        onboardingCompleted: true,
        isActive: true,
        role: Role.USER,
      },
      select: {
        id: true,
      },
      skip: offset,
      take: batchSize,
    });
    for (const user of users) {
      await this.generateSessionForUser(user.id);
    }
  }

  // GENERATE SESSION FOR USER
  public async generateSessionForUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        grade: true,
        questionsPerDay: true,
        examRegistrations: {
          select: {
            examCode: true,
          },
        },
      },
    });

    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return;
    }

    const examReg = user.examRegistrations[0];
    const config = createDefaultSessionConfig(
      examReg?.examCode || "DEFAULT",
      user.questionsPerDay || 10,
      (user.grade as GradeEnum) || GradeEnum.C
    );

    await this.markSessionAsCompleted(userId);
    const sessionGenerator = new PracticeSessionGenerator(prisma, config);
    await sessionGenerator.generate(userId, config.examCode, config.grade);
  }

  public async markSessionAsCompleted(userId: string) {
    await prisma.practiceSession.updateMany({
      where: {
        userId: userId,
        isCompleted: false,
      },
      data: {
        isCompleted: true,
      },
    });
  }
}
