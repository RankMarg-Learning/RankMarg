// src/repositories/TopicMasteryRepository.ts
import { PrismaClient } from '@prisma/client';
import { MasteryCalculator } from '../services/mastery/MasteryCalculator';

export class TopicMasteryRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Update topic masteries for a user
   */
  async updateMasteries(
    userId: string, 
    topicIds: Set<string>, 
    topicAttempts: Map<string, any[]>,
    calculator: MasteryCalculator
  ): Promise<number> {
    const existingTopicMasteries = await this.prisma.topicMastery.findMany({
      where: {
        userId,
        topicId: { in: Array.from(topicIds) },
      },
    });
    
    const topicMasteryMap = new Map(
      existingTopicMasteries.map(tm => [tm.topicId, tm])
    );
    
    const topicUpdates = [];
    const topicHistoryRecords = [];
    let updatedCount = 0;
    
    for (const topicId of Array.from(topicIds)) {
      const topicData = topicAttempts.get(topicId) || [];
      if (topicData.length === 0) continue;
      
      // Calculate mastery for topic
      const masteryData = calculator.calculateMasteryData(topicData);
      const masteryScore = calculator.calculateMasteryScore(masteryData);
      
      // Prepare topic mastery update
      topicUpdates.push(
        this.prisma.topicMastery.upsert({
          where: {
            userId_topicId: { userId, topicId },
          },
          create: {
            userId,
            topicId,
            masteryLevel:masteryScore,
            strengthIndex: masteryScore,
            totalAttempts: masteryData.totalAttempts,
            correctAttempts: masteryData.correctAttempts,
          },
          update: {
            masteryLevel:masteryScore,
            strengthIndex: masteryScore,
            totalAttempts: masteryData.totalAttempts,
            correctAttempts: masteryData.correctAttempts,
          },
        })
      );
      
      // Prepare history record
      topicHistoryRecords.push({
        userId,
        topicId,
        masteryLevel:masteryScore,
        strengthIndex: masteryScore,
        totalAttempts: masteryData.totalAttempts,
        correctAttempts: masteryData.correctAttempts,
        totalTimeSpent: masteryData.totalTime,
      });
      
      updatedCount++;
    }
    
    // Execute topic updates in parallel
    if (topicUpdates.length > 0) {
      await Promise.all([
        this.prisma.$transaction(topicUpdates),
        this.prisma.masteryHistory.createMany({
          data: topicHistoryRecords,
          skipDuplicates: true,
        }),
      ]);
    }
    
    return updatedCount;
  }
}