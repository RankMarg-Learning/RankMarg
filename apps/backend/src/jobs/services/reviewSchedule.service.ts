import prisma from "@repo/db";
import { differenceInCalendarDays } from "date-fns";
import { BaseJobService, UserBatch, JobConfig } from "./BaseJobService";
import {
  LearningPhase,
  UrgencyLevel,
  PHASE_CONFIG,
  LearningPhaseCalculator,
  UrgencyLevelCalculator,
  IntervalCalculator,
  PerformanceMetricsCalculator,
  PriorityCalculator,
  RetentionCalculator,
  SubjectConstraintHandler,
  DateCalculator,
  ExamDateService,
} from "./reviewSchedule";
import { captureServiceError } from "../../lib/sentry";

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

interface ReviewOutput {
  nextReviewAt: Date;
  reviewInterval: number;
  easinessFactor: number;
  priority: number;
  learningPhase: string;
  urgencyLevel: UrgencyLevel;
  recommendedDailyLoad: number;
}

export class ReviewScheduleService extends BaseJobService {
  // Component instances
  private readonly learningPhaseCalculator: LearningPhaseCalculator;
  private readonly urgencyLevelCalculator: UrgencyLevelCalculator;
  private readonly intervalCalculator: IntervalCalculator;
  private readonly performanceMetricsCalculator: PerformanceMetricsCalculator;
  private readonly priorityCalculator: PriorityCalculator;
  private readonly retentionCalculator: RetentionCalculator;
  private readonly subjectConstraintHandler: SubjectConstraintHandler;
  private readonly dateCalculator: DateCalculator;
  private readonly examDateService: ExamDateService;

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

    // Initialize components
    this.learningPhaseCalculator = new LearningPhaseCalculator();
    this.urgencyLevelCalculator = new UrgencyLevelCalculator();
    this.intervalCalculator = new IntervalCalculator();
    this.performanceMetricsCalculator = new PerformanceMetricsCalculator();
    this.priorityCalculator = new PriorityCalculator();
    this.retentionCalculator = new RetentionCalculator();
    this.subjectConstraintHandler = new SubjectConstraintHandler();
    this.dateCalculator = new DateCalculator();
    this.examDateService = new ExamDateService();
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
    const learningPhase = this.learningPhaseCalculator.determineLearningPhase(
      totalAttempts,
      masteryLevel,
      completedReviews,
      consecutiveCorrect,
      retentionStrength
    );

    // STEP 2: Assess exam urgency level
    const urgencyLevel = this.urgencyLevelCalculator.determineUrgencyLevel(
      daysUntilExam,
      masteryLevel
    );

    // STEP 3: Calculate base interval using phase-specific progression
    let interval = this.intervalCalculator.calculatePhaseBasedInterval(
      learningPhase,
      completedReviews,
      consecutiveCorrect,
      masteryLevel
    );

    // STEP 4: Calculate enhanced easiness factor
    const easinessFactor = this.intervalCalculator.calculateEnhancedEasinessFactor(
      consecutiveCorrect,
      consecutiveIncorrect,
      retentionStrength,
      averageDifficulty,
      confidenceScore,
      learningVelocity
    );

    // STEP 5: Apply easiness factor modulation
    interval = this.intervalCalculator.applyEasinessModulation(
      interval,
      easinessFactor,
      learningPhase
    );

    // STEP 6: Apply performance-based adjustments
    interval = this.intervalCalculator.applyPerformanceAdjustments(
      interval,
      retentionStrength,
      confidenceScore,
      learningVelocity,
      learningPhase
    );

    // STEP 7: Apply exam urgency transformation
    interval = this.intervalCalculator.applyExamUrgencyTransformation(
      interval,
      urgencyLevel,
      masteryLevel,
      learningPhase,
      daysUntilExam
    );

    // STEP 8: Apply struggling topic emergency protocol
    interval = this.intervalCalculator.applyStrugglingTopicProtocol(
      interval,
      consecutiveIncorrect,
      masteryLevel,
      retentionStrength,
      learningPhase
    );

    // STEP 9: Apply difficulty-based fine-tuning
    interval = this.intervalCalculator.applyDifficultyAdjustment(
      interval,
      averageDifficulty,
      learningPhase
    );

    // STEP 10: Apply strength index optimization
    interval = this.intervalCalculator.applyStrengthIndexModifier(
      interval,
      strengthIndex,
      learningPhase
    );

