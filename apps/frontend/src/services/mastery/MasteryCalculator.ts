import { MasteryAttempt } from "@/types";

export interface MasteryData {
  totalAttempts: number;
  correctAttempts: number;
  avgTime: number;
  totalTime: number;
  streak: number;
  lastCorrectDate: Date | null;
  avgDifficulty: number;
  recentAccuracy: number;
  oneDayRepetitions: number;
  threeDayRepetitions: number;
  // conceptMistakes: number;
  // sillyMistakes: number;
}


export interface StrengthIndexData {
  totalAttempts: number; // Total number of attempts
  correctAttempts: number; // Total number of correct attempts
  streak: number; // Number of consecutive correct answers
  lastCorrectDate: Date | null; // Date of the last correct attempt
  avgTime: number; // Average time spent on questions (in seconds)
}

export class MasteryCalculator {
  
  calculateMasteryScore(data: MasteryData): number {

    const baseScore = data.totalAttempts > 0
      ? (data.correctAttempts / data.totalAttempts) * 40
      : 0;

    const streakBonus = Math.min(Math.log2(data.streak + 1) * 2, 8);

    let decayPenalty = 0;
    if (data.lastCorrectDate) {
      const daysSinceLastCorrect = (new Date().getTime() - data.lastCorrectDate.getTime()) / (1000 * 60 * 60 * 24);
      decayPenalty = Math.min(Math.log2(daysSinceLastCorrect + 1) * 2, 20);
    }

    const accuracyFactor = (data.recentAccuracy - 0.5) * 20;

    const idealTime = 60; //TODO: This is NEET Exam ideal Time you can modify it according to Stream
    const speedRatio = data.avgTime > 0 ? idealTime / data.avgTime : 1;
    const speedFactor = Math.max(0, Math.min(speedRatio * 5, 10));

    const normalizedDifficulty = (data.avgDifficulty - 1) / 3;
    const difficultyWeight = data.totalAttempts > 0
    ? Math.min((data.correctAttempts / data.totalAttempts) * normalizedDifficulty * 7, 7)
    : 0;

    const repetitionBoost =  Math.min(
      2 * (data.oneDayRepetitions) + 1.5 * (data.threeDayRepetitions),
      10
    );

    const masteryScore = Math.max(0, Math.min(
      baseScore +
      streakBonus +
      speedFactor +
      difficultyWeight +
      repetitionBoost +
      accuracyFactor -
      // mistakePenalty - 
      decayPenalty,
      100
    ));

    return masteryScore;
  }


  calculateMasteryData(attempts: MasteryAttempt[]): MasteryData {
    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter(a => a.status === "CORRECT").length;

    const recentAttempts = attempts.slice(0, Math.min(10, attempts.length));
    const recentCorrect = recentAttempts.filter(a => a.status === "CORRECT").length;

    const totalTime = attempts.reduce((sum, a) => sum + (a.timing || 0), 0);
    const avgTime = totalAttempts > 0 ? totalTime / totalAttempts : 0;

    let streak = 0;
    for (let i = 0; i < attempts.length; i++) {
      if (attempts[i].status === "CORRECT") {
        streak++;
      } else {
        break;
      }
    }

    const lastCorrectAttempt = attempts.find(a => a.status === "CORRECT");
    const lastCorrectDate = lastCorrectAttempt ? lastCorrectAttempt.solvedAt : null;

    const difficultySum = attempts.reduce(
      (sum, a) => sum + (a.question.difficulty || 1), 0
    );
    const avgDifficulty = totalAttempts > 0 ? difficultySum / totalAttempts : 1;

    // Count mistakes
    // const conceptMistakes = attempts.filter(a => a. === 'concept').length;
    // const sillyMistakes = attempts.filter(a => a.mistake === 'silly').length;

    const oneDayRepetitions = this.countRepetitionsWithinTimeframe(attempts, 24);
    const threeDayRepetitions = this.countRepetitionsWithinTimeframe(attempts, 72);

    return {
      totalAttempts,
      correctAttempts,
      avgTime,
      totalTime,
      streak,
      lastCorrectDate,
      // conceptMistakes,
      // sillyMistakes,
      avgDifficulty,
      recentAccuracy: recentAttempts.length > 0 ? recentCorrect / recentAttempts.length : 0,
      oneDayRepetitions,
      threeDayRepetitions,
    };
  }

