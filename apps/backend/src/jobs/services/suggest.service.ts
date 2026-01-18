import prisma from "@repo/db";
import { Role, TriggerType } from "@repo/db/enums";
import { SuggestionEngine } from "@repo/suggest";
import { BaseJobService, UserBatch, JobConfig } from "./BaseJobService";

export class SuggestionService extends BaseJobService {
  constructor(config: Partial<JobConfig> = {}) {
    super({
      batchSize: 100,
      concurrencyLimit: 10,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCaching: false,
      cacheTimeout: 0,
      ...config,
    });
  }

  protected async getTotalUserCount(): Promise<number> {
    return await prisma.user.count();
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
    await this.generateSuggestion(user.userId);
  }

  public async generateSuggestion(userId: string) {
    try {
      const engine = new SuggestionEngine([TriggerType.DAILY_ANALYSIS], userId);
      await engine.execute();
    } catch (error) {
      throw new Error(
        `Error generating suggestion for user ${userId}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
