export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { unstable_cache } from "next/cache";
import { getAuthSession } from "@/utils/session";

const getUpcomingTestsForStream = unstable_cache(
    async (examCode: string) => {
        try {
            const now = new Date();
            return await prisma.test.findMany({
                where: {
                    examCode,
                    startTime: { gt: now },
                    status: "ACTIVE",
                    visibility: "PUBLIC"
                },
                orderBy: { startTime: "asc" },
                select: {
                    testId: true,
                    title: true,
                    description: true,
                    startTime: true,
                    endTime: true,
                    difficulty: true,
                    duration: true,
                    totalMarks: true,
                    totalQuestions: true,
                    examType: true,
                }
            });
        } catch (error) {
            console.error("[getUpcomingTestsForStream] Database error:", error);
            throw new Error("Failed to fetch upcoming tests from database");
        }
    },
    ["upcoming-tests"],
    { revalidate: 300 }
);

export async function GET(req: NextRequest) {
    try {
        
        const session = await getAuthSession();
        // Check authentication
        if (!session?.user) {
            return jsonResponse(null, {
                success: false,
                message: "Unauthorized - Please log in",
                status: 401
            });
        }
        const examCode = session?.user?.examCode  || "";
        if (!examCode) {
            console.warn("[UpcomingScheduledTests] User has no exam code:", session.user.id);
            return jsonResponse(null, {
                success: false,
                message: "User exam code not configured",
                status: 400
            });
        }

       

        // Fetch upcoming tests with error handling
        let upcomingTests;
        try {
            upcomingTests = await getUpcomingTestsForStream(examCode);
        } catch (error) {
            console.error("[UpcomingScheduledTests] Cache/Database error:", error);
            
            // Fallback: try direct database query without cache
            try {
                const now = new Date();
                upcomingTests = await prisma.test.findMany({
                    where: {
                        examCode: examCode,
                        startTime: { gt: now },
                        status: "ACTIVE",
                        visibility: "PUBLIC"
                    },
                    orderBy: { startTime: "asc" },
                    select: {
                        testId: true,
                        title: true,
                        description: true,
                        startTime: true,
                        endTime: true,
                        difficulty: true,
                        duration: true,
                        totalMarks: true,
                        totalQuestions: true,
                        examType: true,
                    }
                });
                console.warn("[UpcomingScheduledTests] Fallback query successful");
            } catch (fallbackError) {
                console.error("[UpcomingScheduledTests] Fallback query failed:", fallbackError);
                return jsonResponse(null, {
                    success: false,
                    message: "Database service temporarily unavailable",
                    status: 503
                });
            }
        }

        // Validate response data
        if (!Array.isArray(upcomingTests)) {
            console.error("[UpcomingScheduledTests] Invalid response format:", typeof upcomingTests);
            return jsonResponse([], {
                success: true,
                message: "No upcoming tests found",
                status: 200
            });
        }

        return jsonResponse(upcomingTests, {
            success: true,
            message: `Found ${upcomingTests.length} upcoming test${upcomingTests.length !== 1 ? 's' : ''}`,
            status: 200
        });

    } catch (error) {
        // Catch any unexpected errors
        console.error("[UpcomingScheduledTests] Unexpected error:", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });

        return jsonResponse(null, {
            success: false,
            message: "An unexpected error occurred",
            status: 500
        });
    }
}