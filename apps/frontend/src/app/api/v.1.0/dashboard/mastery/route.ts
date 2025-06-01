import { jsonResponse } from "@/utils/api-response";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/utils/session";

function estimateTopPercentile(studentScore: number): number {
    if (studentScore >= 95) return 1;
    if (studentScore >= 90) return 5;
    if (studentScore >= 80) return 10;
    if (studentScore >= 70) return 25;
    if (studentScore >= 60) return 50;
    if (studentScore >= 40) return 75;
    return 90; 
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    let userId = url.searchParams.get('userId');
    
    try {
        // Session handling with proper error checking
        let session;
        try {
            session = await getAuthSession();
        } catch (sessionError) {
            console.error("[Get Mastery] Session error:", sessionError);
            return jsonResponse(null, { 
                success: false, 
                message: "Authentication service unavailable", 
                status: 503 
            });
        }

        userId = session?.user?.id || userId;

        // Authorization checks
        if (!userId && !session) {
            return jsonResponse(null, { 
                success: false, 
                message: "Unauthorized - Please log in", 
                status: 401 
            });
        }
        
        if (!userId) {
            return jsonResponse(null, { 
                success: false, 
                message: "User ID is required", 
                status: 400 
            });
        }

        // Database operations with specific error handling
        let user;
        try {
            user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    subjectMastery: {
                        include: { subject: true }
                    },
                    userPerformance: true,
                }
            });
        } catch (dbError) {
            console.error("[Get Mastery] Database error - user fetch:", dbError);
            return jsonResponse(null, { 
                success: false, 
                message: "Database error occurred", 
                status: 500 
            });
        }

        // Check if user exists
        if (!user) {
            return jsonResponse(null, { 
                success: false, 
                message: "User not found", 
                status: 404 
            });
        }

        // Check if user has a stream (required for topic counting)
        if (!user.stream) {
            console.warn(`[Get Mastery] User ${userId} has no stream assigned`);
            return jsonResponse(null, { 
                success: false, 
                message: "User stream not configured", 
                status: 400 
            });
        }

        const subjectMasteries = user.subjectMastery || [];
        let overallMastery = 0;

        if (subjectMasteries.length > 0) {
            const totalMasteryLevel = subjectMasteries.reduce((sum, subject) => sum + (subject.masteryLevel || 0), 0);
            overallMastery = Math.round(totalMasteryLevel / subjectMasteries.length); 
        }

        let masteryLabel = "Needs Improvement";
        if (overallMastery >= 80) masteryLabel = "Excellent";
        else if (overallMastery >= 70) masteryLabel = "Good";
        else if (overallMastery >= 60) masteryLabel = "Satisfactory";

        // Topic masteries with error handling
        let topicMasteries = [];
        try {
            topicMasteries = await prisma.topicMastery.findMany({
                where: { userId: user.id, masteryLevel: { gte: 80 } },
                include: { topic: true }
            });
        } catch (dbError) {
            console.error("[Get Mastery] Database error - topic mastery fetch:", dbError);
            // Continue with empty array, but log the error
            topicMasteries = [];
        }

        // Total topics count with error handling
        let totalTopics = 0;
        try {
            totalTopics = await prisma.topic.count({
                where: {
                    subject: {
                        stream: user.stream
                    }
                }
            });
        } catch (dbError) {
            console.error("[Get Mastery] Database error - topic count:", dbError);
            // Continue with 0, but log the error
            totalTopics = 0;
        }

        // User performance/streak with error handling
        let streak = { streak: 0 };
        try {
            const userPerformance = await prisma.userPerformance.findUnique({
                where: { userId: user.id },
                select: { streak: true }
            });
            streak = userPerformance || { streak: 0 };
        } catch (dbError) {
            console.error("[Get Mastery] Database error - streak fetch:", dbError);
            // Continue with default streak
            streak = { streak: 0 };
        }

        // Mastery history with error handling
        let improvementPercentage = 0;
        try {
            const previousMonth = new Date();
            previousMonth.setMonth(previousMonth.getMonth() - 1);

            const lastMonthMastery = await prisma.masteryHistory.findFirst({
                where: {
                    userId: user.id,
                    recordedAt: {
                        lt: previousMonth
                    }
                },
                select: { masteryLevel: true },
                orderBy: {
                    recordedAt: 'desc'
                }
            });

            if (lastMonthMastery && lastMonthMastery.masteryLevel !== null) {
                improvementPercentage = Math.round(overallMastery - lastMonthMastery.masteryLevel);
            }
        } catch (dbError) {
            console.error("[Get Mastery] Database error - mastery history fetch:", dbError);
            // Continue with 0 improvement
            improvementPercentage = 0;
        }

        return jsonResponse({
            overallMastery: {
                percentage: overallMastery,
                label: masteryLabel,
                improvement: improvementPercentage,
                topPercentage: estimateTopPercentile(overallMastery)
            },
            conceptsMastered: {
                mastered: topicMasteries.length,
                total: totalTopics,
            },
            studyStreak: {
                days: streak.streak || 0,
                message: (streak.streak || 0) >= 7 ? "Keep it up! 🔥" : "Keep learning daily!"
            }
        }, { success: true, message: "Data retrieved successfully", status: 200 });

    } catch (error) {
        // Catch any unexpected errors
        console.error("[Get Mastery] Unexpected error:", error);
        
        // Provide different error messages based on error type
        let errorMessage = "Internal Server Error";
        let statusCode = 500;
        
        if (error instanceof Error) {
            // Check for specific error types
            if (error.message.includes('Unique constraint')) {
                errorMessage = "Data conflict occurred";
                statusCode = 409;
            } else if (error.message.includes('Foreign key constraint')) {
                errorMessage = "Referenced data not found";
                statusCode = 400;
            } else if (error.message.includes('Timeout')) {
                errorMessage = "Request timeout - please try again";
                statusCode = 408;
            }
        }
        
        return jsonResponse(null, { 
            success: false, 
            message: errorMessage, 
            status: statusCode 
        });
    }
}