import prisma from "@/lib/prisma";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import { SubscriptionStatus } from "@repo/db/enums";
import { NextFunction, Response } from "express";

interface RevisionScheduleItem {
  id: string;
  topicId: string;
  topicName: string;
  topicSlug?: string;
  subjectId: string;
  subjectName: string;
  lastReviewedAt: Date;
  nextReviewAt: Date;
  reviewInterval: number | null;
  retentionStrength: number;
  completedReviews: number;
  masteryLevel: number;
  strengthIndex: number;
  isOverdue: boolean;
  daysUntilReview: number;
  daysOverdue: number;
}

interface RevisionStatistics {
  totalScheduled: number;
  dueToday: number;
  overdue: number;
  upcoming: number;
  completedThisWeek: number;
  averageRetentionStrength: number;
  subjects: Array<{
    subjectId: string;
    subjectName: string;
    dueCount: number;
    totalCount: number;
  }>;
}

export class RevisionController {
  /**
   * Get all revision schedules for the authenticated user
   * Filters by due date, subject, and status
   */
  getRevisionSchedule = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const plan = req.user.plan;

      // Check subscription
      if (
        plan.status === SubscriptionStatus.EXPIRED ||
        new Date(plan.endAt) < new Date()
      ) {
        ResponseUtil.error(
          res,
          "Your subscription has expired. Please upgrade to access Revision Schedule.",
          403
        );
        return;
      }

      const now = new Date();
      const filter = req.query.filter as string; // 'all' | 'due' | 'overdue' | 'upcoming'
      const subjectId = req.query.subjectId as string | undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 50;
      const offset = req.query.offset
        ? parseInt(req.query.offset as string, 10)
        : 0;

      // Build where clause
      const where: any = {
        userId,
        ...(subjectId && {
          topicMastery: {
            topic: {
              subjectId,
            },
          },
        }),
      };

      // Apply date filters
      if (filter === "due") {
        where.nextReviewAt = {
          lte: now,
        };
      } else if (filter === "overdue") {
        where.nextReviewAt = {
          lt: now,
        };
      } else if (filter === "upcoming") {
        where.nextReviewAt = {
          gt: now,
        };
      }

