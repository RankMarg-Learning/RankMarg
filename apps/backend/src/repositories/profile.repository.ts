import { BaseRepository } from "./base.repository";
import { UserProfile, ProfileQuery } from "../types/profile.types";
import { ApiError, ErrorCode } from "../types/common";

export class ProfileRepository extends BaseRepository {
  protected getTableName(): string {
    return "user";
  }

  async getProfileByUsername(
    username: string,
    query: ProfileQuery
  ): Promise<UserProfile | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          avatar: true,
          phone: true,
          location: true,
          standard: true,
          targetYear: true,
          coins: true,
          studyHoursPerDay: true,
          createdAt: true,
          ...(query.includePerformance && {
            userPerformance: {
              select: {
                accuracy: true,
                streak: true,
                avgScore: true,
                totalAttempts: true,
                subjectWiseAccuracy: true,
              },
            },
          }),
          ...(query.includeSubscription && {
            subscription: {
              select: {
                planId: true,
                status: true,
                currentPeriodEnd: true,
              },
            },
          }),
        },
      });

      if (!user) {
        return null;
      }

      return {
        ...user,
        userPerformance: user.userPerformance || null,
        subscription: user.subscription
          ? {
              ...user.subscription,
              tier: this.mapPlanIdToTier(user.subscription.planId),
            }
          : null,
      } as unknown as UserProfile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw new ApiError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to fetch user profile",
        500,
        error
      );
    }
  }

  async getProfileById(
    userId: string,
    query: ProfileQuery
  ): Promise<UserProfile | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          avatar: true,
          phone: true,
          location: true,
          standard: true,
          targetYear: true,
          coins: true,
          studyHoursPerDay: true,
          createdAt: true,
          ...(query.includePerformance && {
            userPerformance: {
              select: {
                accuracy: true,
                streak: true,
                avgScore: true,
                totalAttempts: true,
                subjectWiseAccuracy: true,
              },
            },
          }),
          ...(query.includeSubscription && {
            subscription: {
              select: {
                planId: true,
                status: true,
                currentPeriodEnd: true,
              },
            },
          }),
        },
      });

      if (!user) {
        return null;
      }

      return {
        ...user,
        userPerformance: user.userPerformance || null,
        subscription: user.subscription
          ? {
              ...user.subscription,
              tier: this.mapPlanIdToTier(user.subscription.planId),
            }
          : null,
      } as unknown as UserProfile;
    } catch (error) {
      console.error("Error fetching profile by ID:", error);
      throw new ApiError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to fetch user profile",
        500,
        error
      );
    }
  }

  async updateProfile(
    userId: string,
    updateData: Partial<UserProfile>
  ): Promise<UserProfile> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(updateData.name !== undefined && { name: updateData.name }),
          ...(updateData.avatar !== undefined && { avatar: updateData.avatar }),
          ...(updateData.phone !== undefined && { phone: updateData.phone }),
          ...(updateData.location !== undefined && {
            location: updateData.location,
          }),
          ...(updateData.standard !== undefined && {
            standard: updateData.standard,
          }),
          ...(updateData.targetYear !== undefined && {
            targetYear: Number(updateData.targetYear),
          }),
          ...(updateData.studyHoursPerDay !== undefined && {
            studyHoursPerDay: updateData.studyHoursPerDay,
          }),
        },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          avatar: true,
          phone: true,
          location: true,
          standard: true,
          targetYear: true,
          coins: true,
          studyHoursPerDay: true,
          createdAt: true,
          userPerformance: {
            select: {
              accuracy: true,
              streak: true,
              avgScore: true,
              totalAttempts: true,
              subjectWiseAccuracy: true,
            },
          },
        },
      });

      return updatedUser as unknown as UserProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw new ApiError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to update user profile",
        500,
        error
      );
    }
  }

  private mapPlanIdToTier(planId: string | null): string {
    switch (planId) {
      case "basic":
        return "BASIC";
      case "premium":
        return "PREMIUM";
      case "enterprise":
        return "ENTERPRISE";
      default:
        return "FREE";
    }
  }
}
