import prisma from "@/lib/prisma";
import { Stream } from "@prisma/client";
import { MasteryService } from "@/services/auto/mastery.service";
import { ReviewScheduleService } from "@/services/auto/reviewSchedule.service";

export class LearningProgressService {
  private masteryService: MasteryService;
  private reviewService: ReviewScheduleService;

  constructor() {
    this.masteryService = new MasteryService();
    this.reviewService = new ReviewScheduleService();
  }

  public async processAllUsers(): Promise<void> {
    const batchSize = 50;
    let offset = 0;

    const count = await prisma.user.count({
      where: { isActive: true, stream: { not: null } },
    });

    while (offset < count) {
      await this.processUserBatch(batchSize, offset);
      offset += batchSize;
    }
  }

  public async processUserBatch(
    batchSize: number,
    offset: number
  ): Promise<void> {
    const users = await prisma.user.findMany({
      select: { id: true, stream: true },
      where: { isActive: true, stream: { not: null } },
      orderBy: { updatedAt: "desc" },
      skip: offset,
      take: batchSize,
    });

    const concurrency = 5;
    for (let i = 0; i < users.length; i += concurrency) {
      const chunk = users.slice(i, i + concurrency);
      await Promise.all(
        chunk.map(async (u) => {
          const stream = u.stream as Stream;
          await this.processOneUser(u.id, stream);
        })
      );
    }
  }

  public async processOneUser(userId: string, stream: Stream): Promise<void> {
    // 1) Update mastery and metrics
    await this.masteryService.processOneUser(userId, stream);

    // 2) Update review schedules based on latest mastery
    await this.reviewService.updateSchedulesForUser(userId);
  }
}