      const [revisionSchedules, total] = await Promise.all([
        prisma.reviewSchedule.findMany({
          where,
          include: {
            topicMastery: {
              include: {
                topic: {
                  include: {
                    subject: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: [
            { nextReviewAt: "asc" }, // Due items first
            { retentionStrength: "asc" }, // Lower retention = higher priority
          ],
          take: limit,
          skip: offset,
        }),
        prisma.reviewSchedule.count({ where }),
      ]);

      const items: RevisionScheduleItem[] = revisionSchedules.map((schedule) => {
        const nextReviewDate = new Date(schedule.nextReviewAt);
        const daysUntilReview = Math.ceil(
          (nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        const isOverdue = nextReviewDate < now;
        const daysOverdue = isOverdue
          ? Math.ceil((now.getTime() - nextReviewDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        return {
          id: schedule.id,
          topicId: schedule.topicId,
          topicName: schedule.topicMastery.topic.name,
          topicSlug: schedule.topicMastery.topic.slug || undefined,
          subjectId: schedule.topicMastery.topic.subject.id,
          subjectName: schedule.topicMastery.topic.subject.name,
          lastReviewedAt: schedule.lastReviewedAt,
          nextReviewAt: schedule.nextReviewAt,
          reviewInterval: schedule.reviewInterval,
          retentionStrength: schedule.retentionStrength,
          completedReviews: schedule.completedReviews,
          masteryLevel: schedule.topicMastery.masteryLevel,
          strengthIndex: schedule.topicMastery.strengthIndex,
          isOverdue,
          daysUntilReview,
          daysOverdue,
        };
      });

      ResponseUtil.success(
        res,
        {
          items,
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
        "Revision schedule retrieved successfully",
        200,
        undefined,
        {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=60",
          Vary: "Authorization",
        }
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get revision statistics for the authenticated user
   */
  getRevisionStatistics = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const plan = req.user.plan;

      if (
        plan.status === SubscriptionStatus.EXPIRED ||
        new Date(plan.endAt) < new Date()
      ) {
        ResponseUtil.error(
          res,
          "Your subscription has expired. Please upgrade to access Revision Statistics.",
          403
        );
        return;
      }

      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date(startOfToday);
      endOfToday.setHours(23, 59, 59, 999);

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const [
        allSchedules,
        dueTodaySchedules,
        overdueSchedules,
        upcomingSchedules,
        completedThisWeek,
      ] = await Promise.all([
        prisma.reviewSchedule.findMany({
          where: { userId },
          include: {
            topicMastery: {
              include: {
                topic: {
                  include: {
                    subject: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        prisma.reviewSchedule.count({
          where: {
            userId,
            nextReviewAt: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        }),
        prisma.reviewSchedule.count({
          where: {
            userId,
            nextReviewAt: {
              lt: now,
            },
          },
        }),
        prisma.reviewSchedule.count({
          where: {
            userId,
            nextReviewAt: {
              gt: now,
            },
          },
        }),
        prisma.reviewSchedule.count({
          where: {
            userId,
            lastReviewedAt: {
              gte: startOfWeek,
            },
          },
        }),
      ]);

      // Calculate average retention strength
      const avgRetentionStrength =
        allSchedules.length > 0
          ? allSchedules.reduce(
              (sum, s) => sum + s.retentionStrength,
              0
            ) / allSchedules.length
          : 0;

      // Group by subject
      const subjectMap = new Map<
        string,
        { subjectId: string; subjectName: string; dueCount: number; totalCount: number }
      >();

      allSchedules.forEach((schedule) => {
        const subjectId = schedule.topicMastery.topic.subject.id;
        const subjectName = schedule.topicMastery.topic.subject.name;
        const isDue = new Date(schedule.nextReviewAt) <= now;

        if (!subjectMap.has(subjectId)) {
          subjectMap.set(subjectId, {
            subjectId,
            subjectName,
            dueCount: 0,
            totalCount: 0,
          });
        }

        const subject = subjectMap.get(subjectId)!;
        subject.totalCount++;
        if (isDue) {
          subject.dueCount++;
        }
      });

      const statistics: RevisionStatistics = {
        totalScheduled: allSchedules.length,
        dueToday: dueTodaySchedules,
        overdue: overdueSchedules,
        upcoming: upcomingSchedules,
        completedThisWeek,
        averageRetentionStrength: Math.round(avgRetentionStrength * 100) / 100,
        subjects: Array.from(subjectMap.values()),
      };

      ResponseUtil.success(
        res,
        statistics,
        "Revision statistics retrieved successfully",
        200,
        undefined,
        {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=300",
          Vary: "Authorization",
        }
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark a topic as reviewed (updates lastReviewedAt and triggers schedule update)
   */
  markAsReviewed = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const { topicId } = req.body;

      if (!topicId) {
        ResponseUtil.error(res, "Topic ID is required", 400);
        return;
      }

      // Verify the review schedule exists for this user
      const reviewSchedule = await prisma.reviewSchedule.findUnique({
        where: {
          userId_topicId: {
            userId,
            topicId,
          },
        },
        include: {
          topicMastery: true,
        },
      });

      if (!reviewSchedule) {
        ResponseUtil.error(
          res,
          "Review schedule not found for this topic",
          404
        );
        return;
      }

      const now = new Date();

      // Update the review schedule
      const updated = await prisma.reviewSchedule.update({
        where: {
          id: reviewSchedule.id,
        },
        data: {
          lastReviewedAt: now,
          completedReviews: {
            increment: 1,
          },
        },
      });

      // The next review date will be updated by the review schedule service job
      // For now, we'll return the current schedule

      ResponseUtil.success(
        res,
        {
          id: updated.id,
          topicId: updated.topicId,
          lastReviewedAt: updated.lastReviewedAt,
          nextReviewAt: updated.nextReviewAt,
          completedReviews: updated.completedReviews,
        },
        "Topic marked as reviewed successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get revision schedule grouped by subject
   */
  getRevisionBySubject = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const plan = req.user.plan;
      const subjectId = req.params.subjectId;

      if (
        plan.status === SubscriptionStatus.EXPIRED ||
        new Date(plan.endAt) < new Date()
      ) {
        ResponseUtil.error(
          res,
          "Your subscription has expired. Please upgrade to access Revision Schedule.",
          403
        );
        return;
      }

      const now = new Date();
      const filter = req.query.filter as string | undefined;

      const where: any = {
        userId,
        topicMastery: {
          topic: {
            subjectId,
          },
        },
      };

      if (filter === "due") {
        where.nextReviewAt = { lte: now };
      } else if (filter === "overdue") {
        where.nextReviewAt = { lt: now };
      } else if (filter === "upcoming") {
        where.nextReviewAt = { gt: now };
      }

      const revisionSchedules = await prisma.reviewSchedule.findMany({
        where,
        include: {
          topicMastery: {
            include: {
              topic: {
                include: {
                  subject: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: [
          { nextReviewAt: "asc" },
          { retentionStrength: "asc" },
        ],
      });

      const items: RevisionScheduleItem[] = revisionSchedules.map((schedule) => {
        const nextReviewDate = new Date(schedule.nextReviewAt);
        const daysUntilReview = Math.ceil(
          (nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        const isOverdue = nextReviewDate < now;
        const daysOverdue = isOverdue
          ? Math.ceil((now.getTime() - nextReviewDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        return {
          id: schedule.id,
          topicId: schedule.topicId,
          topicName: schedule.topicMastery.topic.name,
          topicSlug: schedule.topicMastery.topic.slug || undefined,
          subjectId: schedule.topicMastery.topic.subject.id,
          subjectName: schedule.topicMastery.topic.subject.name,
          lastReviewedAt: schedule.lastReviewedAt,
          nextReviewAt: schedule.nextReviewAt,
          reviewInterval: schedule.reviewInterval,
          retentionStrength: schedule.retentionStrength,
          completedReviews: schedule.completedReviews,
          masteryLevel: schedule.topicMastery.masteryLevel,
          strengthIndex: schedule.topicMastery.strengthIndex,
          isOverdue,
          daysUntilReview,
          daysOverdue,
        };
      });

      ResponseUtil.success(
        res,
        { items, total: items.length },
        "Revision schedule by subject retrieved successfully",
        200,
        undefined,
        {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=60",
          Vary: "Authorization",
        }
      );
    } catch (error) {
      next(error);
    }
  };
}
