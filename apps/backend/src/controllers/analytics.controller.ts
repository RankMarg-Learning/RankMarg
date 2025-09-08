import { getMetricCardData } from "@/constant/recommendation/analytics.recommendation.constant";
import { getDifficultySuggestion } from "@/constant/recommendation/difficulty.recommendation.constant";
import { generateWeeklyTestSuggestion } from "@/constant/recommendation/test.recommendation.constant";
import { getStreamTimingSuggestion } from "@/constant/recommendation/time.recommendation.constant";
import { AuthenticatedRequest } from "@/middleware/auth.middleware";
import { ResponseUtil } from "@/utils/response.util";
import prisma from "@repo/db";
import { NextFunction, Response } from "express";

type RecentTestScoresProps = {
  date: string;
  score: number;
  timing: number;
  accuracy: number;
};

export class AnalyticsController {
  //[GET] /api/analytics
  getAnalyticsData = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const [
        metrics,
        performance,
        questionsByDifficulty,
        avgTimingByDifficulty,
      ] = await Promise.all([
        getUserMetrics(userId),
        getUserPerformance(userId),
        getQuestionsByDifficultyBreakdown(userId),
        getAvgTimingByDifficulty(userId),
      ]);

      const responseData = processRecommendationData(
        metrics,
        performance,
        questionsByDifficulty,
        avgTimingByDifficulty
      );
      ResponseUtil.success(
        res,
        responseData,
        "Analytics data fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  //[GET] /api/analytics/test
  getTestAnalytics = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const testParticipations = await prisma.testParticipation.findMany({
        where: {
          userId: userId,
          status: "COMPLETED",
        },
        include: {
          test: true,
        },
        orderBy: {
          endTime: "asc",
        },
      });

      const monthlyPerformances = testParticipations.reduce(
        (acc, participation) => {
          const month = new Date(participation.endTime).toLocaleString(
            "default",
            { month: "short" }
          );

          if (!acc[month]) {
            acc[month] = [];
          }

          acc[month].push(participation.score || 0);
          return acc;
        },
        {} as Record<string, number[]>
      );

      const performanceData = Object.entries(monthlyPerformances).map(
        ([month, scores]) => {
          const avgScore =
            scores.reduce((sum, score) => sum + score, 0) / scores.length;
          return {
            month,
            score: Math.round(avgScore),
          };
        }
      );

      const allScores = testParticipations.map((p) => p.score || 0);
      const highestScore = Math.max(...allScores, 0);
      const lowestScore = Math.min(
        ...allScores.filter((s) => s > 0),
        highestScore
      );

      ResponseUtil.success(
        res,
        {
          performanceData,
          highestScore,
          lowestScore,
          recentRecommendation: "Unit Circle Interactive Practice",
          recommendationReason: "High effectiveness time slot",
        },
        "Test analytics fetched successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };
}

const getUserMetrics = async (userId: string) => {
  try {
    return await prisma.metric.findMany({
      where: { userId },
      select: {
        metricType: true,
        currentValue: true,
        previousValue: true,
      },
      orderBy: { metricType: "asc" },
    });
  } catch (error) {
    console.error(
      `[ANALYTICS_API] Error fetching user metrics for userId: ${userId}`,
      error
    );
    throw new Error(
      `Failed to fetch user metrics: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
const getUserPerformance = async (userId: string) => {
  try {
    return await prisma.userPerformance.findUnique({
      where: { userId },
      select: {
        highestScore: true,
        lowestScore: true,
        recentTestScores: true,
      },
    });
  } catch (error) {
    console.error(
      `[ANALYTICS_API] Error fetching user performance for userId: ${userId}`,
      error
    );
    throw new Error(
      `Failed to fetch user performance: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

const getQuestionsByDifficultyBreakdown = async (userId: string) => {
  const result = {
    easy: 0,
    medium: 0,
    hard: 0,
    veryHard: 0,
  };

  try {
    const difficultyData = await prisma.$queryRaw<
      Array<{ difficulty: number; count: bigint }>
    >`
            SELECT
                q.difficulty, 
                COUNT(DISTINCT a."questionId") as count
            FROM 
                "Attempt" a
            JOIN 
                "Question" q ON a."questionId" = q.id
            WHERE 
                a."userId" = ${userId}
                AND a."status" = 'CORRECT'
                
            GROUP BY 
                q.difficulty
        `;

    const difficultyMap: Record<number, keyof typeof result> = {
      1: "easy",
      2: "medium",
      3: "hard",
      4: "veryHard",
    };

    for (const item of difficultyData) {
      const key = difficultyMap[item.difficulty];
      if (key && item.count !== null && item.count !== undefined) {
        result[key] = Number(item.count);
      }
    }

    return result;
  } catch (error) {
    console.error(
      `[ANALYTICS_API] Error fetching questions by difficulty for userId: ${userId}`,
      error
    );
    throw new Error(
      `Failed to fetch difficulty breakdown: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

const getAvgTimingByDifficulty = async (userId: string) => {
  const result = {
    easy: 0,
    medium: 0,
    hard: 0,
    veryHard: 0,
  };

  try {
    const timingData = await prisma.$queryRaw<
      Array<{ difficulty: number; avgTime: number | null }>
    >`
            SELECT 
                q.difficulty,
                ROUND(AVG(a."timing")::numeric) AS "avgTime"
            FROM 
                "Attempt" a
            JOIN 
                "Question" q ON a."questionId" = q."id"
            WHERE 
                a."userId" = ${userId}
                AND a."status" = 'CORRECT'
                AND a."timing" IS NOT NULL
            GROUP BY 
                q.difficulty
            ORDER BY 
                q.difficulty
        `;

    const difficultyMap: Record<number, keyof typeof result> = {
      1: "easy",
      2: "medium",
      3: "hard",
      4: "veryHard",
    };

    for (const item of timingData) {
      const key = difficultyMap[item.difficulty];
      if (key && item.avgTime !== null && item.avgTime !== undefined) {
        result[key] = Math.round(item.avgTime);
      }
    }

    return result;
  } catch (error) {
    console.error(
      `[ANALYTICS_API] Error fetching average timing by difficulty for userId: ${userId}`,
      error
    );
    throw new Error(
      `Failed to fetch timing data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

const processRecommendationData = (
  metrics: any[],
  performance: any,
  questionsByDifficulty: any,
  avgTimingByDifficulty: any
) => {
  try {
    const overview = getMetricCardData(metrics || []);
    const testSuggestion = generateWeeklyTestSuggestion(
      (performance?.recentTestScores as RecentTestScoresProps[]) || []
    );
    const difficultyLabel = getDifficultySuggestion(
      questionsByDifficulty || {}
    );
    const timeLabel = getStreamTimingSuggestion(
      "JEE",
      avgTimingByDifficulty || {}
    );

    return {
      overview: {
        metrics: overview,
        performance: {
          ...performance,
          recommendation: testSuggestion,
        },
      },
      difficulty: {
        distribution: questionsByDifficulty,
        recommendation: difficultyLabel,
      },
      timing: {
        byDifficulty: avgTimingByDifficulty,
        recommendation: timeLabel,
      },
    };
  } catch (error) {
    console.error(
      "[ANALYTICS_API] Error processing recommendation data:",
      error
    );
    throw new Error(
      `Failed to process analytics recommendations: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
