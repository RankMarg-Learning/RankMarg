import { ActivityRepository } from "../repositories/activity.repository";
import {
  Activity,
  ActivityQuery,
  ActivityResponse,
} from "../types/profile.types";
import { ApiError, ErrorCode, SubscriptionTier } from "../types/common";
import { RedisCacheService } from "./session/RedisCacheService";

export class ActivityService {
  private activityRepository: ActivityRepository;

  constructor() {
    this.activityRepository = new ActivityRepository();
  }

  async getUserActivities(
    userId: string,
    query: ActivityQuery,
    userTier: SubscriptionTier
  ): Promise<ActivityResponse> {
    // Apply tier-based limits
    const limitedQuery = this.applyTierLimits(query, userTier);
    const cacheKey = `activities:${userId}:${JSON.stringify(limitedQuery)}`;

    try {
      // Try cache first for recent activities
      if (query.page === 1 && query.limit <= 10) {
        const cachedResult = await RedisCacheService.get(cacheKey);
        if (cachedResult) {
          return JSON.parse(cachedResult);
        }
      }

      const result = await this.activityRepository.getUserActivities(
        userId,
        limitedQuery
      );

      // Cache recent activities for 1 minute
      if (query.page === 1 && query.limit <= 10) {
        await RedisCacheService.set(cacheKey, JSON.stringify(result), 60);
      }

      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error("Error in getUserActivities:", error);
      throw new ApiError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to retrieve user activities",
        500,
        error
      );
    }
  }

  async createActivity(
    userId: string,
    type: string,
    message: string,
    earnCoin: number = 0,
    metadata?: Record<string, unknown>
  ): Promise<Activity> {
    try {
      // Validate activity type
      this.validateActivityType(type);

      const activity = await this.activityRepository.createActivity(
        userId,
        type,
        message,
        earnCoin,
        metadata
      );

      // Clear activity caches for this user
      await this.clearActivityCaches(userId);

      return activity;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error("Error in createActivity:", error);
      throw new ApiError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to create activity",
        500,
        error
      );
    }
  }

  async getActivityStats(
    userId: string,
    userTier: SubscriptionTier
  ): Promise<{
    totalActivities: number;
    totalCoinsEarned: number;
    activitiesByType: Record<string, number>;
    recentActivityCount: number;
    weeklyGrowth?: number;
    monthlyGrowth?: number;
  }> {
    const cacheKey = `activities:stats:${userId}`;

    try {
      const cachedStats = await RedisCacheService.get(cacheKey);
      if (cachedStats) {
        return JSON.parse(cachedStats);
      }

      const baseStats = await this.activityRepository.getActivityStats(userId);

      let enhancedStats = { ...baseStats };

      // Premium features - growth metrics
      if (userTier !== SubscriptionTier.FREE) {
        enhancedStats = await this.addGrowthMetrics(userId, baseStats);
      }

      // Cache for 5 minutes
      await RedisCacheService.set(cacheKey, JSON.stringify(enhancedStats), 300);

      return enhancedStats;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error("Error in getActivityStats:", error);
      throw new ApiError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to retrieve activity statistics",
        500,
        error
      );
    }
  }

  async getActivityInsights(
    userId: string,
    userTier: SubscriptionTier
  ): Promise<{
    streakData: { current: number; longest: number };
    mostActiveTime: string;
    preferredActivityTypes: string[];
    weeklyPattern: Record<string, number>;
  }> {
    if (userTier === SubscriptionTier.FREE) {
      throw new ApiError(
        ErrorCode.SUBSCRIPTION_REQUIRED,
        "Activity insights require a paid subscription",
        403
      );
    }

    const cacheKey = `activities:insights:${userId}`;

    try {
      const cachedInsights = await RedisCacheService.get(cacheKey);
      if (cachedInsights) {
        return JSON.parse(cachedInsights);
      }

      // This would require more complex queries - simplified for demo
      const insights = {
        streakData: { current: 7, longest: 15 }, // Would be calculated from actual data
        mostActiveTime: "Evening (6-9 PM)",
        preferredActivityTypes: ["Study", "Achievement", "Profile"],
        weeklyPattern: {
          Monday: 12,
          Tuesday: 8,
          Wednesday: 15,
          Thursday: 10,
          Friday: 6,
          Saturday: 4,
          Sunday: 5,
        },
      };

      // Cache for 1 hour
      await RedisCacheService.set(cacheKey, JSON.stringify(insights), 3600);

      return insights;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error("Error in getActivityInsights:", error);
      throw new ApiError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to retrieve activity insights",
        500,
        error
      );
    }
  }

  private applyTierLimits(
    query: ActivityQuery,
    userTier: SubscriptionTier
  ): ActivityQuery {
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

  private validateActivityType(type: string): void {
    const validTypes = ["Profile", "Mission", "Achievement", "Study", "System"];

    if (!validTypes.includes(type)) {
      throw new ApiError(
        ErrorCode.VALIDATION_ERROR,
        `Invalid activity type: ${type}`,
        400
      );
    }
  }

  private async addGrowthMetrics(userId: string, baseStats: any): Promise<any> {
    // This would involve complex date-based queries
    // Simplified implementation for demo
    return {
      ...baseStats,
      weeklyGrowth: 15.5, // % growth from last week
      monthlyGrowth: 42.3, // % growth from last month
    };
  }

  private async clearActivityCaches(userId: string): Promise<void> {
    try {
      await RedisCacheService.clearPattern(`activities:${userId}:*`);
      await RedisCacheService.clearPattern(`activities:stats:${userId}`);
      await RedisCacheService.clearPattern(`activities:insights:${userId}`);
    } catch (error) {
      console.warn("Failed to clear activity caches:", error);
    }
  }
}