  calculateStrengthIndex(data: StrengthIndexData): number {
    // Base consistency score (50% of total)
    const consistencyScore = data.correctAttempts / data.totalAttempts * 50;
    
    // Streak bonus (max 10 points)
    const streakBonus = Math.min(Math.log2(data.streak + 1) * 5, 10);
    
    // Decay penalty based on days since last correct attempt
    let decayPenalty = 0;
    if (data.lastCorrectDate) {
      const daysSinceLastCorrect = (new Date().getTime() - data.lastCorrectDate.getTime()) / (1000 * 60 * 60 * 24);
      decayPenalty = Math.min(Math.log2(daysSinceLastCorrect + 1) * 3, 20);
    }
    
    // Speed consistency factor (0 to 10 points)
    const speedConsistency = (data.avgTime > 0) ? Math.max(5 - data.avgTime / 10, 0) : 10;
    
    // Final strength index (0 to 100)
    const strengthIndex = Math.max(0, Math.min(
      consistencyScore + 
      streakBonus + 
      speedConsistency - 
      decayPenalty,
      100
    ));
    
    return strengthIndex;
  }
  
  private countRepetitionsWithinTimeframe(attempts: MasteryAttempt[], hours: number): number {
    // Group attempts by question ID
    const questionAttempts: Record<string, any[]> = {};
    for (const attempt of attempts) {
      if (!questionAttempts[attempt.question.id]) {
        questionAttempts[attempt.question.id] = [];
      }
      questionAttempts[attempt.question.id].push(attempt);
    }

    let repetitionCount = 0;

    for (const questionId in questionAttempts) {
      const attemptsForQuestion = questionAttempts[questionId].sort(
        (a, b) => a.solvedAt.getTime() - b.solvedAt.getTime()
      );

      if (attemptsForQuestion.length < 2) continue;

      for (let i = 1; i < attemptsForQuestion.length; i++) {
        const timeDiff = (attemptsForQuestion[i].solvedAt.getTime() -
          attemptsForQuestion[i - 1].solvedAt.getTime()) / (1000 * 60 * 60);

        if (timeDiff <= hours) {
          repetitionCount++;
        }
      }
    }

    return repetitionCount;
  }
}


// public calculateMastery(
//     attempts: MasteryAttempt[],
//     referenceDate: Date = new Date()
//   ): MasteryResult {
//     if (!attempts || attempts.length === 0) {
//       return {
//         masteryLevel: 0,
//         strengthIndex: 0,
//         hasInsufficientData: true,
//         totalAttempts: 0,
//         correctAttempts: 0,
//       };
//     }

//     // Filter attempts within the time window
//     const windowStart = new Date();
//     windowStart.setDate(windowStart.getDate() - this.config.timeWindow);
    
//     const validAttempts = this.filterAndNormalizeAttempts(attempts, windowStart, referenceDate);
    
//     if (validAttempts.length < this.config.minAttempts) {
//       return {
//         masteryLevel: 0,
//         strengthIndex: 0,
//         hasInsufficientData: true,
//         totalAttempts: validAttempts.length,
//         correctAttempts: validAttempts.filter(a => a.status === "CORRECT").length,
//       };
//     }

    
//     return {
//       masteryLevel :0,
//       strengthIndex:0,
//       hasInsufficientData: false,
//       totalAttempts: validAttempts.length,
//       correctAttempts: validAttempts.filter(a => a.status === "CORRECT").length,
//     };
//   }

//   /**
//    * Filter attempts for outliers and normalize timing data
//    */
//   private filterAndNormalizeAttempts(
//     attempts: MasteryAttempt[],
//     windowStart: Date,
//     referenceDate: Date
//   ): MasteryAttempt[] {
//     return attempts
//       .filter(attempt => {
//         const attemptDate = new Date(attempt.solvedAt);
        
//         // Only include attempts within our window
//         if (attemptDate < windowStart || attemptDate > referenceDate) {
//           return false;
//         }
        
//         // Filter timing outliers
//         if (
//           attempt.timing !== undefined &&
//           (attempt.timing < this.config.minTimingOutlier || 
//            attempt.timing > this.config.maxTimingOutlier)
//         ) {
//           // Clamp timing instead of discarding the attempt
//           attempt.timing = Math.max(
//             this.config.minTimingOutlier,
//             Math.min(attempt.timing, this.config.maxTimingOutlier)
//           );
//         }
        
//         return true;
//       });
//   }