import prisma from "../../lib/prisma";
import { GradeEnum, Stream } from "@prisma/client";
import { createDefaultSessionConfig } from "../session/SessionConfig";
import { PracticeSessionGenerator } from "../session/PracticeSessionGenerator";

export class PracticeService {
  // ALL USERS PROCESS
  public async processAllUsers() {
    const batchSize = 100;
    let offset = 0;

    while (true) {
      const userCount = await prisma.user.count();
      if (offset >= userCount) break;

      await this.processUserBatch(batchSize, offset);
      offset += batchSize;
    }
  }

  // BATCH PROCESSING
  public async processUserBatch(batchSize: number, offset: number) {
    const users = await prisma.user.findMany({
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
      where: { id: userId },
      select: {
        id: true,
        stream: true,
        grade: true,
        userPerformance: true,
        currentStudyTopic: true,
      },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const config = createDefaultSessionConfig(
      (user.stream as Stream) || Stream.NEET,
      user.userPerformance?.dailyQuestions || 10,
      (user.grade as GradeEnum) || GradeEnum.C
    );

    await this.markSessionAsCompleted(userId);
    const sessionGenerator = new PracticeSessionGenerator(prisma, config);
    await sessionGenerator.generate(userId, config.stream, config.grade);
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
