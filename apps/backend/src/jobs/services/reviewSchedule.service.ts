import prisma from "@repo/db";
import { addDays, differenceInCalendarDays, differenceInDays, startOfDay } from "date-fns";
import { masteryConfig } from "../../services/mastery/MasteryConfig";
import { BaseJobService, UserBatch, JobConfig } from "./BaseJobService";

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
  recentAccuracy: number; // last 10 attempts
  speedIndex: number; // compared to ideal time
  consistencyScore: number; // variance in performance
  improvementRate: number; // trend over time
}

interface TopicReviewState {
  easinessFactor: number; // SM-2 inspired
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  learningPhase: 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED';
  confidenceLevel: number;
  lastDifficulty: number;
}

export class ReviewScheduleService extends BaseJobService {
  // Base intervals for different learning phases
  private readonly baseIntervalDays = 1;
  private readonly maxIntervalDays = 60;
  private readonly minIntervalDays = 0.25; // 6 hours for struggling topics
  
  // SM-2 Algorithm constants
  private readonly initialEasinessFactor = 2.5;
  private readonly minEasinessFactor = 1.3;
  private readonly maxEasinessFactor = 3.5;
  
  // Learning phase thresholds
  private readonly learningPhaseThresholds = {
    NEW_TO_LEARNING: 1, // attempts needed
    LEARNING_TO_REVIEWING: 3, // consecutive correct
    REVIEWING_TO_MASTERED: 5, // consecutive correct with long intervals
  };
  
  // Weight factors for multi-dimensional scoring
  private readonly weights = {
    accuracy: 0.30,
    speed: 0.20,
    consistency: 0.15,
    confidence: 0.15,
    improvement: 0.10,
    recency: 0.10,
  };
  
  // Urgency factors
  private readonly examUrgencyThresholds = {
    CRITICAL: 7, // days
    HIGH: 21,
    MEDIUM: 45,
    LOW: 90,
  };

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

  /**
   * Enhanced review scheduling using multi-factor analysis
   * Combines SM-2 algorithm with adaptive learning and exam urgency
   */
  public computeNextReviewSchedule(params: ReviewSchedulingInput): {
    nextReviewAt: Date;
    reviewInterval: number;
    easinessFactor: number;
    priority: number;
    learningPhase: string;
  } {
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

    // 1. Determine learning phase
    const learningPhase = this.determineLearningPhase(
      totalAttempts,
      consecutiveCorrect,
      masteryLevel,
      completedReviews
    );

    // 2. Calculate easiness factor (SM-2 inspired, but improved)
    const easinessFactor = this.calculateEasinessFactor(
      consecutiveCorrect,
      consecutiveIncorrect,
      retentionStrength,
      averageDifficulty
    );

    // 3. Calculate base interval using SM-2 with modifications
    let baseInterval = this.calculateBaseInterval(
      learningPhase,
      completedReviews,
      easinessFactor,
      consecutiveCorrect
    );

    // 4. Apply mastery level multiplier
    const streamCfg = masteryConfig.getExamConfig(examCode);
    const masteryMultiplier = this.calculateMasteryMultiplier(
      masteryLevel,
      strengthIndex,
      streamCfg.masteryThresholdAdjustment
    );
    baseInterval *= masteryMultiplier;

    // 5. Apply retention strength modifier
    const retentionModifier = this.calculateRetentionModifier(
      retentionStrength,
      learningPhase
    );
    baseInterval *= retentionModifier;

    // 6. Apply confidence score adjustment
    const confidenceModifier = this.calculateConfidenceModifier(
      confidenceScore,
      learningPhase
    );
    baseInterval *= confidenceModifier;

    // 7. Apply learning velocity (how fast user is improving)
    const velocityModifier = this.calculateVelocityModifier(learningVelocity);
    baseInterval *= velocityModifier;

    // 8. Apply exam urgency factor
    let urgencyModifier = 1.0;
    if (daysUntilExam) {
      urgencyModifier = this.calculateExamUrgencyModifier(
        daysUntilExam,
        masteryLevel,
        learningPhase
      );
      baseInterval *= urgencyModifier;
    }

    // 9. Apply diminishing returns for very long intervals
    if (baseInterval > 14) {
      const excess = baseInterval - 14;
      baseInterval = 14 + excess * 0.7; // Diminishing returns
    }

    // 10. Handle struggling topics (consecutive incorrect answers)
    if (consecutiveIncorrect >= 2) {
      baseInterval = Math.min(baseInterval, 1); // Review within 1 day
    } else if (consecutiveIncorrect >= 1 && learningPhase === 'NEW') {
      baseInterval = Math.min(baseInterval, 0.5); // Review within 12 hours
    }

    // 11. Final interval constraints
    const finalInterval = Math.min(
      Math.max(baseInterval, this.minIntervalDays),
      this.maxIntervalDays
    );

    // 12. Calculate priority score for scheduling
    const priority = this.calculatePriorityScore({
      learningPhase,
      consecutiveIncorrect,
      daysUntilExam,
      masteryLevel,
      retentionStrength,
      lastReviewedAt,
    });

    // 13. Convert to actual date
    const intervalInDays = Math.round(finalInterval);
    const fractionalDay = finalInterval - intervalInDays;
    const hoursToAdd = Math.round(fractionalDay * 24);
    
    let nextReviewAt = addDays(startOfDay(lastReviewedAt), intervalInDays);
    if (hoursToAdd > 0) {
      nextReviewAt = new Date(nextReviewAt.getTime() + hoursToAdd * 60 * 60 * 1000);
    }

    return {
      nextReviewAt,
      reviewInterval: finalInterval,
      easinessFactor,
      priority,
      learningPhase,
    };
  }

