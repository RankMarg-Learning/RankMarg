import prisma from "@/lib/prisma";
import { TriggerType } from "@repo/db/enums";
import { SuggestionEngine } from "@repo/suggest";

export class SuggestionService {
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

  public async processUserBatch(batchSize: number, offset: number) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
      },
      skip: offset,
      take: batchSize,
    });
    for (const user of users) {
      await this.generateSuggestion(user.id);
    }
  }
  public async generateSuggestion(userId: string) {
    try {
      new SuggestionEngine([TriggerType.DAILY_ANALYSIS], userId);
    } catch (error) {
      throw new Error(
        `Error generating suggestion for user ${userId}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
