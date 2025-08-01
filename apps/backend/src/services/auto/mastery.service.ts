import prisma from "../../lib/prisma";
import { MetricType, Stream } from "@prisma/client";
import { MasteryProcessor } from "../mastery/MasteryProcessor";

export class MasteryService {
  private MasteryProcessor: MasteryProcessor;

  constructor() {
    this.MasteryProcessor = new MasteryProcessor();
  }

  public async processAllUsers() {
    const batchSize = 100;
    let offset = 0;

    while (true) {
      const count = await prisma.user.count();
      if (offset + batchSize >= count) {
        break;
      }
      await this.processUserBatch(batchSize, offset);
      offset += batchSize;
    }
  }

  public async processUserBatch(batchSize: number, offset: number) {
    // TODO: Implement if user is active or not
    const users = await prisma.user.findMany({
      select: { id: true, stream: true },
      skip: offset,
      take: batchSize,
    });

    for (const user of users) {
      try {
        await this.processOneUser(user.id, user.stream as Stream);
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
      }
    }
  }
  public async processOneUser(userId: string, stream: Stream) {
    await this.MasteryProcessor.updateUserMastery(userId, stream);

    await Promise.all(
      Object.keys(MetricType).map(async (key) => {
        const metricType = MetricType[key as keyof typeof MetricType];
        await this.UpdateMetrics(userId, metricType);
      })
    );
  }
  private async UpdateMetrics(userId: string, metricType: MetricType) {
    const existingMetric = await prisma.metric.findFirst({
      where: {
        userId,
        metricType,
      },
    });
    if (existingMetric) {
      await prisma.metric.update({
        where: {
          id: existingMetric.id,
        },
        data: {
          previousValue: existingMetric.currentValue,
        },
      });
    } else {
      await prisma.metric.create({
        data: {
          userId,
          metricType,
          previousValue: 0,
          currentValue: 0,
        },
      });
    }
  }
}

// STEP 3: Update subject masteries
// if (subjectIds.size > 0) {
//   const subjectsUpdated = await this.subjectRepo.updateMasteries(
//     userId,
//     subjectIds,
//     subjectAttempts,
//     this.masteryCalculator
//   );
//   result.subjectsUpdated = subjectsUpdated;
// }

// STEP 4: Update topic masteries
// if (topicIds.size > 0) {
//   const topicsUpdated = await this.topicRepo.updateMasteries(
//     userId,
//     topicIds,
//     topicAttempts,
//     this.masteryCalculator
//   );
//   result.topicsUpdated = topicsUpdated;
// }

// STEP 5: Update subtopic masteries
