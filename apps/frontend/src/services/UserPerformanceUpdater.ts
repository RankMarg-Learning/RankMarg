// src/utils/UserPerformanceUpdater.ts
import { PrismaClient } from '@prisma/client';

/**
 * Handles updating overall user performance metrics
 */
export class UserPerformanceUpdater {
  constructor(private prisma: PrismaClient) {}

  /**
   * Update overall user performance metrics based on attempts
   */
  async updatePerformance(userId: string, attempts: any[]) {
    // Calculate overall performance metrics
    const totalAttempts = attempts.length;
    
    if (totalAttempts === 0) return;
    
    const correctAttempts = attempts.filter(a => a.isCorrect).length;
    const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;
    
    // Calculate subject-wise accuracy
    const subjectAttempts: Record<string, { total: number, correct: number }> = {};
    
    for (const attempt of attempts) {
      const subjectId = attempt.question.subjectId;
      if (!subjectId) continue;
      
      if (!subjectAttempts[subjectId]) {
        subjectAttempts[subjectId] = { total: 0, correct: 0 };
      }
      
      subjectAttempts[subjectId].total++;
      if (attempt.isCorrect) {
        subjectAttempts[subjectId].correct++;
      }
    }
    
    const subjectWiseAccuracy: Record<string, number> = {};
    for (const subjectId in subjectAttempts) {
      const data = subjectAttempts[subjectId];
      subjectWiseAccuracy[subjectId] = data.total > 0 ? data.correct / data.total : 0;
    }
    
    // Recent test scores (placeholder)
    const recentTestScores = {};
    
    // Average, highest, lowest scores (using accuracy as a proxy)
    const avgScore = accuracy * 100;
    const highestScore = avgScore; // Placeholder for real test data
    const lowestScore = avgScore; // Placeholder for real test data
    
    // Last exam date (using most recent attempt date)
    const lastExamDate = attempts.length > 0 ? attempts[0].solvedAt : null;
    
    // Update user performance record
    await this.prisma.userPerformance.upsert({
      where: { userId },
      create: {
        userId,
        totalAttempts,
        correctAttempts,
        accuracy,
        subjectWiseAccuracy,
        recentTestScores,
        highestScore,
        lowestScore,
        avgScore,
        lastExamDate,
      },
      update: {
        totalAttempts,
        correctAttempts,
        accuracy,
        subjectWiseAccuracy,
        recentTestScores,
        highestScore,
        lowestScore,
        avgScore,
        lastExamDate,
      },
    });
  }
}