  public computeRetentionStrength(
    correctAttempts: number,
    totalAttempts: number,
    avgTime: number,
    examCode: string
  ): number {
    if (totalAttempts === 0) return 0.5;

    const idealTime =
      masteryConfig.getExamConfig(examCode).idealTimePerQuestion;

    const accuracy = correctAttempts / totalAttempts; // [0,1]
    const timeRatio = idealTime / Math.max(avgTime, 1); // > 0, higher is better
    const timeEfficiency = Math.min(Math.max(timeRatio, 0), 1); // clamp [0,1]

    const retention = accuracy * 0.7 + timeEfficiency * 0.3;
    return Math.min(Math.max(retention, 0), 1);
  }

  public computeRecallProbability(
    retentionStrength: number,
    daysSinceReview: number
  ): number {
    // Convert retention strength into an effective decay rate using the forgetting curve
    const baseDecay = masteryConfig.forgettingCurveParams.decayRate; // e.g., 0.1
    const adjustedDecay = Math.max(baseDecay * (1 - retentionStrength), 0.01);
    const probability = Math.exp(-adjustedDecay * Math.max(daysSinceReview, 0));
    return Math.min(Math.max(probability, 0), 1);
  }

  /**
   * Determine the current learning phase of a topic
   */
  private determineLearningPhase(
    totalAttempts: number,
    consecutiveCorrect: number,
    masteryLevel: number,
    completedReviews: number
  ): 'NEW' | 'LEARNING' | 'REVIEWING' | 'MASTERED' {
    if (masteryLevel >= 80 && consecutiveCorrect >= this.learningPhaseThresholds.REVIEWING_TO_MASTERED) {
      return 'MASTERED';
    }
    if (consecutiveCorrect >= this.learningPhaseThresholds.LEARNING_TO_REVIEWING && 
        completedReviews >= 3 && 
        masteryLevel >= 50) {
      return 'REVIEWING';
    }
    if (totalAttempts >= this.learningPhaseThresholds.NEW_TO_LEARNING) {
      return 'LEARNING';
    }
    return 'NEW';
  }

  /**
   * Calculate easiness factor using enhanced SM-2 algorithm
   * Factors in difficulty, retention, and performance streaks
   */
  private calculateEasinessFactor(
    consecutiveCorrect: number,
    consecutiveIncorrect: number,
    retentionStrength: number,
    averageDifficulty: number
  ): number {
    let ef = this.initialEasinessFactor;

    // Adjust based on consecutive correct (reward good performance)
    if (consecutiveCorrect > 0) {
      ef += consecutiveCorrect * 0.1;
    }

    // Penalize consecutive incorrect
    if (consecutiveIncorrect > 0) {
      ef -= consecutiveIncorrect * 0.3;
    }

    // Adjust based on retention strength
    ef += (retentionStrength - 0.5) * 0.4;

    // Adjust based on difficulty (harder questions = more credit)
    ef += (averageDifficulty - 0.5) * 0.2;

    // Clamp to valid range
    return Math.min(Math.max(ef, this.minEasinessFactor), this.maxEasinessFactor);
  }

