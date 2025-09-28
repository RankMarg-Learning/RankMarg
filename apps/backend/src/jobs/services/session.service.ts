import prisma from "@repo/db";
import { GradeEnum, Role, SubscriptionStatus } from "@repo/db/enums";
import { createDefaultSessionConfig } from "../../services/session/SessionConfig";
import { PracticeSessionGenerator } from "../../services/session/PracticeSessionGenerator";
import { BaseJobService, UserBatch, JobConfig } from "./BaseJobService";

export class PracticeService extends BaseJobService {
  constructor(config: Partial<JobConfig> = {}) {
    super({
      batchSize: 100,
      concurrencyLimit: 5,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCaching: true,
      cacheTimeout: 5 * 60 * 1000,
      ...config,
    });
  }

  protected async getTotalUserCount(): Promise<number> {
    return await prisma.user.count({
      where: {
        onboardingCompleted: true,
        isActive: true,
        role: Role.USER,
      },
    });
  }

  protected async getUserBatch(
    batchSize: number,
    offset: number
  ): Promise<UserBatch[]> {
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

    return users.map((user) => ({ userId: user.id }));
  }

  protected async processOneUser(user: UserBatch): Promise<void> {
    await this.generateSessionForUser(user.userId);
  }

  // GENERATE SESSION FOR USER
  public async generateSessionForUser(userId: string) {
    const cacheKey = `user_config_${userId}`;

    const user = await this.getCachedData(cacheKey, async () => {
      return await prisma.user.findUnique({
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
          subscription: {
            select: {
              status: true,
              currentPeriodEnd: true,
            },
          },
        },
      });
    });

    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return;
    }

    const examReg = user.examRegistrations[0];

    const isPaid =
      user.subscription?.status === SubscriptionStatus.ACTIVE &&
      user.subscription.currentPeriodEnd > new Date();
    const isTrial =
      user.subscription?.status === SubscriptionStatus.TRIAL &&
      user.subscription.currentPeriodEnd > new Date();
    const isPaidUser = isPaid || isTrial;

    const config = createDefaultSessionConfig(
      user.id,
      isPaidUser,
      examReg?.examCode || "DEFAULT",
      isPaidUser ? user.questionsPerDay || 10 : 5,
      (user.grade as GradeEnum) || GradeEnum.C,
      isPaidUser ? 40 : 28
    );

    await this.markSessionAsCompleted(userId);
    const sessionGenerator = new PracticeSessionGenerator(prisma, config);
    await sessionGenerator.generate();
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
