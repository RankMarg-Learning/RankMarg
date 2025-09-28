import prisma from "@/lib/prisma";
import { MasteryService } from "@/jobs/services/mastery.service";
import { ReviewScheduleService } from "@/jobs/services/reviewSchedule.service";

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

    const count = await prisma.examUser.count();

    while (offset < count) {
      await this.processUserBatch(batchSize, offset);
      offset += batchSize;
    }
  }

  public async processUserBatch(
    batchSize: number,
    offset: number
  ): Promise<void> {
    const users = await prisma.examUser.findMany({
      select: {
        userId: true,
        exam: { select: { code: true } },
        user: { select: { isActive: true, updatedAt: true } },
      },
      orderBy: { registeredAt: "desc" },
      skip: offset,
      take: batchSize,
    });

    const concurrency = 5;
    for (let i = 0; i < users.length; i += concurrency) {
      const chunk = users
        .slice(i, i + concurrency)
        .filter((eu) => eu.user?.isActive);
      await Promise.all(
        chunk.map(async (eu) => {
          await this.processOneUser(eu.userId, eu.exam.code);
        })
      );
    }
  }

  public async processOneUser(userId: string, examCode: string): Promise<void> {
    // 1) Update mastery and metrics
    await this.masteryService.processOneUserPublic({ userId, examCode });

    // 2) Update review schedules based on latest mastery
    await this.reviewService.updateSchedulesForUser(userId);
  }
}