  /**
   * Calculate base interval using learning phase and easiness factor
   */
  private calculateBaseInterval(
    learningPhase: string,
    completedReviews: number,
    easinessFactor: number,
    consecutiveCorrect: number
  ): number {
    switch (learningPhase) {
      case 'NEW':
        // New topics: short intervals
        return consecutiveCorrect === 0 ? 0.25 : 1; // 6 hours or 1 day

      case 'LEARNING':
        // Learning phase: graduated intervals
        if (completedReviews === 0) return 1;
        if (completedReviews === 1) return 3;
        if (completedReviews === 2) return 7;
        // After that, use easiness factor
        return Math.pow(easinessFactor, completedReviews - 2) * 7;

      case 'REVIEWING':
        // Standard spaced repetition
        if (completedReviews < 1) return 1;
        return Math.pow(easinessFactor, completedReviews - 1) * this.baseIntervalDays;

      case 'MASTERED':
        // Mastered topics: longer intervals
        return Math.pow(easinessFactor, completedReviews) * 2;

      default:
        return this.baseIntervalDays;
    }
  }

  /**
   * Calculate mastery level multiplier
   */
  private calculateMasteryMultiplier(
    masteryLevel: number,
    strengthIndex: number,
    examAdjustment: number
  ): number {
    const baseMasteryEffect = 1 + (masteryLevel / 100) * 0.5;
    const strengthEffect = 1 + (strengthIndex * 0.1);
    const examEffect = 1 + examAdjustment;
    
    return baseMasteryEffect * strengthEffect * examEffect;
  }

  /**
   * Calculate retention strength modifier
   */
  private calculateRetentionModifier(
    retentionStrength: number,
    learningPhase: string
  ): number {
    // Higher retention = longer intervals
    const baseModifier = 0.5 + retentionStrength;

    // More aggressive in reviewing/mastered phase
    if (learningPhase === 'REVIEWING' || learningPhase === 'MASTERED') {
      return baseModifier * 1.2;
    }

    return baseModifier;
  }

  /**
   * Calculate confidence score modifier
   * Confidence = how certain the user is about their answers
   */
  private calculateConfidenceModifier(
    confidenceScore: number,
    learningPhase: string
  ): number {
    // High confidence in correct answers = longer intervals
    const baseModifier = 0.8 + (confidenceScore * 0.4);

    // Confidence matters more in later phases
    if (learningPhase === 'MASTERED') {
      return 0.9 + (confidenceScore * 0.3);
    }

    return baseModifier;
  }

  /**
   * Calculate learning velocity modifier
   * Velocity = rate of improvement over time
   */
  private calculateVelocityModifier(learningVelocity: number): number {
    // Positive velocity (improving) = can extend intervals
    // Negative velocity (declining) = shorten intervals
    return 1 + (learningVelocity * 0.2);
  }

  /**
   * Calculate exam urgency modifier
   * Adjusts intervals based on proximity to exam date
   */
  private calculateExamUrgencyModifier(
    daysUntilExam: number,
    masteryLevel: number,
    learningPhase: string
  ): number {
    if (daysUntilExam < 0) return 1.0; // Exam passed

    let urgencyFactor = 1.0;

    if (daysUntilExam <= this.examUrgencyThresholds.CRITICAL) {
      // Critical: review everything, especially weak topics
      urgencyFactor = masteryLevel >= 70 ? 0.7 : 0.3;
    } else if (daysUntilExam <= this.examUrgencyThresholds.HIGH) {
      // High urgency: focus on weak topics
      urgencyFactor = masteryLevel >= 70 ? 0.8 : 0.5;
    } else if (daysUntilExam <= this.examUrgencyThresholds.MEDIUM) {
      // Medium urgency: balanced approach
      urgencyFactor = masteryLevel >= 70 ? 0.9 : 0.7;
    } else if (daysUntilExam <= this.examUrgencyThresholds.LOW) {
      // Low urgency: normal scheduling with slight pressure
      urgencyFactor = 0.95;
    }

    // New topics always need more frequent review before exam
    if (learningPhase === 'NEW' && daysUntilExam <= 30) {
      urgencyFactor *= 0.7;
    }

    return urgencyFactor;
  }

