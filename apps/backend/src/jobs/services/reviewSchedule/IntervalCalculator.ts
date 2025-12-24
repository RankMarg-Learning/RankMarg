import { PHASE_CONFIG, EF_MIN, EF_MAX, EF_INITIAL, LearningPhase, UrgencyLevel } from './ReviewScheduleConfig';

/**
 * Calculates review intervals with various adjustments
 */
export class IntervalCalculator {
  calculatePhaseBasedInterval(
    learningPhase: LearningPhase,
    completedReviews: number,
    consecutiveCorrect: number,
    masteryLevel: number
  ): number {
    const phaseConfig = PHASE_CONFIG[learningPhase];
    const progression = phaseConfig.intervalProgression;

    // For very early reviews, use strict progression
    if (completedReviews < progression.length) {
      return progression[completedReviews] || phaseConfig.baseInterval;
    }

    // After progression sequence, calculate based on mastery and consecutive correct
    const progressionBonus = Math.min(consecutiveCorrect * 0.5, 10);
    const masteryBonus = (masteryLevel / 100) * phaseConfig.maxInterval * 0.3;

    let interval = phaseConfig.baseInterval + progressionBonus + masteryBonus;

    // Graduated intervals with diminishing returns
    const reviewBeyondProgression = completedReviews - progression.length;
    if (reviewBeyondProgression > 0) {
      const additionalInterval = Math.pow(1.5, reviewBeyondProgression) * 0.5;
      interval += additionalInterval;
    }

    return Math.min(interval, phaseConfig.maxInterval);
  }

  calculateEnhancedEasinessFactor(
    consecutiveCorrect: number,
    consecutiveIncorrect: number,
    retentionStrength: number,
    averageDifficulty: number,
    confidenceScore: number,
    learningVelocity: number
  ): number {
    let ef = EF_INITIAL;

    // Factor 1: Consecutive correct performance (reward streaks)
    if (consecutiveCorrect > 0) {
      ef += Math.min(consecutiveCorrect * 0.15, 0.8);
    }

    // Factor 2: Consecutive incorrect performance (penalize struggles)
    if (consecutiveIncorrect > 0) {
      ef -= Math.min(consecutiveIncorrect * 0.35, 1.2);
    }

    // Factor 3: Retention strength (core learning indicator)
    const retentionImpact = (retentionStrength - 0.5) * 0.6;
    ef += retentionImpact;

    // Factor 4: Difficulty mastery bonus (harder questions = higher EF)
    const difficultyBonus = (averageDifficulty - 0.5) * 0.3;
    ef += difficultyBonus;

    // Factor 5: Confidence score (self-assessment accuracy)
    const confidenceImpact = (confidenceScore - 0.5) * 0.4;
    ef += confidenceImpact;

    // Factor 6: Learning velocity (improvement trajectory)
    const velocityImpact = learningVelocity * 0.5;
    ef += velocityImpact;

    // Bound to valid range
    return Math.max(EF_MIN, Math.min(ef, EF_MAX));
  }

  applyEasinessModulation(
    interval: number,
    easinessFactor: number,
    learningPhase: LearningPhase
  ): number {
    // In early phases, limit EF impact to prevent premature spacing
    if (learningPhase === 'ACQUISITION') {
      const limitedEF = 1.0 + (easinessFactor - 1.0) * 0.3;
      return interval * limitedEF;
    }

    if (learningPhase === 'CONSOLIDATION') {
      const limitedEF = 1.0 + (easinessFactor - 1.0) * 0.6;
      return interval * limitedEF;
    }

    // Full EF impact in later phases
    return interval * easinessFactor;
  }

  applyPerformanceAdjustments(
    interval: number,
    retentionStrength: number,
    confidenceScore: number,
    learningVelocity: number,
    learningPhase: LearningPhase
  ): number {
    // Retention modifier: Higher retention = longer intervals
    const retentionModifier = 0.6 + (retentionStrength * 0.8);
    
    // Confidence modifier: High confidence in mastered topics = longer intervals
    const confidenceModifier = learningPhase === 'MASTERY' || learningPhase === 'MAINTENANCE'
      ? 0.9 + (confidenceScore * 0.3)
      : 0.85 + (confidenceScore * 0.3);
    
    // Velocity modifier: Positive improvement = can extend slightly
    const velocityModifier = 1.0 + (learningVelocity * 0.15);

    return interval * retentionModifier * confidenceModifier * velocityModifier;
  }

