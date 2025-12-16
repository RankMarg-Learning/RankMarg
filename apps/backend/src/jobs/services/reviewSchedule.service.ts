import prisma from "@repo/db";
import { addDays, differenceInCalendarDays, differenceInDays, startOfDay, addHours } from "date-fns";
import { masteryConfig } from "../../services/mastery/MasteryConfig";
import { BaseJobService, UserBatch, JobConfig } from "./BaseJobService";

/**
 * ============================================================================
 * REDESIGNED REVIEW SCHEDULING ALGORITHM FOR NEET/JEE COMPETITIVE EXAMS
 * ============================================================================
 * 
 * Key Features:
 * 1. Adaptive Spaced Repetition with Exam Urgency
 * 2. Performance-Based Dynamic Intervals
 * 3. Cognitive Load Management
 * 4. Strategic Weak Area Targeting
 * 5. Learning Phase Progression System
 * 6. Multi-Dimensional Retention Modeling
 * 
 * Algorithm Philosophy:
 * - EARLY STAGE: Aggressive short intervals for foundation building
 * - LEARNING STAGE: Progressive spaced repetition with difficulty adaptation
 * - CONSOLIDATION: Balanced review with strategic reinforcement
 * - PRE-EXAM: Dynamic prioritization based on mastery gaps
 * - EXAM WEEK: Critical revision of weak areas and important topics
 */

interface ReviewSchedulingInput {
  masteryLevel: number;
  strengthIndex: number;
  lastReviewedAt: Date;
  completedReviews: number;
  retentionStrength: number;
  examCode: string;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  totalAttempts: number;
  averageDifficulty: number;
  confidenceScore: number;
  learningVelocity: number;
  daysUntilExam?: number;
}

interface PerformanceMetrics {
  accuracy: number;
  avgTime: number;
  recentAccuracy: number;
  speedIndex: number;
  consistencyScore: number;
  improvementRate: number;
}

interface ReviewOutput {
  nextReviewAt: Date;
  reviewInterval: number;
  easinessFactor: number;
  priority: number;
  learningPhase: string;
  urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  recommendedDailyLoad: number;
}

