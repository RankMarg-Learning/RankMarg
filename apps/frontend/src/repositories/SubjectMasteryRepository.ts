// src/repositories/SubjectMasteryRepository.ts
import { PrismaClient } from '@prisma/client';
import { MasteryCalculator } from '../services/mastery/MasteryCalculator';

export class SubjectMasteryRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Update subject masteries for a user
   */
  async updateMasteries(
    userId: string, 
    subjectIds: Set<string>, 
    subjectAttempts: Map<string, any[]>,
    calculator: MasteryCalculator
  ): Promise<number> {
    // Get existing records to compare and update
    const existingSubjectMasteries = await this.prisma.subjectMastery.findMany({
      where: {
        userId,
        subjectId: { in: Array.from(subjectIds) },
      },
    });
    
    const subjectMasteryMap = new Map(
      existingSubjectMasteries.map(sm => [sm.subjectId, sm])
    );
    
    const subjectUpdates = [];
    const subjectHistoryRecords = [];
    let updatedCount = 0;
    
    for (const subjectId of Array.from(subjectIds)) {
      const subjectData = subjectAttempts.get(subjectId) || [];
      if (subjectData.length === 0) continue;
      
      // Calculate mastery for subject
      const masteryData = calculator.calculateMasteryData(subjectData);
      const masteryScore = calculator.calculateMasteryScore(masteryData);
      
      // Prepare subject mastery update
      subjectUpdates.push(
        this.prisma.subjectMastery.upsert({
          where: {
            userId_subjectId: { userId, subjectId },
          },
          create: {
            userId,
            subjectId,
            masteryLevel:masteryScore,
            totalAttempts: masteryData.totalAttempts,
            correctAttempts: masteryData.correctAttempts,
          },
          update: {
            masteryLevel:masteryScore,
            totalAttempts: masteryData.totalAttempts,
            correctAttempts: masteryData.correctAttempts,
          },
        })
      );
      
      // Prepare history record
      subjectHistoryRecords.push({
        userId,
        subjectId,
        masteryLevel:masteryScore,
        strengthIndex: masteryScore,
        totalAttempts: masteryData.totalAttempts,
        correctAttempts: masteryData.correctAttempts,
        totalTimeSpent: masteryData.totalTime,
      });
      
      updatedCount++;
    }
    
    // Execute subject updates in parallel
    if (subjectUpdates.length > 0) {
      await Promise.all([
        this.prisma.$transaction(subjectUpdates),
        this.prisma.masteryHistory.createMany({
          data: subjectHistoryRecords,
          skipDuplicates: true,
        }),
      ]);
    }
    
    return updatedCount;
  }
}