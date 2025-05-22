import { NextRequest } from 'next/server';
import { cache } from 'react';
import { getMetricCardData } from "@/constant/recommendation/analytics.recommendation.constant";
import { getDifficultySuggestion } from "@/constant/recommendation/difficulty.recommendation.constant";
import { generateWeeklyTestSuggestion } from "@/constant/recommendation/test.recommendation.constant";
import { getStreamTimingSuggestion } from "@/constant/recommendation/time.recommendation.constant";
import prisma from "@/lib/prisma";
import { RecentTestScoresProps } from "@/types";
import { jsonResponse } from "@/utils/api-response";

// Cache durations
const CACHE_TTL = 60 * 5; // 5 minutes in seconds
const CACHE_REVALIDATE_SECONDS = 60 * 60; // 1 hour

/**
 * Cached user metrics fetcher
 */
const getUserMetrics = cache(async (userId: string) => {
    return prisma.metric.findMany({
        where: { userId },
        select: {
            metricType: true,
            currentValue: true,
            previousValue: true,
        },
        orderBy: { metricType: 'asc' }
    });
});

/**
 * Cached user performance fetcher
 */
const getUserPerformance = cache(async (userId: string) => {
    return prisma.userPerformance.findUnique({
        where: { userId },
        select: {
            highestScore: true,
            lowestScore: true,
            recentTestScores: true,
        }
    });
});

/**
 * Get questions solved by difficulty level with caching
 */
const getQuestionsByDifficultyBreakdown = cache(async (userId: string) => {
    // Define default result structure
    const result = {
        easy: 0,
        medium: 0,
        hard: 0,
        veryHard: 0
    };

    // Use a single efficient query that joins tables instead of multiple queries
    const difficultyData = await prisma.$queryRaw`
    SELECT 
      q.difficulty, 
      COUNT(DISTINCT a."questionId") as count
    FROM 
      "Attempt" a
    JOIN 
      "Question" q ON a."questionId" = q.id
    WHERE 
      a."userId" = ${userId}
      AND a.status = 'CORRECT'
    GROUP BY 
      q.difficulty
  `;

    // Map difficulty levels to their respective keys
    const difficultyMap = {
        1: 'easy',
        2: 'medium',
        3: 'hard',
        4: 'veryHard'
    };

    // Type assertion for TypeScript
    const typedData = difficultyData as Array<{ difficulty: number, count: bigint }>;

    // Populate result with actual data
    for (const item of typedData) {
        const key = difficultyMap[item.difficulty];
        if (key) {
            result[key] = Number(item.count);
        }
    }

    return result;
});

/**
 * Get average timing by difficulty level with caching
 */
const getAvgTimingByDifficulty = cache(async (userId: string) => {
    const result = {
        easy: 0,
        medium: 0,
        hard: 0,
        veryHard: 0
    };

    const timingData = await prisma.$queryRaw`
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
    GROUP BY 
      q.difficulty
    ORDER BY 
      q.difficulty
  `;

    const difficultyMap = {
        1: 'easy',
        2: 'medium',
        3: 'hard',
        4: 'veryHard'
    };

    const typedTimingData = timingData as Array<{ difficulty: number, avgTime: number }>;

    for (const item of typedTimingData) {
        const key = difficultyMap[item.difficulty];
        if (key) {
            result[key] = Math.round(item.avgTime || 0);
        }
    }

    return result;
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("id");
        const skipCache = searchParams.get("skipCache") === "true";

        // Validate user ID
        if (!userId) {
            return jsonResponse(null, {
                success: false,
                message: "User ID is required",
                status: 400
            });
        }

        // Check for cached response if not skipping cache
        if (!skipCache) {
            // In a real implementation, you would check an external cache like Redis here
            // For Next.js, we're using the built-in React cache() function
        }

        // Fetch all data in parallel for better performance
        const [metrics, performance, questionsByDifficulty, avgTimingByDifficulty] = await Promise.all([
            getUserMetrics(userId),
            getUserPerformance(userId),
            getQuestionsByDifficultyBreakdown(userId),
            getAvgTimingByDifficulty(userId)
        ]);

        // Process the data
        const overview = getMetricCardData(metrics);
        const testSuggestion = generateWeeklyTestSuggestion(
            performance?.recentTestScores as RecentTestScoresProps[] || []
        );
        const difficultyLabel = getDifficultySuggestion(questionsByDifficulty);
        const timeLabel = getStreamTimingSuggestion("JEE", avgTimingByDifficulty);

        // Prepare response data with proper grouping
        const responseData = {
            overview: {
                metrics: overview,
                performance: {
                    ...performance,
                    recommendation:testSuggestion
                }
            },
            difficulty: {
                distribution: questionsByDifficulty,
                recommendation: difficultyLabel
            },
            timing: {
                byDifficulty: avgTimingByDifficulty,
                recommendation: timeLabel
            }
        };

        // Return response with cache headers
        return jsonResponse(responseData, {
            success: true,
            message: "OK",
            status: 200,
            headers: {
                'Cache-Control': `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_REVALIDATE_SECONDS}, stale-while-revalidate=${CACHE_REVALIDATE_SECONDS}`,
                'ETag': `"analytics-${userId}-${Date.now()}"` // Simple ETag generation
            }
        });

    } catch (error) {
        console.error("[ANALYTICS_API] Error fetching analytics data:", error);

        // Return a proper error response
        return jsonResponse(null, {
            success: false,
            message: "Failed to fetch analytics data",
            status: 500
        });
    }
}