type LearningPhase = 'ACQUISITION' | 'CONSOLIDATION' | 'PROFICIENCY' | 'MASTERY' | 'MAINTENANCE';
type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export class ReviewScheduleService extends BaseJobService {
  
  // ============================================================================
  // CONFIGURATION CONSTANTS - Optimized for Competitive Exams
  // ============================================================================
  
  private readonly PHASE_CONFIG = {
    ACQUISITION: {
      name: 'ACQUISITION',
      baseInterval: 0.25, // 6 hours
      maxInterval: 3,
      requiredReviews: 3,
      masteryThreshold: 30,
      intervalProgression: [0.25, 0.5, 1, 2, 3], // 6h, 12h, 1d, 2d, 3d
    },
    CONSOLIDATION: {
      name: 'CONSOLIDATION',
      baseInterval: 3,
      maxInterval: 10,
      requiredReviews: 5,
      masteryThreshold: 50,
      intervalProgression: [3, 5, 7, 10], // 3d, 5d, 7d, 10d
    },
    PROFICIENCY: {
      name: 'PROFICIENCY',
      baseInterval: 10,
      maxInterval: 21,
      requiredReviews: 7,
      masteryThreshold: 70,
      intervalProgression: [10, 14, 18, 21], // 10d, 2w, 2.5w, 3w
    },
    MASTERY: {
      name: 'MASTERY',
      baseInterval: 21,
      maxInterval: 45,
      requiredReviews: 10,
      masteryThreshold: 85,
      intervalProgression: [21, 30, 38, 45], // 3w, 1m, 5w, 6w
    },
    MAINTENANCE: {
      name: 'MAINTENANCE',
      baseInterval: 45,
      maxInterval: 90,
      requiredReviews: 15,
      masteryThreshold: 95,
      intervalProgression: [45, 60, 75, 90], // 6w, 2m, 2.5m, 3m
    },
  };

  private readonly EXAM_URGENCY_WINDOWS = {
    CRITICAL: { days: 7, name: 'CRITICAL' as const },
    HIGH: { days: 21, name: 'HIGH' as const },
    MEDIUM: { days: 45, name: 'MEDIUM' as const },
    LOW: { days: 90, name: 'LOW' as const },
  };

  // Enhanced easiness factor bounds
  private readonly EF_MIN = 1.2;
  private readonly EF_MAX = 3.8;
  private readonly EF_INITIAL = 2.5;

  // Performance weights for holistic scoring
  private readonly PERFORMANCE_WEIGHTS = {
    accuracy: 0.35,
    speed: 0.20,
    consistency: 0.20,
    confidence: 0.15,
    velocity: 0.10,
  };

  // Cognitive load management
  private readonly MAX_DAILY_NEW_TOPICS = 5;
  private readonly OPTIMAL_DAILY_REVIEWS = 15;
  private readonly MAX_DAILY_REVIEWS = 30;

  constructor(config: Partial<JobConfig> = {}) {
    super({
      batchSize: 100,
      concurrencyLimit: 10,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCaching: true,
      cacheTimeout: 5 * 60 * 1000,
      ...config,
    });
  }

  // ============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================================================

  protected async getTotalUserCount(): Promise<number> {
    return await prisma.topicMastery.count();
  }

  protected async getUserBatch(
    batchSize: number,
    offset: number
  ): Promise<UserBatch[]> {
    const userTopicPairs = await prisma.topicMastery.findMany({
      select: { userId: true, topicId: true },
      skip: offset,
      take: batchSize,
      orderBy: { id: "asc" },
    });

    return userTopicPairs.map((pair) => ({
      userId: pair.userId,
      topicId: pair.topicId,
    }));
  }

  protected async processOneUser(user: UserBatch): Promise<void> {
    await this.updateReviewSchedule(user.userId, user.topicId);
  }

  // ============================================================================
  // CORE SCHEDULING ALGORITHM - NEW DESIGN
  // ============================================================================

  /**
   * Master scheduling function - orchestrates all factors
   * 
   * This is the heart of the algorithm that combines:
   * - Learning phase progression
   * - Adaptive spaced repetition
   * - Exam urgency modeling
   * - Performance-based adjustments
   * - Cognitive load balancing
   */
  public computeNextReviewSchedule(params: ReviewSchedulingInput): ReviewOutput {
    const {
      masteryLevel,
      strengthIndex,
      lastReviewedAt,
      completedReviews,
      retentionStrength,
      examCode,
      consecutiveCorrect,
      consecutiveIncorrect,
      totalAttempts,
      averageDifficulty,
      confidenceScore,
      learningVelocity,
      daysUntilExam,
    } = params;

    // STEP 1: Determine current learning phase
    const learningPhase = this.determineLearningPhase(
      totalAttempts,
      masteryLevel,
      completedReviews,
      consecutiveCorrect,
      retentionStrength
    );

    // STEP 2: Assess exam urgency level
    const urgencyLevel = this.determineUrgencyLevel(daysUntilExam, masteryLevel);

    // STEP 3: Calculate base interval using phase-specific progression
    let interval = this.calculatePhaseBasedInterval(
      learningPhase,
      completedReviews,
      consecutiveCorrect,
      masteryLevel
    );

    // STEP 4: Calculate enhanced easiness factor
    const easinessFactor = this.calculateEnhancedEasinessFactor(
      consecutiveCorrect,
      consecutiveIncorrect,
      retentionStrength,
      averageDifficulty,
      confidenceScore,
      learningVelocity
    );

    // STEP 5: Apply easiness factor modulation
    interval = this.applyEasinessModulation(interval, easinessFactor, learningPhase);

    // STEP 6: Apply performance-based adjustments
    interval = this.applyPerformanceAdjustments(
      interval,
      retentionStrength,
      confidenceScore,
      learningVelocity,
      learningPhase
    );

    // STEP 7: Apply exam urgency transformation
    interval = this.applyExamUrgencyTransformation(
      interval,
      urgencyLevel,
      masteryLevel,
      learningPhase,
      daysUntilExam
    );

    // STEP 8: Apply struggling topic emergency protocol
    interval = this.applyStrugglingTopicProtocol(
      interval,
      consecutiveIncorrect,
      masteryLevel,
      retentionStrength,
      learningPhase
    );

    // STEP 9: Apply difficulty-based fine-tuning
    interval = this.applyDifficultyAdjustment(
      interval,
      averageDifficulty,
      learningPhase
    );

    // STEP 10: Apply strength index optimization
    interval = this.applyStrengthIndexModifier(
      interval,
      strengthIndex,
      learningPhase
    );

    // STEP 11: Bound the interval to safe limits
    const phaseConfig = this.PHASE_CONFIG[learningPhase];
    interval = Math.max(0.25, Math.min(interval, phaseConfig.maxInterval));

    // STEP 12: Apply cognitive load management
    interval = this.applyCognitiveLoadManagement(
      interval,
      learningPhase,
      urgencyLevel
    );

    // STEP 13: Calculate priority score
    const priority = this.calculateComprehensivePriority(
      learningPhase,
      urgencyLevel,
      masteryLevel,
      retentionStrength,
      consecutiveIncorrect,
      lastReviewedAt,
      daysUntilExam
    );

    // STEP 14: Calculate recommended daily load
    const recommendedDailyLoad = this.calculateRecommendedDailyLoad(
      learningPhase,
      urgencyLevel,
      masteryLevel
    );

    // STEP 15: Convert interval to next review date
    const nextReviewAt = this.calculateNextReviewDate(lastReviewedAt, interval);

    return {
      nextReviewAt,
      reviewInterval: interval,
      easinessFactor,
      priority,
      learningPhase,
      urgencyLevel,
      recommendedDailyLoad,
    };
  }

  // ============================================================================
  // LEARNING PHASE DETERMINATION - Intelligent Phase Transitions
  // ============================================================================

  private determineLearningPhase(
    totalAttempts: number,
    masteryLevel: number,
    completedReviews: number,
    consecutiveCorrect: number,
    retentionStrength: number
  ): LearningPhase {
    // New topic or minimal attempts
    if (totalAttempts < 3 || masteryLevel < 20) {
      return 'ACQUISITION';
    }

    // Check for phase progression based on multiple criteria
    // MAINTENANCE: Nearly perfect mastery with sustained performance
    if (
      masteryLevel >= 95 &&
      completedReviews >= 15 &&
      consecutiveCorrect >= 8 &&
      retentionStrength >= 0.90
    ) {
      return 'MAINTENANCE';
    }

    // MASTERY: High mastery with consistent performance
    if (
      masteryLevel >= 85 &&
      completedReviews >= 10 &&
      consecutiveCorrect >= 6 &&
      retentionStrength >= 0.80
    ) {
      return 'MASTERY';
    }

    // PROFICIENCY: Good mastery with solid understanding
    if (
      masteryLevel >= 70 &&
      completedReviews >= 7 &&
      consecutiveCorrect >= 4 &&
      retentionStrength >= 0.70
    ) {
      return 'PROFICIENCY';
    }

    // CONSOLIDATION: Building foundation with improving performance
    if (
      masteryLevel >= 50 &&
      completedReviews >= 5 &&
      consecutiveCorrect >= 2 &&
      retentionStrength >= 0.55
    ) {
      return 'CONSOLIDATION';
    }

    // Default to ACQUISITION for everything else
    return 'ACQUISITION';
  }

  // ============================================================================
  // URGENCY LEVEL ASSESSMENT - Exam Proximity Analysis
  // ============================================================================

  private determineUrgencyLevel(
    daysUntilExam: number | undefined,
    masteryLevel: number
  ): UrgencyLevel {
    if (!daysUntilExam || daysUntilExam <= 0 || daysUntilExam > 180) {
      return 'NONE';
    }

    // Critical: Last week before exam
    if (daysUntilExam <= 7) {
      return 'CRITICAL';
    }

    // High: 1-3 weeks before exam
    if (daysUntilExam <= 21) {
      return 'HIGH';
    }

    // Medium: 3-6 weeks before exam
    if (daysUntilExam <= 45) {
      return 'MEDIUM';
    }

    // Low: 6 weeks - 3 months before exam
    if (daysUntilExam <= 90) {
      return 'LOW';
    }

    return 'NONE';
  }

  // ============================================================================
  // PHASE-BASED INTERVAL CALCULATION - Strategic Progression
  // ============================================================================

  private calculatePhaseBasedInterval(
    learningPhase: LearningPhase,
    completedReviews: number,
    consecutiveCorrect: number,
    masteryLevel: number
  ): number {
    const phaseConfig = this.PHASE_CONFIG[learningPhase];
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

  // ============================================================================
  // ENHANCED EASINESS FACTOR - Multi-Factor Performance Assessment
  // ============================================================================

  private calculateEnhancedEasinessFactor(
    consecutiveCorrect: number,
    consecutiveIncorrect: number,
    retentionStrength: number,
    averageDifficulty: number,
    confidenceScore: number,
    learningVelocity: number
  ): number {
    let ef = this.EF_INITIAL;

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
    return Math.max(this.EF_MIN, Math.min(ef, this.EF_MAX));
  }

  // ============================================================================
  // EASINESS MODULATION - Apply EF to Interval
  // ============================================================================

  private applyEasinessModulation(
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

  // ============================================================================
  // PERFORMANCE ADJUSTMENTS - Real-time Adaptation
  // ============================================================================

  private applyPerformanceAdjustments(
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

  // ============================================================================
  // EXAM URGENCY TRANSFORMATION - Strategic Pre-Exam Scheduling
  // ============================================================================

  private applyExamUrgencyTransformation(
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

  // ============================================================================
  // STRUGGLING TOPIC PROTOCOL - Emergency Intervention
  // ============================================================================

  private applyStrugglingTopicProtocol(
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

  // ============================================================================
  // DIFFICULTY ADJUSTMENT - Question Complexity Factor
  // ============================================================================

  private applyDifficultyAdjustment(
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

  // ============================================================================
  // STRENGTH INDEX OPTIMIZATION - Overall Performance Indicator
  // ============================================================================

  private applyStrengthIndexModifier(
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

  // ============================================================================
  // COGNITIVE LOAD MANAGEMENT - Prevent Burnout
  // ============================================================================

  private applyCognitiveLoadManagement(
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

  // ============================================================================
  // COMPREHENSIVE PRIORITY CALCULATION - Multi-Factor Ranking
  // ============================================================================

  private calculateComprehensivePriority(
    learningPhase: LearningPhase,
    urgencyLevel: UrgencyLevel,
    masteryLevel: number,
    retentionStrength: number,
    consecutiveIncorrect: number,
    lastReviewedAt: Date,
    daysUntilExam?: number
  ): number {
    let priority = 50; // Base priority

    // Component 1: Learning phase urgency (30 points max)
    const phaseScores = {
      ACQUISITION: 30,
      CONSOLIDATION: 22,
      PROFICIENCY: 15,
      MASTERY: 8,
      MAINTENANCE: 3,
    };
    priority += phaseScores[learningPhase];

    // Component 2: Exam urgency (25 points max)
    const urgencyScores = {
      CRITICAL: 25,
      HIGH: 18,
      MEDIUM: 12,
      LOW: 6,
      NONE: 0,
    };
    priority += urgencyScores[urgencyLevel];

    // Component 3: Struggling topic multiplier (20 points max)
    priority += Math.min(consecutiveIncorrect * 8, 20);

    // Component 4: Low mastery urgency (15 points max)
    if (masteryLevel < 50) {
      priority += (50 - masteryLevel) * 0.3;
    }

    // Component 5: Retention risk (10 points max)
    if (retentionStrength < 0.6) {
      priority += (0.6 - retentionStrength) * 16;
    }

    // Component 6: Overdue review penalty (10 points max)
    const daysSinceReview = differenceInCalendarDays(new Date(), lastReviewedAt);
    if (daysSinceReview > 14) {
      priority += Math.min((daysSinceReview - 14) * 0.5, 10);
    }

    // Component 7: Pre-exam weak topic critical boost
    if (daysUntilExam && daysUntilExam <= 21 && masteryLevel < 60) {
      priority += 15;
    }

    // Normalize to 0-100 scale
    return Math.min(Math.max(priority, 0), 100);
  }

  // ============================================================================
  // RECOMMENDED DAILY LOAD - Study Planning Assistance
  // ============================================================================

  private calculateRecommendedDailyLoad(
    learningPhase: LearningPhase,
    urgencyLevel: UrgencyLevel,
    masteryLevel: number
  ): number {
    let baseLoad = this.OPTIMAL_DAILY_REVIEWS;

    // Adjust based on learning phase
    if (learningPhase === 'ACQUISITION') {
      baseLoad = this.MAX_DAILY_NEW_TOPICS;
    } else if (learningPhase === 'CONSOLIDATION') {
      baseLoad = 10;
    }

    // Adjust based on urgency
    const urgencyMultipliers = {
      CRITICAL: 2.0,
      HIGH: 1.5,
      MEDIUM: 1.2,
      LOW: 1.0,
      NONE: 1.0,
    };

    baseLoad *= urgencyMultipliers[urgencyLevel];

    // Cap at maximum
    return Math.min(baseLoad, this.MAX_DAILY_REVIEWS);
  }

  // ============================================================================
  // NEXT REVIEW DATE CALCULATION - Convert Interval to DateTime
  // ============================================================================

  private calculateNextReviewDate(lastReviewedAt: Date, intervalDays: number): Date {
    const wholeDays = Math.floor(intervalDays);
    const fractionalDay = intervalDays - wholeDays;
    const hours = Math.round(fractionalDay * 24);

    let nextReview = addDays(startOfDay(lastReviewedAt), wholeDays);
    if (hours > 0) {
      nextReview = addHours(nextReview, hours);
    }

    // Ensure next review is never in the past
    const now = new Date();
    if (nextReview < now) {
      return now;
    }

    return nextReview;
  }

  // ============================================================================
  // RETENTION STRENGTH COMPUTATION - Memory Stability Indicator
  // ============================================================================

  public computeRetentionStrength(
    correctAttempts: number,
    totalAttempts: number,
    avgTime: number,
    examCode: string
  ): number {
    if (totalAttempts === 0) return 0.5;

    const idealTime = masteryConfig.getExamConfig(examCode).idealTimePerQuestion;

    // Component 1: Accuracy (70% weight)
    const accuracy = correctAttempts / totalAttempts;

    // Component 2: Speed efficiency (30% weight)
    const timeRatio = idealTime / Math.max(avgTime, 1);
    const speedEfficiency = Math.min(Math.max(timeRatio, 0), 1.5) / 1.5;

    // Combined retention with emphasis on accuracy
    const retention = accuracy * 0.70 + speedEfficiency * 0.30;

    return Math.min(Math.max(retention, 0), 1);
  }

  // ============================================================================
  // RECALL PROBABILITY - Forgetting Curve Model
  // ============================================================================

  public computeRecallProbability(
    retentionStrength: number,
    daysSinceReview: number
  ): number {
    // Exponential forgetting curve: P(t) = e^(-λt)
    // λ (decay rate) inversely proportional to retention strength
    
    const baseDecay = masteryConfig.forgettingCurveParams.decayRate;
    const adjustedDecay = baseDecay * (1.2 - retentionStrength);
    
    // Apply exponential decay
    const probability = Math.exp(-adjustedDecay * Math.max(daysSinceReview, 0));
    
    return Math.min(Math.max(probability, 0), 1);
  }

  // ============================================================================
  // PERFORMANCE METRICS COMPUTATION - Historical Analysis
  // ============================================================================

  private computePerformanceMetrics(
    attempts: Array<{ status: string; timing: number | null; solvedAt: Date }>,
    examCode: string
  ): PerformanceMetrics & { 
    consecutiveCorrect: number;
    consecutiveIncorrect: number;
  } {
    if (attempts.length === 0) {
      return {
        accuracy: 0,
        avgTime: masteryConfig.getExamConfig(examCode).idealTimePerQuestion,
        recentAccuracy: 0,
        speedIndex: 1,
        consistencyScore: 0,
        improvementRate: 0,
        consecutiveCorrect: 0,
        consecutiveIncorrect: 0,
      };
    }

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter(a => a.status === 'CORRECT').length;
    const accuracy = correctAttempts / totalAttempts;

    // Recent performance (last 10 attempts)
    const recentAttempts = attempts.slice(0, Math.min(10, totalAttempts));
    const recentCorrect = recentAttempts.filter(a => a.status === 'CORRECT').length;
    const recentAccuracy = recentCorrect / recentAttempts.length;

    // Timing analysis
    const timings = attempts.filter(a => a.timing !== null).map(a => a.timing as number);
    const avgTime = timings.length > 0 
      ? timings.reduce((sum, t) => sum + t, 0) / timings.length
      : masteryConfig.getExamConfig(examCode).idealTimePerQuestion;

    const idealTime = masteryConfig.getExamConfig(examCode).idealTimePerQuestion;
    const speedIndex = Math.min(Math.max(idealTime / avgTime, 0.1), 2.0);

    // Consistency score (lower variance = better)
    let consistencyScore = 0.5;
    if (timings.length >= 3) {
      const variance = timings.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) / timings.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / avgTime;
      consistencyScore = Math.max(0, 1 - Math.min(coefficientOfVariation, 1));
    }

    // Improvement rate (comparing halves)
    let improvementRate = 0;
    if (totalAttempts >= 6) {
      const midpoint = Math.floor(totalAttempts / 2);
      const olderHalf = attempts.slice(midpoint);
      const newerHalf = attempts.slice(0, midpoint);
      
      const olderAccuracy = olderHalf.filter(a => a.status === 'CORRECT').length / olderHalf.length;
      const newerAccuracy = newerHalf.filter(a => a.status === 'CORRECT').length / newerHalf.length;
      
      improvementRate = newerAccuracy - olderAccuracy;
    }

    // Consecutive streaks (from most recent)
    let consecutiveCorrect = 0;
    let consecutiveIncorrect = 0;
    for (const attempt of attempts) {
      if (attempt.status === 'CORRECT') {
        consecutiveCorrect++;
        consecutiveIncorrect = 0;
      } else {
        consecutiveIncorrect++;
        consecutiveCorrect = 0;
      }
      if (consecutiveCorrect > 0 || consecutiveIncorrect > 0) break;
    }

    return {
      accuracy,
      avgTime,
      recentAccuracy,
      speedIndex,
      consistencyScore,
      improvementRate,
      consecutiveCorrect,
      consecutiveIncorrect,
    };
  }

  // ============================================================================
  // CONFIDENCE SCORE - Multi-Dimensional Performance Assessment
  // ============================================================================

  private calculateConfidenceScore(metrics: PerformanceMetrics): number {
    const weights = this.PERFORMANCE_WEIGHTS;

    const accuracyComponent = metrics.accuracy * weights.accuracy;
    const speedComponent = (metrics.speedIndex / 2.0) * weights.speed;
    const consistencyComponent = metrics.consistencyScore * weights.consistency;
    const confidenceComponent = metrics.recentAccuracy * weights.confidence;
    const velocityComponent = ((metrics.improvementRate + 1) / 2) * weights.velocity;

    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    const confidence = 
      (accuracyComponent + speedComponent + consistencyComponent + 
       confidenceComponent + velocityComponent) / totalWeight;

    return Math.min(Math.max(confidence, 0), 1);
  }

  // ============================================================================
  // LEARNING VELOCITY - Improvement Trajectory
  // ============================================================================

  private calculateLearningVelocity(
    attempts: Array<{ status: string; solvedAt: Date }>,
    masteryLevel: number
  ): number {
    if (attempts.length < 4) return 0;

    // Compare recent quarter vs earlier quarter
    const quarterSize = Math.floor(attempts.length / 4);
    const recentQuarter = attempts.slice(0, quarterSize);
    const earlierQuarter = attempts.slice(-quarterSize);

    const recentAccuracy = recentQuarter.filter(a => a.status === 'CORRECT').length / recentQuarter.length;
    const earlierAccuracy = earlierQuarter.filter(a => a.status === 'CORRECT').length / earlierQuarter.length;

    const rawVelocity = recentAccuracy - earlierAccuracy;

    // Normalize by mastery level (harder to improve at high mastery)
    const masteryNormalization = 1 - (masteryLevel / 100) * 0.6;

    return rawVelocity * masteryNormalization;
  }

  // ============================================================================
  // AVERAGE DIFFICULTY CALCULATION
  // ============================================================================

  private calculateAverageDifficulty(
    attempts: Array<{ question?: { difficulty?: number } }>
  ): number {
    const difficulties = attempts
      .map(a => a.question?.difficulty)
      .filter((d): d is number => d !== undefined && d !== null);

    if (difficulties.length === 0) return 0.5;

    // Normalize from 1-5 scale to 0-1 scale
    const normalized = difficulties.map(d => d / 5);
    return normalized.reduce((sum, d) => sum + d, 0) / normalized.length;
  }

  // ============================================================================
  // EXAM DATE LOOKUP
  // ============================================================================

  private async getDaysUntilExam(userId: string): Promise<number | undefined> {
    const examUser = await prisma.examUser.findFirst({
      where: { userId },
      select: { exam: { select: { examDate: true } } },
      orderBy: { registeredAt: 'desc' },
    });

    if (!examUser?.exam?.examDate) return undefined;

    const daysUntil = differenceInDays(examUser.exam.examDate, new Date());
    return daysUntil > 0 ? daysUntil : undefined;
  }

  // ============================================================================
  // PUBLIC API - Update Schedules for User
  // ============================================================================

  public async updateSchedulesForUser(userId: string): Promise<void> {
    const topics = await prisma.topicMastery.findMany({
      where: { userId },
      select: { topicId: true },
    });

    const concurrency = 10;
    for (let i = 0; i < topics.length; i += concurrency) {
      const chunk = topics.slice(i, i + concurrency);
      await Promise.all(
        chunk.map(({ topicId }) => this.updateReviewSchedule(userId, topicId))
      );
    }
  }

  // ============================================================================
  // MAIN UPDATE FUNCTION - Complete Schedule Refresh
  // ============================================================================

  public async updateReviewSchedule(userId: string, topicId: string) {
    const cacheKey = `review_schedule_${userId}_${topicId}`;

    const scheduleData = await this.getCachedData(cacheKey, async () => {
      const [topicMastery, currentSchedule, user] = await Promise.all([
        prisma.topicMastery.findUnique({
          where: { userId_topicId: { userId, topicId } },
        }),
        prisma.reviewSchedule.findUnique({
          where: { userId_topicId: { userId, topicId } },
        }),
        prisma.examUser.findFirst({
          where: { userId },
          select: { exam: { select: { code: true } } },
          orderBy: { registeredAt: "desc" },
        }),
      ]);

      return { topicMastery, currentSchedule, user };
    });

    const { topicMastery, currentSchedule, user } = scheduleData;

    if (!topicMastery) {
      throw new Error(
        `No mastery data found for user ${userId} and topic ${topicId}`
      );
    }

    const examCode = user?.exam.code || "DEFAULT";
    const now = new Date();

    // Extract historical data
    let lastReviewedAt = currentSchedule?.lastReviewedAt || now;
    let completedReviews = currentSchedule?.completedReviews || 0;
    let retentionStrength = currentSchedule?.retentionStrength ?? 0.5;

    // Fetch comprehensive attempt data
    const attempts = await prisma.attempt.findMany({
      where: { userId, question: { topicId } },
      orderBy: { solvedAt: "desc" },
      take: 50,
      select: { 
        status: true, 
        timing: true, 
        solvedAt: true,
        question: {
          select: { difficulty: true }
        }
      },
    });

    // Compute all performance metrics
    const performanceMetrics = this.computePerformanceMetrics(attempts, examCode);
    const confidenceScore = this.calculateConfidenceScore(performanceMetrics);
    const learningVelocity = this.calculateLearningVelocity(attempts, topicMastery.masteryLevel);
    const averageDifficulty = this.calculateAverageDifficulty(attempts);

    // Update retention strength
    if (attempts.length > 0) {
      const correctAttempts = attempts.filter(a => a.status === "CORRECT").length;
      retentionStrength = this.computeRetentionStrength(
        correctAttempts,
        attempts.length,
        performanceMetrics.avgTime,
        examCode
      );
    }

    // Apply forgetting curve adjustment
    const daysSinceReview = differenceInCalendarDays(now, lastReviewedAt);
    const recallProbability = this.computeRecallProbability(retentionStrength, daysSinceReview);
    
    const retentionAdjusted = Math.min(
      1,
      Math.max(
        0, 
        retentionStrength * 0.6 + 
        recallProbability * 0.25 + 
        performanceMetrics.recentAccuracy * 0.15
      )
    );

    // Get exam urgency
    const daysUntilExam = await this.getDaysUntilExam(userId);

    // Compute next review schedule
    const review = this.computeNextReviewSchedule({
      masteryLevel: topicMastery.masteryLevel,
      strengthIndex: topicMastery.strengthIndex,
      lastReviewedAt,
      completedReviews,
      retentionStrength: retentionAdjusted,
      examCode,
      consecutiveCorrect: performanceMetrics.consecutiveCorrect,
      consecutiveIncorrect: performanceMetrics.consecutiveIncorrect,
      totalAttempts: attempts.length,
      averageDifficulty,
      confidenceScore,
      learningVelocity,
      daysUntilExam,
    });

    // Update database
    return prisma.reviewSchedule.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: {
        nextReviewAt: review.nextReviewAt,
        reviewInterval: Math.round(review.reviewInterval),
        retentionStrength: retentionAdjusted,
      },
      create: {
        userId,
        topicId,
        lastReviewedAt,
        nextReviewAt: review.nextReviewAt,
        reviewInterval: Math.round(review.reviewInterval),
        retentionStrength: retentionAdjusted,
        completedReviews: 0,
      },
    });
  }
}
