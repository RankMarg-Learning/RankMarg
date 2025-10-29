import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import prisma from "@repo/db";
import { NextFunction, Response } from "express";
import { SubscriptionStatus } from "@repo/db/enums";

export class SettingController {
  /**
   * Check if user has active subscription (paid user) using req.user.plan
   * This is more efficient than querying the database since the plan info
   * is already available in the authenticated user object from JWT token
   */
  private checkSubscriptionStatus(user: any): boolean {
    if (!user || !user.plan) {
      console.log('Settings access denied: No user or plan data');
       false;
    }

    const { plan } = user;
    
    // Check if user has a plan ID (indicates they have a subscription)
    if (!plan.id) {
      console.log('Settings access denied: No plan ID');
       return false;
    }

    // Check if subscription is active or trial
    const isActive = plan.status === SubscriptionStatus.ACTIVE;
    const isTrial = plan.status === SubscriptionStatus.TRIAL;
    
    // Check if subscription is not expired
    const isNotExpired = plan.endAt ? new Date(plan.endAt) > new Date() : false;

    const hasValidSubscription = (isActive || isTrial) && isNotExpired;
    
    if (!hasValidSubscription) {
      console.log(`Settings access denied: Plan status=${plan.status}, endAt=${plan.endAt}, isNotExpired=${isNotExpired}`);
    }

     return hasValidSubscription;
  }

  /**
   * Get user settings (questionsPerDay and isActive)
   */
  getUserSettings = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
         ResponseUtil.error(res, "User not authenticated", 401);
      }

      // Check if user has active subscription
      const hasActiveSubscription = this.checkSubscriptionStatus(req.user);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          questionsPerDay: true,
          isActive: true,
          name: true,
          email: true,
        },
      });

      if (!user) {
         ResponseUtil.error(res, "User not found", 404);
      }

      // For non-subscribed users, only return isActive and basic user info
      if (!hasActiveSubscription) {
        const settings = {
          questionsPerDay: 5, // Default value for non-subscribed users
          isActive: user.isActive,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          subscriptionRequired: true,
        };

         ResponseUtil.success(
          res,
          settings,
          "User settings retrieved successfully (limited access)"
        );
        return;
      }

      // For subscribed users, return all settings
      const settings = {
        questionsPerDay: user.questionsPerDay,
        isActive: user.isActive,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        subscriptionRequired: false,
      };

       ResponseUtil.success(
        res,
        settings,
        "User settings retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user settings (questionsPerDay and isActive)
   */
  updateUserSettings = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
      const { questionsPerDay, isActive } = req.body;

      if (!userId) {
         ResponseUtil.error(res, "User not authenticated", 401);
      }

      // Check if user has active subscription (only required for questionsPerDay)
      const hasActiveSubscription = this.checkSubscriptionStatus(req.user);
      if (questionsPerDay !== undefined && !hasActiveSubscription) {
         ResponseUtil.error(
          res,
          "Active subscription required to update questions per day. Please upgrade your plan.",
          403
        );
      }

      // Validation
      if (questionsPerDay !== undefined) {
        if (!Number.isInteger(questionsPerDay) || questionsPerDay < 1) {
           ResponseUtil.error(
            res,
            "questionsPerDay must be a positive integer",
            400
          );
        }
        if (questionsPerDay > 50) {
           ResponseUtil.error(
            res,
            "questionsPerDay cannot exceed 50",
            400
          );
        }
      }

      if (isActive !== undefined && typeof isActive !== "boolean") {
         ResponseUtil.error(
          res,
          "isActive must be a boolean value",
          400
        );
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
         ResponseUtil.error(res, "User not found", 404);
      }

      // Prepare update data
      const updateData: any = {};
      if (questionsPerDay !== undefined) {
        updateData.questionsPerDay = questionsPerDay;
      }
      if (isActive !== undefined) {
        updateData.isActive = isActive;
      }

      // Update user settings
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          questionsPerDay: true,
          isActive: true,
          name: true,
          email: true,
          updatedAt: true,
        },
      });

      const settings = {
        questionsPerDay: updatedUser.questionsPerDay,
        isActive: updatedUser.isActive,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
        },
        updatedAt: updatedUser.updatedAt,
      };

       ResponseUtil.success(
        res,
        settings,
        "User settings updated successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get specific setting value
   */
  getSetting = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
      const { settingName } = req.params;

      if (!userId) {
         ResponseUtil.error(res, "User not authenticated", 401);
      }

      // Check if user has active subscription (only required for questionsPerDay)
      const hasActiveSubscription = this.checkSubscriptionStatus(req.user);
      if (settingName === "questionsPerDay" && !hasActiveSubscription) {
         ResponseUtil.error(
          res,
          "Active subscription required to access questions per day setting. Please upgrade your plan.",
          403
        );
      }

      const validSettings = ["questionsPerDay", "isActive"];
      if (!validSettings.includes(settingName)) {
         ResponseUtil.error(
          res,
          `Invalid setting name. Valid settings: ${validSettings.join(", ")}`,
          400
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          [settingName]: true,
        },
      });

      if (!user) {
         ResponseUtil.error(res, "User not found", 404);
      }

      const setting = {
        settingName,
        value: user[settingName as keyof typeof user],
      };

       ResponseUtil.success(
        res,
        setting,
        `${settingName} retrieved successfully`
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update specific setting value
   */
  updateSetting = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
      const { settingName } = req.params;
      const { value } = req.body;

      if (!userId) {
         ResponseUtil.error(res, "User not authenticated", 401);
      }

      // Check if user has active subscription (only required for questionsPerDay)
      const hasActiveSubscription = this.checkSubscriptionStatus(req.user);
      if (settingName === "questionsPerDay" && !hasActiveSubscription) {
         ResponseUtil.error(
          res,
          "Active subscription required to update questions per day. Please upgrade your plan.",
          403
        );
      }

      const validSettings = ["questionsPerDay", "isActive"];
      if (!validSettings.includes(settingName)) {
         ResponseUtil.error(
          res,
          `Invalid setting name. Valid settings: ${validSettings.join(", ")}`,
          400
        );
      }

      // Validation based on setting type
      if (settingName === "questionsPerDay") {
        if (!Number.isInteger(value) || value < 1) {
           ResponseUtil.error(
            res,
            "questionsPerDay must be a positive integer",
            400
          );
        }
        if (value > 50) {
           ResponseUtil.error(
            res,
            "questionsPerDay cannot exceed 50",
            400
          );
        }
      } else if (settingName === "isActive") {
        if (typeof value !== "boolean") {
           ResponseUtil.error(
            res,
            "isActive must be a boolean value",
            400
          );
        }
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
         ResponseUtil.error(res, "User not found", 404);
      }

      // Update specific setting
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          [settingName]: value,
        },
        select: {
          id: true,
          [settingName]: true,
          updatedAt: true,
        },
      });

      const setting = {
        settingName,
        value: updatedUser[settingName as keyof typeof updatedUser],
        updatedAt: updatedUser.updatedAt,
      };

       ResponseUtil.success(
        res,
        setting,
        `${settingName} updated successfully`
      );
    } catch (error) {
      next(error);
    }
  };
}
