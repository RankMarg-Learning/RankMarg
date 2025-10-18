import prisma from "@/lib/prisma";
import { getDayWindow } from "@/lib/dayRange";
import { ResponseUtil } from "@/utils/response.util";
import { GradeEnum, SubscriptionStatus } from "@repo/db/enums";
import { Response, Request } from "express";
import { StudentGradeService } from "@/services/grade.service";

export class UserActivityController {
  /**
   * Mark users as inactive if their last solvedAt date is more than 14 days ago
   * This method is called by the cron job daily at 3 AM
   */
  public updateIsActive = async (req: Request, res: Response) => {
    try {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const inactiveUsers = await prisma.user.findMany({
        where: {
          isActive: true,
          attempts: {
            none: {
              solvedAt: {
                gte: fourteenDaysAgo,
              },
            },
          },
        },
        select: {
          id: true,
        },
      });

      if (inactiveUsers.length > 0) {
        const userIds = inactiveUsers.map((user) => user.id);

        await prisma.user.updateMany({
          where: {
            id: {
              in: userIds,
            },
          },
          data: {
            isActive: false,
          },
        });

        console.log(
          `[UserActivity] Marked ${inactiveUsers.length} users as inactive:`,
          inactiveUsers.map((u) => ({ id: u.id }))
        );
      }

      ResponseUtil.success(
        res,
        {
          inactiveUsersCount: inactiveUsers.length,
          inactiveUsers: inactiveUsers.map((u) => ({
            id: u.id,
          })),
        },
        "User activity updated successfully",
        200
      );
    } catch (error) {
      console.error("[Update Is Active Error]:", error);
      ResponseUtil.error(res, "Internal Server Error", 500);
    }
  };

  /**
   * Mark a user as active when they solve a question
   * This method is called when an attempt is created
   */
  public static async markUserAsActive(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
      });
    } catch (error) {
      console.error(`[Mark User Active Error] for user ${userId}:`, error);
    }
  }

  /**
   * Check if the subscription is expired and mark the user as inactive
   * This method is called by the cron job everyday at 11:50 PM
   */
  public subscriptionExpired = async (req: Request, res: Response) => {
    try {
      const subscription = await prisma.subscription.updateMany({
        where: {
          currentPeriodEnd: {
            lt: new Date(),
          },
        },
        data: {
          status: SubscriptionStatus.EXPIRED,
        },
      });

      ResponseUtil.success(
        res,
        {
          subscriptionExpiredCount: subscription.count,
        },
        "Subscription expired successfully",
        200
      );
    } catch (error) {
      console.error("[Subscription Expired Error]:", error);
      ResponseUtil.error(res, "Internal Server Error", 500);
    }
  };

  public resetStreak = async (req: Request, res: Response) => {
    try {
      const { from, to } =
        req.body?.from && req.body?.to
          ? { from: new Date(req.body.from), to: new Date(req.body.to) }
          : getDayWindow();

      if (from >= to) {
        console.error("Invalid date range: from >= to");
        return ResponseUtil.error(res, "Invalid date range", 400);
      }

      const [incrementResult, resetResult] = await Promise.all([
        prisma.$executeRaw`
          UPDATE "UserPerformance" 
          SET "streak" = "streak" + 1, "updatedAt" = NOW()
          WHERE "userId" IN (
            SELECT DISTINCT "userId" 
            FROM "Attempt" 
            WHERE "solvedAt" >= now() - INTERVAL '1 day'
              AND "solvedAt" < now()
              AND "userId" IS NOT NULL
          )
        `,
        prisma.$executeRaw`
          UPDATE "UserPerformance" 
          SET "streak" = 0, "updatedAt" = NOW()
          WHERE "userId" NOT IN (
            SELECT DISTINCT "userId" 
            FROM "Attempt" 
            WHERE "solvedAt" >= now() - INTERVAL '1 day'
              AND "solvedAt" < now()
              AND "userId" IS NOT NULL
          )
          AND "streak" > 0
        `,
      ]);

      ResponseUtil.success(
        res,
        {
          streaksIncremented: incrementResult,
          streaksReset: resetResult,
          totalProcessed: incrementResult + resetResult,
          dateRange: { from, to },
        },
        "Streak management completed successfully",
        200
      );
    } catch (error) {
      console.error("[Streak Management Error]:", error);
      ResponseUtil.error(res, "Internal Server Error", 500);
    }
  };

  public updatePromoCode = async (req: Request, res: Response) => {
    try {
      const subscriptions = await prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
        },
        select: {
          promoCodeUsed: true,
        }
      });
      const promoCodes = await prisma.promoCode.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          currentUsageCount: true,
        }
      });
      for (const subscription of subscriptions) {
        const promoCode = promoCodes.find(promoCode => promoCode.id === subscription.promoCodeUsed);
        if (promoCode) {
          await prisma.promoCode.update({
            where: { id: promoCode.id },
            data: { currentUsageCount: promoCode.currentUsageCount + 1 },
          });
        }
      }
    } catch (error) {
      console.error("[Update Promo Code Error]:", error);
      ResponseUtil.error(res, "Internal Server Error", 500);
    }
  }
}
