import { MasteryCalculator } from '../services/mastery/MasteryCalculator';
import { MasteryAttempt } from '@/types';
import { MasteryConfig } from '@/services/mastery/MasteryConfig';
import { MasteryProcessor } from '@/services/mastery/MasteryProcessor';
import prisma from '@/lib/prisma';
import { differenceInDays } from 'date-fns';

export class SubtopicMasteryRepository {
  private masteryProcessor: MasteryProcessor;
  private config: MasteryConfig;
  private prisma = prisma;

  constructor(config:MasteryConfig) {
    this.masteryProcessor = new MasteryProcessor();
   }

  async updateMasteries(
    userId: string,
    subtopicIds: Set<string>,
    subtopicAttempts: Map<string, MasteryAttempt[]>,
    calculator: MasteryCalculator,
  ): Promise<number> {


    const subtopicUpdates = [];
    const subtopicHistoryRecords = [];
    let updatedCount = 0;



    const subtopicsWithTopics = await prisma.subTopic.findMany({
      where: {
        id: {
          in: Array.from(subtopicIds),
        },
      },
      select: {
        id: true,
        topicId: true,
      },
    });

    const subtopicToTopicMap = new Map(
      subtopicsWithTopics.map(subtopic => [subtopic.id, subtopic.topicId])
    );
    

    for (const subtopicId of Array.from(subtopicIds)) {
      const attempts = subtopicAttempts.get(subtopicId) || [];
      if (attempts.length === 0) continue;
      const topicId = subtopicToTopicMap.get(subtopicId);
      if (!topicId) continue;

      // const masteryResult = this.masteryProcessor.calculateMastery(attempts);

      const masteryData = calculator.calculateMasteryData(attempts);
      const masteryScore = calculator.calculateMasteryScore(masteryData);
      // console.log("Mastery Score: ", masteryScore);

      // console.log("Mastery result: ", masteryResult);

      // const { totalAttempts, correctAttempts, streak, lastCorrectDate, avgTime } = masteryData;
      // const strengthIndex = indexCalculator.calculateStrengthIndex(
      //   {
      //     totalAttempts,
      //     correctAttempts,
      //     streak,
      //     lastCorrectDate,
      //     avgTime,
      //   }
      // );

      // subtopicUpdates.push(
      //   this.prisma.subtopicMastery.upsert({
      //     where: {
      //       userId_subtopicId: { userId, subtopicId },
      //     },
      //     create: {
      //       userId,
      //       subtopicId,
      //       topicId,
      //       masteryLevel:masteryScore,
      //       strengthIndex,
      //       totalAttempts: masteryData.totalAttempts,
      //       correctAttempts: masteryData.correctAttempts,
      //     },
      //     update: {
      //       masteryLevel:masteryScore,
      //       strengthIndex,
      //       totalAttempts: masteryData.totalAttempts,
      //       correctAttempts: masteryData.correctAttempts,
      //     },
      //   })
      // );

      // subtopicHistoryRecords.push({
      //   userId,
      //   subtopicId,
      //   topicId,
      //   masteryLevel:masteryScore,
      //   strengthIndex: masteryScore,
      //   totalAttempts: masteryData.totalAttempts,
      //   correctAttempts: masteryData.correctAttempts,
      //   totalTimeSpent: masteryData.totalTime,
      // });

      updatedCount++;
    }
    
    // if (subtopicUpdates.length > 0) {
    //   await Promise.all([
    //     this.prisma.$transaction(subtopicUpdates),
    //     this.prisma.masteryHistory.createMany({
    //       data: subtopicHistoryRecords,
    //       skipDuplicates: true,
    //     }),
    //   ]);
    // }

    return updatedCount;
  }

  
}