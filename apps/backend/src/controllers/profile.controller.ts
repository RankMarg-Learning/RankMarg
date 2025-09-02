import { Response, NextFunction } from "express";
import { ProfileService } from "../services/profile.service";
import { CurriculumService } from "../services/curriculum.service";
import { ActivityService } from "../services/activity.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ValidatedRequest } from "../middleware/validation.middleware";
import {
  ProfileQuery,
  CurrentStudiesQuery,
  ActivityQuery,
} from "../types/profile.types";
import { ResponseUtil } from "../utils/response.util";
import { ApiError, ErrorCode } from "../types/common";

export class ProfileController {
  private profileService: ProfileService;
  private curriculumService: CurriculumService;
  private activityService: ActivityService;

  constructor() {
    this.profileService = new ProfileService();
    this.curriculumService = new CurriculumService();
    this.activityService = new ActivityService();
  }

  getProfileByUsername = async (
    req: ValidatedRequest<ProfileQuery, any, { username: string }> &
      AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { username } = req.validatedParams!;
      const query = req.validatedQuery!;
      const requesterId = req.user?.id;

      const profile = await this.profileService.getProfileByUsername(
        username,
        query,
        requesterId
      );

      ResponseUtil.cached(
        res,
        profile,
        "Profile retrieved successfully",
        300, // 5 minutes cache
        60 // 1 minute stale-while-revalidate
      );
    } catch (error) {
      next(error);
    }
  };

  getMyProfile = async (
    req: ValidatedRequest<ProfileQuery> & AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const query = req.validatedQuery!;

      const profile = await this.profileService.getProfileById(
        userId,
        { ...query, includeSubscription: true }, // Always include subscription for own profile
        userId
      );

      ResponseUtil.success(res, profile, "Your profile retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (
    req: ValidatedRequest<any, Partial<any>> & AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const userTier = req.user!.subscriptionTier;
      const updateData = req.validatedBody!;

      const updatedProfile = await this.profileService.updateProfile(
        userId,
        updateData,
        userTier
      );

      ResponseUtil.updated(res, updatedProfile, "Profile updated successfully");
    } catch (error) {
      next(error);
    }
  };

  getCurrentStudies = async (
    req: ValidatedRequest<CurrentStudiesQuery> & AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const userTier = req.user!.subscriptionTier;
      const query = req.validatedQuery!;

      const result = await this.curriculumService.getCurrentStudies(
        userId,
        query,
        userTier
      );

      if (result.pagination) {
        ResponseUtil.paginated(
          res,
          result.data,
          result.pagination,
          "Current studies retrieved successfully"
        );
      }

      ResponseUtil.cached(
        res,
        result.data,
        "Current studies retrieved successfully",
        120, // 2 minutes cache
        30 // 30 seconds stale-while-revalidate
      );
    } catch (error) {
      next(error);
    }
  };

  startStudyTopic = async (
    req: ValidatedRequest<any, { subjectId: number; topicId: number }> &
      AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const userTier = req.user!.subscriptionTier;
      const { subjectId, topicId } = req.validatedBody!;

      const studyTopic = await this.curriculumService.startStudyTopic(
        userId,
        subjectId,
        topicId,
        userTier
      );

      ResponseUtil.created(res, studyTopic, "Study topic started successfully");
    } catch (error) {
      next(error);
    }
  };

  updateStudyTopic = async (
    req: ValidatedRequest<any, Partial<any>, { studyTopicId: string }> &
      AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { studyTopicId } = req.validatedParams!;
      const updateData = req.validatedBody!;

      const updatedTopic = await this.curriculumService.updateStudyTopic(
        userId,
        studyTopicId,
        updateData
      );

      ResponseUtil.updated(
        res,
        updatedTopic,
        "Study topic updated successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  getUserActivities = async (
    req: ValidatedRequest<ActivityQuery> & AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const userTier = req.user!.subscriptionTier;
      const query = req.validatedQuery!;

      const activities = await this.activityService.getUserActivities(
        userId,
        query,
        userTier
      );

      ResponseUtil.paginated(
        res,
        activities.activities,
        {
          currentPage: activities.pagination.page,
          totalPages: activities.pagination.pages,
          totalItems: activities.pagination.total,
          itemsPerPage: activities.pagination.limit,
          hasNextPage: activities.pagination.page < activities.pagination.pages,
          hasPreviousPage: activities.pagination.page > 1,
        },
        "Activities retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  getActivityStats = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const userTier = req.user!.subscriptionTier;

      const stats = await this.activityService.getActivityStats(
        userId,
        userTier
      );

      ResponseUtil.cached(
        res,
        stats,
        "Activity statistics retrieved successfully",
        300, // 5 minutes cache
        60 // 1 minute stale-while-revalidate
      );
    } catch (error) {
      next(error);
    }
  };

  getActivityInsights = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const userTier = req.user!.subscriptionTier;

      const insights = await this.activityService.getActivityInsights(
        userId,
        userTier
      );

      ResponseUtil.cached(
        res,
        insights,
        "Activity insights retrieved successfully",
        3600, // 1 hour cache
        300 // 5 minutes stale-while-revalidate
      );
    } catch (error) {
      next(error);
    }
  };

  getStudyStats = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;

      const stats = await this.curriculumService.getStudyStats(userId);

      ResponseUtil.cached(
        res,
        stats,
        "Study statistics retrieved successfully",
        600, // 10 minutes cache
        120 // 2 minutes stale-while-revalidate
      );
    } catch (error) {
      next(error);
    }
  };
}
