import prisma from "@repo/db";
import { Request, Response, NextFunction } from "express";
import { ResponseUtil } from "@/utils/response.util";
import { SubscriptionStatus, PaymentProvider } from "@repo/db/enums";

export class AdminSubscriptionController {
  /**
   * Assign a subscription to a user by userId, username, or email
   */
  assignSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId, username, email, planId, duration, status } = req.body;

      // Find user by one of the identifiers
      let user;
      if (userId) {
        user = await prisma.user.findUnique({ where: { id: userId } });
      } else if (username) {
        user = await prisma.user.findUnique({ where: { username } });
      } else if (email) {
        user = await prisma.user.findUnique({ where: { email } });
      } else {
        ResponseUtil.error(res, "Please provide userId, username, or email", 400);
        return;
      }

      if (!user) {
        ResponseUtil.error(res, "User not found", 404);
        return;
      }

      // Get plan if planId is provided
      let plan;
      if (planId) {
        plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) {
          ResponseUtil.error(res, "Plan not found", 404);
          return;
        }
      }

      // Check if user already has a subscription
      const existingSubscription = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      // Calculate end date based on duration
      let periodEnd;
      if (duration) {
        if (existingSubscription && existingSubscription.currentPeriodEnd && existingSubscription.currentPeriodEnd > new Date()) {
          // Extend from existing end date
          periodEnd = new Date(existingSubscription.currentPeriodEnd.getTime() + duration * 24 * 60 * 60 * 1000);
        } else {
          // Start from now
          periodEnd = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
        }
      } else {
        // Default 30 days
        periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }

      let subscription;
      if (existingSubscription) {
        // Update existing subscription
        subscription = await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            planId: plan?.id || existingSubscription.planId,
            duration: duration || plan?.duration || existingSubscription.duration,
            status: status || "ACTIVE",
            amount:  existingSubscription.amount || 0,
            currentPeriodEnd: periodEnd,
            updatedAt: new Date(),
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
              },
            },
            plan: true,
          },
        });
      } else {
        // Create new subscription
        subscription = await prisma.subscription.create({
          data: {
            userId: user.id,
            planId: plan?.id || null,
            duration: duration || plan?.duration || 30,
            status: status || "ACTIVE",
            provider: PaymentProvider.PLATFORM,
            amount: 0,
            currentPeriodEnd: periodEnd,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
              },
            },
            plan: true,
          },
        });
      }

      ResponseUtil.success(
        res,
        subscription,
        "Subscription assigned successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all user subscriptions with filters
   */
  getSubscriptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { status, search, page = "1", limit = "50" } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const take = parseInt(limit as string);

      const whereClause: any = {};

      if (status) {
        whereClause.status = status;
      }

      if (search) {
        whereClause.OR = [
          {
            user: {
              name: { contains: search as string, mode: "insensitive" },
            },
          },
          {
            user: {
              email: { contains: search as string, mode: "insensitive" },
            },
          },
          {
            user: {
              username: { contains: search as string, mode: "insensitive" },
            },
          },
        ];
      }

      const [subscriptions, total] = await Promise.all([
        prisma.subscription.findMany({
          where: whereClause,
          skip,
          take,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                avatar: true,
              },
            },
            plan: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.subscription.count({ where: whereClause }),
      ]);

      ResponseUtil.success(
        res,
        {
          subscriptions,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            totalPages: Math.ceil(total / take),
          },
        },
        "Subscriptions fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a specific user's subscription
   */
  getUserSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId, username, email } = req.query;

      // Find user by one of the identifiers
      let user;
      if (userId) {
        user = await prisma.user.findUnique({ where: { id: userId as string } });
      } else if (username) {
        user = await prisma.user.findUnique({
          where: { username: username as string },
        });
      } else if (email) {
        user = await prisma.user.findUnique({ where: { email: email as string } });
      } else {
        ResponseUtil.error(res, "Please provide userId, username, or email", 400);
        return;
      }

      if (!user) {
        ResponseUtil.error(res, "User not found", 404);
        return;
      }

      const subscription = await prisma.subscription.findUnique({
        where: { userId: user.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              avatar: true,
            },
          },
          plan: true,
        },
      });

      if (!subscription) {
        ResponseUtil.error(res, "Subscription not found", 404);
        return;
      }

      ResponseUtil.success(
        res,
        subscription,
        "Subscription fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update subscription status or extend duration
   */
  updateSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId, username, email } = req.query;
      const { status, duration, planId } = req.body;

      // Find user by one of the identifiers
      let user;
      if (userId) {
        user = await prisma.user.findUnique({ where: { id: userId as string } });
      } else if (username) {
        user = await prisma.user.findUnique({
          where: { username: username as string },
        });
      } else if (email) {
        user = await prisma.user.findUnique({ where: { email: email as string } });
      } else {
        ResponseUtil.error(res, "Please provide userId, username, or email", 400);
        return;
      }

      if (!user) {
        ResponseUtil.error(res, "User not found", 404);
        return;
      }

      const existingSubscription = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      if (!existingSubscription) {
        ResponseUtil.error(res, "Subscription not found", 404);
        return;
      }

      // Get plan if planId is provided
      let plan;
      if (planId) {
        plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) {
          ResponseUtil.error(res, "Plan not found", 404);
          return;
        }
      }

      // Calculate new end date if duration is provided
      let newPeriodEnd = existingSubscription.currentPeriodEnd;
      if (duration) {
        newPeriodEnd = new Date(
          existingSubscription.currentPeriodEnd || Date.now() + duration * 24 * 60 * 60 * 1000
        );
        // If extending, add to existing date; if setting new duration, calculate from now
        if (newPeriodEnd > new Date()) {
          // Extending existing subscription
          newPeriodEnd = new Date(
            (existingSubscription.currentPeriodEnd?.getTime() || Date.now()) +
              duration * 24 * 60 * 60 * 1000
          );
        } else {
          // Setting new duration from now
          newPeriodEnd = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
        }
      }

      const updatedSubscription = await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          ...(status && { status }),
          ...(duration && { duration }),
          ...(planId && { planId }),
          ...(plan && { amount: plan.amount }),
          ...(duration && { currentPeriodEnd: newPeriodEnd }),
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              avatar: true,
            },
          },
          plan: true,
        },
      });

      ResponseUtil.success(
        res,
        updatedSubscription,
        "Subscription updated successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cancel or delete a subscription
   */
  cancelSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId, username, email } = req.query;

      // Find user by one of the identifiers
      let user;
      if (userId) {
        user = await prisma.user.findUnique({ where: { id: userId as string } });
      } else if (username) {
        user = await prisma.user.findUnique({
          where: { username: username as string },
        });
      } else if (email) {
        user = await prisma.user.findUnique({ where: { email: email as string } });
      } else {
        ResponseUtil.error(res, "Please provide userId, username, or email", 400);
        return;
      }

      if (!user) {
        ResponseUtil.error(res, "User not found", 404);
        return;
      }

      const existingSubscription = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      if (!existingSubscription) {
        ResponseUtil.error(res, "Subscription not found", 404);
        return;
      }

      // Update subscription to CANCELLED status instead of deleting
      const cancelledSubscription = await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          status: SubscriptionStatus.CANCELLED,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
            },
          },
          plan: true,
        },
      });

      ResponseUtil.success(
        res,
        cancelledSubscription,
        "Subscription cancelled successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get subscription statistics
   */
  getStatistics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { startDate, endDate } = req.query;

      const whereClause: any = {};

      // Add date filter if provided
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) {
          whereClause.createdAt.gte = new Date(startDate as string);
        }
        if (endDate) {
          whereClause.createdAt.lte = new Date(endDate as string);
        }
      }

      // Count subscriptions by status
      const [trialCount, activeCount, cancelledCount, expiredCount, totalRevenue] = await Promise.all([
        prisma.subscription.count({
          where: { ...whereClause, status: SubscriptionStatus.TRIAL },
        }),
        prisma.subscription.count({
          where: { ...whereClause, status: SubscriptionStatus.ACTIVE },
        }),
        prisma.subscription.count({
          where: { ...whereClause, status: SubscriptionStatus.CANCELLED },
        }),
        prisma.subscription.count({
          where: { ...whereClause, status: SubscriptionStatus.EXPIRED },
        }),
        prisma.subscription.aggregate({
          where: {
            ...whereClause,
            status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.EXPIRED] },
          },
          _sum: {
            amount: true,
          },
        }),
      ]);

      const totalUsers = trialCount + activeCount;
      const paidUsers = activeCount;

      ResponseUtil.success(
        res,
        {
          trialUsers: trialCount,
          paidUsers: paidUsers,
          totalUsers: totalUsers,
          cancelledUsers: cancelledCount,
          expiredUsers: expiredCount,
          totalEarnings: totalRevenue._sum.amount || 0,
        },
        "Statistics fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };
}