    // STEP 11: Bound the interval to safe limits
    const phaseConfig = PHASE_CONFIG[learningPhase];
    interval = Math.max(0.25, Math.min(interval, phaseConfig.maxInterval));

    // STEP 12: Apply cognitive load management
    interval = this.intervalCalculator.applyCognitiveLoadManagement(
      interval,
      learningPhase,
      urgencyLevel
    );

    // STEP 13: Calculate priority score
    const priority = this.priorityCalculator.calculateComprehensivePriority(
      learningPhase,
      urgencyLevel,
      masteryLevel,
      retentionStrength,
      consecutiveIncorrect,
      lastReviewedAt,
      daysUntilExam
    );

    // STEP 14: Calculate recommended daily load
    const recommendedDailyLoad = this.priorityCalculator.calculateRecommendedDailyLoad(
      learningPhase,
      urgencyLevel,
      masteryLevel
    );

    // STEP 15: Convert interval to next review date
    const nextReviewAt = this.dateCalculator.calculateNextReviewDate(
      lastReviewedAt,
      interval
    );

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
      const [topicMastery, currentSchedule, user, topic] = await Promise.all([
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
        prisma.topic.findUnique({
          where: { id: topicId },
          select: { subjectId: true },
        }),
      ]);

      return { topicMastery, currentSchedule, user, topic };
    });

    const { topicMastery, currentSchedule, user, topic } = scheduleData;

    if (!topicMastery) {
      const error = new Error(
        `No mastery data found for user ${userId} and topic ${topicId}`
      );
      captureServiceError(error, {
        service: "ReviewScheduleService",
        method: "updateReviewSchedule",
        userId,
        additionalData: {
          topicId,
        },
      });
      throw error;
    }

    if (!topic) {
      const error = new Error(`Topic ${topicId} not found`);
      captureServiceError(error, {
        service: "ReviewScheduleService",
        method: "updateReviewSchedule",
        userId,
        additionalData: {
          topicId,
        },
      });
      throw error;
    }

    const subjectId = topic.subjectId;

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
    const performanceMetrics = this.performanceMetricsCalculator.computePerformanceMetrics(
      attempts,
      examCode
    );
    const confidenceScore = this.performanceMetricsCalculator.calculateConfidenceScore(
      performanceMetrics
    );
    const learningVelocity = this.performanceMetricsCalculator.calculateLearningVelocity(
      attempts,
      topicMastery.masteryLevel
    );
    const averageDifficulty = this.performanceMetricsCalculator.calculateAverageDifficulty(
      attempts
    );

    // Update retention strength
    if (attempts.length > 0) {
      const correctAttempts = attempts.filter(a => a.status === "CORRECT").length;
      retentionStrength = this.retentionCalculator.computeRetentionStrength(
        correctAttempts,
        attempts.length,
        performanceMetrics.avgTime,
        examCode
      );
    }

    // Apply forgetting curve adjustment
    const daysSinceReview = differenceInCalendarDays(now, lastReviewedAt);
    const recallProbability = this.retentionCalculator.computeRecallProbability(
      retentionStrength,
      daysSinceReview
    );
    
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
    const daysUntilExam = await this.examDateService.getDaysUntilExam(userId);

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

    // Apply subject-level constraint: only one topic per subject per day
    const nextReviewAt = await this.subjectConstraintHandler.findNextAvailableDateForSubject(
      userId,
      subjectId,
      review.nextReviewAt,
      topicId
    );

    // Update database
    return prisma.reviewSchedule.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: {
        nextReviewAt,
        reviewInterval: Math.round(review.reviewInterval),
        retentionStrength: retentionAdjusted,
      },
      create: {
        userId,
        topicId,
        lastReviewedAt,
        nextReviewAt,
        reviewInterval: Math.round(review.reviewInterval),
        retentionStrength: retentionAdjusted,
        completedReviews: 0,
      },
    });
  }

  // ============================================================================
  // PUBLIC API METHODS - Exposed for external use
  // ============================================================================

  public computeRetentionStrength(
    correctAttempts: number,
    totalAttempts: number,
    avgTime: number,
    examCode: string
  ): number {
    return this.retentionCalculator.computeRetentionStrength(
      correctAttempts,
      totalAttempts,
      avgTime,
      examCode
    );
  }

  public computeRecallProbability(
    retentionStrength: number,
    daysSinceReview: number
  ): number {
    return this.retentionCalculator.computeRecallProbability(
      retentionStrength,
      daysSinceReview
    );
  }
}
