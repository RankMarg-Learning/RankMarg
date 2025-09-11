import prisma from "@/lib/prisma";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import { NextFunction, Response } from "express";

export class activityController {
  getActivities = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { page, limit, type } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const userId = req.user.id;

      const [activities, total] = await prisma.$transaction([
        prisma.activity.findMany({
          where: {
            userId,
            ...(type && { type: type as string }),
          },
          skip: skip ? Number(skip) : undefined,
          take: Number(limit),
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            type: true,
            message: true,
            earnCoin: true,
            createdAt: true,
          },
        }),
        prisma.activity.count({
          where: {
            userId,
            ...(type && { type: type as string }),
          },
        }),
      ]);
      const payload = {
        activities: activities.map((activity) => ({
          id: activity.id,
          type: activity.type,
          message: activity.message,
          earnCoin: activity.earnCoin,
          createdAt: activity.createdAt.toISOString(),
        })),
      };
      ResponseUtil.success(
        res,
        payload,
        "Activities fetched successfully",
        200,
        undefined,
        {
          "Cache-Control": "public, max-age=30, stale-while-revalidate=30",
        }
      );
    } catch (error) {
      next(error);
    }
  };
}
