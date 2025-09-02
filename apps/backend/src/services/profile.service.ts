import { ProfileRepository } from "../repositories/profile.repository";
import { ActivityRepository } from "../repositories/activity.repository";
import { UserProfile, ProfileQuery } from "../types/profile.types";
import { ApiError, ErrorCode, SubscriptionTier } from "../types/common";
import { RedisCacheService } from "./session/RedisCacheService";
import redisService from "../lib/redis";

export class ProfileService {
  private profileRepository: ProfileRepository;
  private activityRepository: ActivityRepository;

  constructor() {
    this.profileRepository = new ProfileRepository();
    this.activityRepository = new ActivityRepository();
  }

  async getProfileByUsername(
    username: string,
    query: ProfileQuery,
    requesterId?: string
  ): Promise<UserProfile> {
    // Cache key for profile data
    const cacheKey = `profile:username:${username}:${JSON.stringify(query)}`;

    try {
      // Try to get from cache first
      const cachedProfile = await redisService.getJson<UserProfile>(cacheKey);
      if (cachedProfile) return cachedProfile;

      const profile = await this.profileRepository.getProfileByUsername(
        username,
        query
      );

      if (!profile) {
        throw new ApiError(ErrorCode.NOT_FOUND, "User profile not found", 404);
      }

      // Privacy controls - hide email/phone for non-self views
      if (requesterId !== profile.id) {
        profile.email = null;
        profile.phone = null;
      }

      // Cache the result for 5 minutes
      await redisService.setJson(cacheKey, profile, 300);

      return profile;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error("Error in getProfileByUsername:", error);
      throw new ApiError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to retrieve user profile",
        500,
        error
      );
    }
  }

  async getProfileById(
    userId: string,
    query: ProfileQuery,
    requesterId?: string
  ): Promise<UserProfile> {
    const cacheKey = `profile:id:${userId}:${JSON.stringify(query)}`;

    try {
      // Try to get from cache first
      const cachedProfile = await redisService.getJson<UserProfile>(cacheKey);
      if (cachedProfile) return cachedProfile;

      const profile = await this.profileRepository.getProfileById(
        userId,
        query
      );

      if (!profile) {
        throw new ApiError(ErrorCode.NOT_FOUND, "User profile not found", 404);
      }

      // Privacy controls - hide email/phone for non-self views
      if (requesterId !== profile.id) {
        profile.email = null;
        profile.phone = null;
      }

      // Cache the result for 5 minutes
      await redisService.setJson(cacheKey, profile, 300);

      return profile;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error("Error in getProfileById:", error);
      throw new ApiError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to retrieve user profile",
        500,
        error
      );
    }
  }

  async updateProfile(
    userId: string,
    updateData: Partial<UserProfile>,
    userTier: SubscriptionTier
  ): Promise<UserProfile> {
    try {
      // Validate update permissions based on subscription tier
      this.validateUpdatePermissions(updateData, userTier);

      const updatedProfile = await this.profileRepository.updateProfile(
        userId,
        updateData
      );

      // Create activity log for profile update
      await this.activityRepository.createActivity(
        userId,
        "Profile",
        "Profile information updated",
        5, // 5 coins for profile update
        { updateFields: Object.keys(updateData) }
      );

      // Clear relevant caches
      await this.clearProfileCaches(userId, updatedProfile.username!);

      return updatedProfile;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error("Error in updateProfile:", error);
      throw new ApiError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to update user profile",
        500,
        error
      );
    }
  }

  private validateUpdatePermissions(
    updateData: Partial<UserProfile>,
    userTier: SubscriptionTier
  ): void {
    // Premium features validation
    const premiumFields = ["studyHoursPerDay"];
    const hasPremiumFields = premiumFields.some((field) => field in updateData);

    if (hasPremiumFields && userTier === SubscriptionTier.FREE) {
      throw new ApiError(
        ErrorCode.SUBSCRIPTION_REQUIRED,
        "Premium subscription required to update study hours",
        403
      );
    }

    // Validate data constraints
    if (updateData.studyHoursPerDay !== undefined) {
      if (updateData.studyHoursPerDay < 1 || updateData.studyHoursPerDay > 24) {
        throw new ApiError(
          ErrorCode.VALIDATION_ERROR,
          "Study hours per day must be between 1 and 24",
          400
        );
      }
    }
  }

  private async clearProfileCaches(
    userId: string,
    username: string
  ): Promise<void> {
    try {
      // Invalidate known caches (pattern delete not supported in Upstash REST reliably)
      await RedisCacheService.invalidateUserCache(userId);
    } catch (error) {
      // Cache clearing failure shouldn't break the operation
      console.warn("Failed to clear profile caches:", error);
    }
  }
}
