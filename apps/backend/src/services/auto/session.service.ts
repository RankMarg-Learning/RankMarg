import prisma from "../../lib/prisma";
import { GradeEnum } from "@repo/db/enums";
import { createDefaultSessionConfig } from "../session/SessionConfig";
import { PracticeSessionGenerator } from "../session/PracticeSessionGenerator";
import { RedisCacheService } from "../redisCache.service";

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
    // Try to get cached user performance first
    let cachedPerformance =
      await RedisCacheService.getCachedUserPerformance(userId);

    let user;
    if (cachedPerformance) {
      user = cachedPerformance;
    } else {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          grade: true,
          questionsPerDay: true,
          currentStudyTopic: true,
        },
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Cache the user performance data
      await RedisCacheService.cacheUserPerformance(userId, user);
    }

    const examReg = await prisma.examUser.findFirst({
      where: { userId },
      select: { exam: { select: { code: true } } },
      orderBy: { registeredAt: "desc" },
    });

    const config = createDefaultSessionConfig(
      examReg?.exam.code || "DEFAULT",
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
