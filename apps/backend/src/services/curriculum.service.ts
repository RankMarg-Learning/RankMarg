import { CurriculumRepository } from "../repositories/curriculum.repository";
import { ActivityRepository } from "../repositories/activity.repository";
import { StudyTopic, CurrentStudiesQuery } from "../types/profile.types";
import {
  PaginationMeta,
  ApiError,
  ErrorCode,
  SubscriptionTier,
} from "../types/common";
import { RedisCacheService } from "./session/RedisCacheService";

export class CurriculumService {
  private curriculumRepository: CurriculumRepository;
  private activityRepository: ActivityRepository;

  constructor() {
    this.curriculumRepository = new CurriculumRepository();
    this.activityRepository = new ActivityRepository();
  }

  async getCurrentStudies(
    userId: string,
    query: CurrentStudiesQuery,
    userTier: SubscriptionTier
  ): Promise<{ data: StudyTopic[]; pagination?: PaginationMeta }> {
    // Apply tier-based limits
    const limitedQuery = this.applyTierLimits(query, userTier);
    const cacheKey = `curriculum:${userId}:${JSON.stringify(limitedQuery)}`;

    try {
      // Try cache first for frequently accessed data
      if (!query.uniqueSubjects) {
        // Don't cache unique subjects as it's more dynamic
        const cachedResult = await RedisCacheService.get(cacheKey);
        if (cachedResult) {
          return JSON.parse(cachedResult);
        }
      }

      const result = await this.curriculumRepository.getCurrentStudies(
        userId,
        limitedQuery
      );

      // Cache for 2 minutes
      if (!query.uniqueSubjects) {
        await RedisCacheService.set(cacheKey, JSON.stringify(result), 120);
      }

      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error("Error in getCurrentStudies:", error);
      throw new ApiError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to retrieve current studies",
        500,
        error
      );
    }
  }

  async startStudyTopic(
    userId: string,
    subjectId: number,
    topicId: number,
    userTier: SubscriptionTier
  ): Promise<StudyTopic> {
    try {
      // Check if user can start new topics based on tier
      await this.validateStudyTopicLimits(userId, userTier);

      const studyTopic = await this.curriculumRepository.createStudyTopic(
        userId,
        subjectId,
        topicId
      );

      // Create activity log
      await this.activityRepository.createActivity(
        userId,
        "Study",
        `Started studying ${studyTopic.subjectName}: ${studyTopic.topicName}`,
        10, // 10 coins for starting a new topic
        {
          subjectId,
          topicId,
          subjectName: studyTopic.subjectName,
          topicName: studyTopic.topicName,
        }
      );

      // Clear curriculum caches
      await this.clearCurriculumCaches(userId);

      return studyTopic;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error("Error in startStudyTopic:", error);
      throw new ApiError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to start study topic",
        500,
        error
      );
    }
  }

  async updateStudyTopic(
    userId: string,
    studyTopicId: string,
    updateData: Partial<StudyTopic>
  ): Promise<StudyTopic> {
    try {
      const updatedTopic = await this.curriculumRepository.updateStudyTopic(
        userId,
        studyTopicId,
        updateData
      );

      // Create activity if topic is completed
      if (updateData.isCompleted === true) {
        await this.activityRepository.createActivity(
          userId,
          "Achievement",
          `Completed ${updatedTopic.subjectName}: ${updatedTopic.topicName}`,
          25, // 25 coins for completing a topic
          {
            studyTopicId,
            subjectName: updatedTopic.subjectName,
            topicName: updatedTopic.topicName,
          }
        );
      }

      // Clear curriculum caches
      await this.clearCurriculumCaches(userId);

      return updatedTopic;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error("Error in updateStudyTopic:", error);
      throw new ApiError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to update study topic",
        500,
        error
      );
    }
  }

  async getStudyStats(userId: string): Promise<{
    totalTopicsStarted: number;
    totalTopicsCompleted: number;
    currentActiveTopics: number;
    subjectBreakdown: Record<string, { started: number; completed: number }>;
  }> {
    const cacheKey = `curriculum:stats:${userId}`;

    try {
      const cachedStats = await RedisCacheService.get(cacheKey);
      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      // This would require custom queries - simplified version
      const [allTopics, activeTopics] = await Promise.all([
        this.curriculumRepository.getCurrentStudies(userId, {
          includeCompleted: true,
          page: 1,
          limit: 1000, // Get all for stats
        }),
        this.curriculumRepository.getCurrentStudies(userId, {
          isCurrent: true,
          includeCompleted: false,
          page: 1,
          limit: 1000,
        }),
      ]);

      const totalTopicsStarted = allTopics.data.length;
      const totalTopicsCompleted = allTopics.data.filter(
        (t) => t.isCompleted
      ).length;
      const currentActiveTopics = activeTopics.data.length;

      // Subject breakdown
      const subjectBreakdown: Record<
        string,
        { started: number; completed: number }
      > = {};

      allTopics.data.forEach((topic) => {
        const subject = topic.subjectName;
        if (!subjectBreakdown[subject]) {
          subjectBreakdown[subject] = { started: 0, completed: 0 };
        }
        subjectBreakdown[subject].started++;
        if (topic.isCompleted) {
          subjectBreakdown[subject].completed++;
        }
      });

      const stats = {
        totalTopicsStarted,
        totalTopicsCompleted,
        currentActiveTopics,
        subjectBreakdown,
      };

      // Cache for 10 minutes
      await RedisCacheService.set(cacheKey, JSON.stringify(stats), 600);

      return stats;
    } catch (error) {
      console.error("Error in getStudyStats:", error);
      throw new ApiError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to retrieve study statistics",
        500,
        error
      );
    }
  }

  private applyTierLimits(
    query: CurrentStudiesQuery,
    userTier: SubscriptionTier
  ): CurrentStudiesQuery {
    // Apply limits based on subscription tier
    let maxLimit = 10; // FREE tier limit

    switch (userTier) {
      case SubscriptionTier.BASIC:
        maxLimit = 25;
        break;
      case SubscriptionTier.PREMIUM:
        maxLimit = 50;
        break;
      case SubscriptionTier.ENTERPRISE:
        maxLimit = 100;
        break;
    }

    return {
      ...query,
      limit: Math.min(query.limit, maxLimit),
    };
  }

  private async validateStudyTopicLimits(
    userId: string,
    userTier: SubscriptionTier
  ): Promise<void> {
    // Check concurrent study topic limits based on tier
    let maxConcurrentTopics = 3; // FREE tier

    switch (userTier) {
      case SubscriptionTier.BASIC:
        maxConcurrentTopics = 10;
        break;
      case SubscriptionTier.PREMIUM:
        maxConcurrentTopics = 25;
        break;
      case SubscriptionTier.ENTERPRISE:
        maxConcurrentTopics = 100;
        break;
    }

    const activeTopics = await this.curriculumRepository.getCurrentStudies(
      userId,
      {
        isCurrent: true,
        includeCompleted: false,
        page: 1,
        limit: maxConcurrentTopics + 1,
      }
    );

    if (activeTopics.data.length >= maxConcurrentTopics) {
      throw new ApiError(
        ErrorCode.SUBSCRIPTION_REQUIRED,
        `Maximum concurrent study topics (${maxConcurrentTopics}) reached for ${userTier} tier`,
        403
      );
    }
  }

  private async clearCurriculumCaches(userId: string): Promise<void> {
    try {
      await RedisCacheService.clearPattern(`curriculum:${userId}:*`);
      await RedisCacheService.clearPattern(`curriculum:stats:${userId}`);
    } catch (error) {
      console.warn("Failed to clear curriculum caches:", error);
    }
  }
}
