import { getDayWindow } from "@/lib/dayRange";
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

  /**
   * Stream suggestions via Server-Sent Events (SSE)
   * Delivers daily coaching suggestions in sequence with chat-like delay
   */
  streamSuggestions = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user.id;


      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      const { from, to } = getDayWindow();
      console.log(from, to)

      const suggestions = await prisma.studySuggestion.findMany({
        where: {
          userId,
          createdAt: {
            gte: from,
            lte: to,
          },
          status: {
            in: [SuggestionStatus.ACTIVE, SuggestionStatus.VIEWED],
          },
        },
        orderBy: [
          { sequenceOrder: "asc" },
          { createdAt: "desc" },
        ],
      });
      console.log(suggestions)
      if (suggestions.length === 0) {
        res.write(`event: empty\n`);
        res.write(`data: ${JSON.stringify({ message: "No suggestions available for today" })}\n\n`);
        res.end();
        return;
      }

      for (let i = 0; i < suggestions.length; i++) {
        const suggestion = suggestions[i];

        res.write(`event: suggestion\n`);
        res.write(`data: ${JSON.stringify({
          id: suggestion.id,
          type: suggestion.type,
          category: suggestion.category,
          message: suggestion.suggestion,
          priority: suggestion.priority,
          actionName: suggestion.actionName,
          actionUrl: suggestion.actionUrl,
          sequenceOrder: suggestion.sequenceOrder,
          index: i + 1,
          total: suggestions.length,
        })}\n\n`);


        if (i < suggestions.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      res.write(`event: complete\n`);
      res.write(`data: ${JSON.stringify({
        message: "All suggestions delivered",
        count: suggestions.length
      })}\n\n`);

      res.end();
    } catch (error) {
      console.error("SSE streaming error:", error);

      // Send error event
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({
        message: "Failed to stream suggestions",
        error: error instanceof Error ? error.message : "Unknown error"
      })}\n\n`);

      res.end();
    }
  };
}
