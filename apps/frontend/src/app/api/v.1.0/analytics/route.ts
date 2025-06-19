export const dynamic = "force-dynamic";

import { NextRequest } from 'next/server';
import { getMetricCardData } from "@/constant/recommendation/analytics.recommendation.constant";
import { getDifficultySuggestion } from "@/constant/recommendation/difficulty.recommendation.constant";
import { generateWeeklyTestSuggestion } from "@/constant/recommendation/test.recommendation.constant";
import { getStreamTimingSuggestion } from "@/constant/recommendation/time.recommendation.constant";
import prisma from "@/lib/prisma";
import { RecentTestScoresProps } from "@/types";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from '@/utils/session';

const getUserMetrics = async (userId: string) => {
    try {
        return await prisma.metric.findMany({
            where: { userId },
            select: {
                metricType: true,
                currentValue: true,
                previousValue: true,
            },
            orderBy: { metricType: 'asc' }
        });
    } catch (error) {
        console.error(`[ANALYTICS_API] Error fetching user metrics for userId: ${userId}`, error);
        throw new Error(`Failed to fetch user metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            }
        });
    } catch (error) {
        console.error(`[ANALYTICS_API] Error fetching user performance for userId: ${userId}`, error);
        throw new Error(`Failed to fetch user performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const getQuestionsByDifficultyBreakdown = async (userId: string) => {
    const result = {
        easy: 0,
        medium: 0,
        hard: 0,
        veryHard: 0
    };

    try {
        const difficultyData = await prisma.$queryRaw<Array<{ difficulty: number; count: bigint }>>`
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
            1: 'easy',
            2: 'medium',
            3: 'hard',
            4: 'veryHard'
        };

        for (const item of difficultyData) {
            const key = difficultyMap[item.difficulty];
            if (key && item.count !== null && item.count !== undefined) {
                result[key] = Number(item.count);
            }
        }

        return result;
    } catch (error) {
        console.error(`[ANALYTICS_API] Error fetching questions by difficulty for userId: ${userId}`, error);
        throw new Error(`Failed to fetch difficulty breakdown: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const getAvgTimingByDifficulty = async (userId: string) => {
    const result = {
        easy: 0,
        medium: 0,
        hard: 0,
        veryHard: 0
    };

    try {
        const timingData = await prisma.$queryRaw<Array<{ difficulty: number; avgTime: number | null }>>`
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
            1: 'easy',
            2: 'medium',
            3: 'hard',
            4: 'veryHard'
        };

        for (const item of timingData) {
            const key = difficultyMap[item.difficulty];
            if (key && item.avgTime !== null && item.avgTime !== undefined) {
                result[key] = Math.round(item.avgTime);
            }
        }

        return result;
    } catch (error) {
        console.error(`[ANALYTICS_API] Error fetching average timing by difficulty for userId: ${userId}`, error);
        throw new Error(`Failed to fetch timing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const validateUserId = (userId: string | null): string => {
    if (!userId) {
        throw new Error("User ID is required");
    }
    
    if (typeof userId !== 'string' || userId.trim().length === 0) {
        throw new Error("User ID must be a non-empty string");
    }
    
    // Optional: Add UUID validation if your user IDs are UUIDs
    // const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    // if (!uuidRegex.test(userId)) {
    //     throw new Error("User ID must be a valid UUID");
    // }
    
    return userId.trim();
};

// Helper function to safely process recommendation data
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
        const difficultyLabel = getDifficultySuggestion(questionsByDifficulty || {});
        const timeLabel = getStreamTimingSuggestion("JEE", avgTimingByDifficulty || {});

        return {
            overview: {
                metrics: overview,
                performance: {
                    ...performance,
                    recommendation: testSuggestion
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
    } catch (error) {
        console.error("[ANALYTICS_API] Error processing recommendation data:", error);
        throw new Error(`Failed to process analytics recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export async function GET(req: NextRequest) {
    try {
        let userId: string;
        try {
            const session = await getAuthSession();
            userId = validateUserId(session?.user?.id);
        } catch (error) {
            return jsonResponse(null, {
                success: false,
                message: error instanceof Error ? error.message : "Invalid user ID",
                status: 400
            });
        }

        let metrics, performance, questionsByDifficulty, avgTimingByDifficulty;
        
        try {
            [metrics, performance, questionsByDifficulty, avgTimingByDifficulty] = await Promise.all([
                getUserMetrics(userId),
                getUserPerformance(userId),
                getQuestionsByDifficultyBreakdown(userId),
                getAvgTimingByDifficulty(userId)
            ]);
        } catch (error) {
            console.error("[ANALYTICS_API] Database operation failed:", error);
            
            // Check if it's a database connection error
            if (error instanceof Error && error.message.includes('connect')) {
                return jsonResponse(null, {
                    success: false,
                    message: "Database connection failed. Please try again later.",
                    status: 503
                });
            }
            
            return jsonResponse(null, {
                success: false,
                message: "Failed to fetch analytics data from database",
                status: 500
            });
        }

        let responseData;
        try {
            responseData = processRecommendationData(
                metrics, 
                performance, 
                questionsByDifficulty, 
                avgTimingByDifficulty
            );
        } catch (error) {
            console.error("[ANALYTICS_API] Recommendation processing failed:", error);
            return jsonResponse(null, {
                success: false,
                message: "Failed to process analytics recommendations",
                status: 500
            });
        }

        return jsonResponse(responseData, {
            success: true,
            message: "Analytics data fetched successfully",
            status: 200
        });

    } catch (error) {
        console.error("[ANALYTICS_API] Unexpected error:", error);
        
        const isDevelopment = process.env.NODE_ENV === 'development';
        const errorMessage = isDevelopment 
            ? `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            : "An unexpected error occurred while processing your request";

        return jsonResponse(null, {
            success: false,
            message: errorMessage,
            status: 500
        });
    }
}