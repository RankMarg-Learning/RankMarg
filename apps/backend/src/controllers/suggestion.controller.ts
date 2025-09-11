import prisma from "@/lib/prisma";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import { SuggestionStatus, TriggerType } from "@repo/db/enums";
import { NextFunction, Response } from "express";

export class SuggestionController {
  getSuggestions = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { status, triggerType, limit, duration, sort } = req.query;
      const userId = req.user.id;
      const s = status as SuggestionStatus | "ACTIVE";
      const tt = triggerType as TriggerType | "DAILY_ANALYSIS";
      const l = limit ? parseInt(limit as string, 10) : 10;
      const d = duration ? parseInt(duration as string, 10) : 0;
      const so = sort as "asc" | "desc" | "desc";

      const suggestions = await prisma.studySuggestion.findMany({
        where: {
          userId,
          status: s ? (s as SuggestionStatus) : undefined,
          triggerType: tt ? (tt as TriggerType) : undefined,
          OR: [{ displayUntil: null }, { displayUntil: { gt: new Date() } }],
          displayUntil:
            d > 0
              ? { gte: new Date(Date.now() - d * 24 * 60 * 60 * 1000) }
              : undefined,
        },
        orderBy: {
          createdAt: so === "asc" ? "asc" : "desc",
        },
        take: l,
      });
      ResponseUtil.success(res, suggestions, "Ok", 200, undefined, {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
      });
    } catch (error) {
      next(error);
    }
  };
}