  /**
   * Calculate priority score for scheduling
   * Higher priority = should be reviewed sooner
   */
  private calculatePriorityScore(params: {
    learningPhase: string;
    consecutiveIncorrect: number;
    daysUntilExam?: number;
    masteryLevel: number;
    retentionStrength: number;
    lastReviewedAt: Date;
  }): number {
    let priority = 50; // Base priority

    // Phase urgency
    const phaseWeights = {
      NEW: 20,
      LEARNING: 15,
      REVIEWING: 10,
      MASTERED: 5,
    };
    priority += phaseWeights[params.learningPhase as keyof typeof phaseWeights] || 10;

    // Struggling topics (high priority)
    priority += params.consecutiveIncorrect * 15;

    // Low mastery (higher priority)
    priority += (100 - params.masteryLevel) * 0.2;

    // Low retention (higher priority)
    priority += (1 - params.retentionStrength) * 10;

    // Exam proximity
    if (params.daysUntilExam) {
      if (params.daysUntilExam <= 7) {
        priority += 30;
      } else if (params.daysUntilExam <= 21) {
        priority += 20;
      } else if (params.daysUntilExam <= 45) {
        priority += 10;
      }
    }

    // Overdue reviews
    const daysSinceReview = differenceInCalendarDays(new Date(), params.lastReviewedAt);
    if (daysSinceReview > 7) {
      priority += (daysSinceReview - 7) * 2;
    }

    return Math.min(Math.max(priority, 0), 100);
  }

  /**
   * Compute performance metrics from attempts
   */
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

    // Recent accuracy (last 10 attempts)
    const recent = attempts.slice(0, Math.min(10, totalAttempts));
    const recentCorrect = recent.filter(a => a.status === 'CORRECT').length;
    const recentAccuracy = recentCorrect / recent.length;

    // Average time
    const timings = attempts.filter(a => a.timing !== null).map(a => a.timing as number);
    const avgTime = timings.length > 0 
      ? timings.reduce((sum, t) => sum + t, 0) / timings.length
      : masteryConfig.getExamConfig(examCode).idealTimePerQuestion;

    // Speed index (how fast compared to ideal)
    const idealTime = masteryConfig.getExamConfig(examCode).idealTimePerQuestion;
    const speedIndex = Math.min(Math.max(idealTime / avgTime, 0.1), 2.0);

    // Consistency score (lower variance = higher consistency)
    let consistencyScore = 0.5;
    if (timings.length >= 3) {
      const mean = avgTime;
      const variance = timings.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / timings.length;
      const stdDev = Math.sqrt(variance);
      const cv = stdDev / mean; // coefficient of variation
      consistencyScore = Math.max(0, 1 - Math.min(cv, 1));
    }

    // Improvement rate (compare first half vs second half)
    let improvementRate = 0;
    if (totalAttempts >= 6) {
      const half = Math.floor(totalAttempts / 2);
      const firstHalf = attempts.slice(-half);
      const secondHalf = attempts.slice(0, half);
      
      const firstAccuracy = firstHalf.filter(a => a.status === 'CORRECT').length / firstHalf.length;
      const secondAccuracy = secondHalf.filter(a => a.status === 'CORRECT').length / secondHalf.length;
      
      improvementRate = secondAccuracy - firstAccuracy; // -1 to 1
    }

    // Consecutive streaks
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

  /**
   * Calculate confidence score based on performance patterns
   */
  private calculateConfidenceScore(metrics: PerformanceMetrics): number {
    // Weight multiple factors
    const accuracyWeight = metrics.accuracy * this.weights.accuracy;
    const speedWeight = (metrics.speedIndex / 2.0) * this.weights.speed;
    const consistencyWeight = metrics.consistencyScore * this.weights.consistency;
    const improvementWeight = ((metrics.improvementRate + 1) / 2) * this.weights.improvement;
    const recencyWeight = metrics.recentAccuracy * this.weights.recency;

    const totalWeight = 
      this.weights.accuracy + 
      this.weights.speed + 
      this.weights.consistency + 
      this.weights.improvement + 
      this.weights.recency;

    const confidence = 
      (accuracyWeight + speedWeight + consistencyWeight + improvementWeight + recencyWeight) / 
      totalWeight;

    return Math.min(Math.max(confidence, 0), 1);
  }