  applyExamUrgencyTransformation(
    interval: number,
    urgencyLevel: UrgencyLevel,
    masteryLevel: number,
    learningPhase: LearningPhase,
    daysUntilExam?: number
  ): number {
    if (urgencyLevel === 'NONE' || !daysUntilExam) {
      return interval;
    }

    let urgencyMultiplier = 1.0;

    switch (urgencyLevel) {
      case 'CRITICAL':
        // Last week: Aggressive revision of weak topics, maintain strong ones
        if (masteryLevel < 70) {
          urgencyMultiplier = 0.2; // Review every ~1-2 days
        } else if (masteryLevel < 85) {
          urgencyMultiplier = 0.4; // Review every ~2-3 days
        } else {
          urgencyMultiplier = 0.6; // Strong topics: maintain with lighter touch
        }
        break;

      case 'HIGH':
        // 1-3 weeks: Balance weak area focus with comprehensive coverage
        if (masteryLevel < 60) {
          urgencyMultiplier = 0.3;
        } else if (masteryLevel < 80) {
          urgencyMultiplier = 0.5;
        } else {
          urgencyMultiplier = 0.7;
        }
        break;

      case 'MEDIUM':
        // 3-6 weeks: Ensure all topics are review-ready
        if (masteryLevel < 50) {
          urgencyMultiplier = 0.5;
        } else if (masteryLevel < 75) {
          urgencyMultiplier = 0.7;
        } else {
          urgencyMultiplier = 0.85;
        }
        break;

      case 'LOW':
        // 6 weeks - 3 months: Gentle pressure to stay on track
        urgencyMultiplier = 0.9;
        break;
    }

    // Additional adjustment for new topics near exam
    if (learningPhase === 'ACQUISITION' && daysUntilExam <= 30) {
      urgencyMultiplier *= 0.6; // New topics need extra attention
    }

    return interval * urgencyMultiplier;
  }

  applyStrugglingTopicProtocol(
    interval: number,
    consecutiveIncorrect: number,
    masteryLevel: number,
    retentionStrength: number,
    learningPhase: LearningPhase
  ): number {
    // Critical struggle: Multiple consecutive failures
    if (consecutiveIncorrect >= 3) {
      return 0.25; // Review in 6 hours - immediate intervention
    }

    // Severe struggle: Two consecutive failures
    if (consecutiveIncorrect === 2) {
      if (learningPhase === 'ACQUISITION') {
        return 0.25; // 6 hours
      }
      return Math.min(interval, 0.5); // Max 12 hours
    }

    // Moderate struggle: One incorrect
    if (consecutiveIncorrect === 1) {
      if (learningPhase === 'ACQUISITION') {
        return Math.min(interval, 0.5); // Max 12 hours
      }
      if (masteryLevel < 40 || retentionStrength < 0.4) {
        return Math.min(interval, 1.0); // Max 1 day
      }
      return Math.min(interval, 2.0); // Max 2 days
    }

    // Chronically weak topic (low mastery despite attempts)
    if (masteryLevel < 30 && learningPhase !== 'ACQUISITION') {
      return Math.min(interval, 1.0); // Keep reviews frequent
    }

    return interval;
  }

  applyDifficultyAdjustment(
    interval: number,
    averageDifficulty: number,
    learningPhase: LearningPhase
  ): number {
    // Higher difficulty = slightly shorter intervals to maintain mastery
    // But reward mastery of difficult content with modest extensions

    if (learningPhase === 'ACQUISITION' || learningPhase === 'CONSOLIDATION') {
      // Early phases: Difficulty doesn't extend intervals much
      const difficultyModifier = 0.9 + (averageDifficulty * 0.2);
      return interval * difficultyModifier;
    }

    // Later phases: Successfully handling difficult content = can extend
    const difficultyModifier = 0.85 + (averageDifficulty * 0.35);
    return interval * difficultyModifier;
  }

  applyStrengthIndexModifier(
    interval: number,
    strengthIndex: number,
    learningPhase: LearningPhase
  ): number {
    // Strength index typically ranges from 0-1 or 0-10 depending on implementation
    // Normalize to 0-1 range
    const normalizedStrength = strengthIndex > 1 ? strengthIndex / 10 : strengthIndex;

    // High strength = can extend intervals modestly
    const strengthModifier = 0.9 + (normalizedStrength * 0.3);

    // Apply more conservatively in early phases
    if (learningPhase === 'ACQUISITION') {
      const conservativeModifier = 1.0 + (strengthModifier - 1.0) * 0.3;
      return interval * conservativeModifier;
    }

    return interval * strengthModifier;
  }

  applyCognitiveLoadManagement(
    interval: number,
    learningPhase: LearningPhase,
    urgencyLevel: UrgencyLevel
  ): number {
    // Don't create cognitive overload in non-urgent situations
    if (urgencyLevel === 'NONE' || urgencyLevel === 'LOW') {
      // Ensure minimum interval to prevent overwhelming the student
      if (learningPhase === 'MAINTENANCE' || learningPhase === 'MASTERY') {
        return Math.max(interval, 3); // At least 3 days for mastered content
      }
      if (learningPhase === 'PROFICIENCY') {
        return Math.max(interval, 2); // At least 2 days
      }
    }

    // In urgent situations, accept higher cognitive load but still be reasonable
    if (urgencyLevel === 'CRITICAL' || urgencyLevel === 'HIGH') {
      // Allow aggressive scheduling but maintain minimum recovery time
      return Math.max(interval, 0.25); // At least 6 hours between reviews
    }

    return interval;
  }
}

