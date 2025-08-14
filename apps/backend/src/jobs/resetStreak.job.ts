import { getDayWindow } from "@/lib/dayRange";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { endOfDay } from "date-fns";

export const resetStreakJob = async () => {
  try {
    logger.info("Running Reset Streak Job");

    const { from, to } = getDayWindow();

    const solvedUserIds = await prisma.attempt.findMany({
      where: {
        solvedAt: {
          gte: from,
          lte: to,
        },
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    });

    const solvedUserIdSet = new Set(solvedUserIds.map((item) => item.userId));

    await prisma.userPerformance.updateMany({
      where: {
        userId: {
          notIn: Array.from(solvedUserIdSet),
        },
      },
      data: {
        streak: 0,
      },
    });

    logger.info("Reset Streak Job completed successfully");
  } catch (error) {
    logger.error(
      `Error in Reset Streak Job: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