  /**
   * Calculate learning velocity (rate of improvement)
   */
  private calculateLearningVelocity(
    attempts: Array<{ status: string; solvedAt: Date }>,
    masteryLevel: number
  ): number {
    if (attempts.length < 4) return 0;

    // Compare recent performance to earlier performance
    const quarterSize = Math.floor(attempts.length / 4);
    const mostRecent = attempts.slice(0, quarterSize);
    const earlier = attempts.slice(-quarterSize);

    const recentAccuracy = mostRecent.filter(a => a.status === 'CORRECT').length / mostRecent.length;
    const earlierAccuracy = earlier.filter(a => a.status === 'CORRECT').length / earlier.length;

    const performanceChange = recentAccuracy - earlierAccuracy;

    // Factor in mastery level (higher mastery = slower expected growth)
    const masteryFactor = 1 - (masteryLevel / 100) * 0.5;

    return performanceChange * masteryFactor;
  }

  /**
   * Calculate average difficulty of attempted questions
   * Difficulty is stored as Int (1-5) in the database
   */
  private calculateAverageDifficulty(
    attempts: Array<{ question?: { difficulty?: number } }>
  ): number {
    const difficulties = attempts
      .map(a => a.question?.difficulty)
      .filter((d): d is number => d !== undefined && d !== null);

    if (difficulties.length === 0) return 0.5; // default medium

    // Normalize difficulty from 1-5 scale to 0-1 scale
    // 1 = easiest (0.2), 5 = hardest (1.0)
    const total = difficulties.reduce((sum, d) => sum + (d / 5), 0);
    return total / difficulties.length;
  }

  /**
   * Get days until exam for a user
   */
  private async getDaysUntilExam(userId: string): Promise<number | undefined> {
    const exam = await prisma.examUser.findFirst({
      where: { userId },
      select: { exam: { select: { examDate: true } } },
      orderBy: { registeredAt: 'desc' },
    });

    if (!exam?.exam?.examDate) return undefined;

    const daysUntil = differenceInDays(exam.exam.examDate, new Date());
    return daysUntil > 0 ? daysUntil : undefined;
  }

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

  /**
   * Enhanced update review schedule with comprehensive metrics
   */
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

    // Get historical data
    let lastReviewedAt = currentSchedule?.lastReviewedAt || now;
    let completedReviews = currentSchedule?.completedReviews || 0;
    let retentionStrength = currentSchedule?.retentionStrength ?? 0.5;

    // Fetch comprehensive attempt data with question difficulty
    const attempts = await prisma.attempt.findMany({
      where: { userId, question: { topicId } },
      orderBy: { solvedAt: "desc" },
      take: 50, // Increased for better analysis
      select: { 
        status: true, 
        timing: true, 
        solvedAt: true,
        question: {
          select: { difficulty: true }
        }
      },
    });

    // Compute comprehensive performance metrics
    const performanceMetrics = this.computePerformanceMetrics(attempts, examCode);
    
    // Calculate confidence score from multiple dimensions
    const confidenceScore = this.calculateConfidenceScore(performanceMetrics);
    
    // Calculate learning velocity (improvement trend)
    const learningVelocity = this.calculateLearningVelocity(
      attempts,
      topicMastery.masteryLevel
    );
    
    // Calculate average difficulty of questions attempted
    const averageDifficulty = this.calculateAverageDifficulty(attempts);

    // Update retention strength with new data
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
    const recallProbability = this.computeRecallProbability(
      retentionStrength,
      daysSinceReview
    );
    
    // Adjust retention based on recall probability and recent performance
    const retentionAdjusted = Math.min(
      1,
      Math.max(
        0, 
        retentionStrength * 0.7 + 
        recallProbability * 0.2 + 
        performanceMetrics.recentAccuracy * 0.1
      )
    );

    // Get exam urgency
    const daysUntilExam = await this.getDaysUntilExam(userId);

    // Compute next review schedule with all factors
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

    // Store the updated schedule with additional metadata
    return prisma.reviewSchedule.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: {
        nextReviewAt: review.nextReviewAt,
        reviewInterval: review.reviewInterval,
        retentionStrength: retentionAdjusted,
        // Note: If you want to store additional fields like priority, easinessFactor, learningPhase,
        // you'll need to add them to your schema first
      },
      create: {
        userId,
        topicId,
        lastReviewedAt,
        nextReviewAt: review.nextReviewAt,
        reviewInterval: review.reviewInterval,
        retentionStrength: retentionAdjusted,
        completedReviews: 0,
      },
    });
  }
}
