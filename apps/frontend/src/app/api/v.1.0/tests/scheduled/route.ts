export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { Stream } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { unstable_cache } from "next/cache";

const getUpcomingTestsForStream = unstable_cache(
    async (stream: Stream) => {
        try {
            const now = new Date();
            return await prisma.test.findMany({
                where: {
                    stream,
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
        // Handle session retrieval errors
        let session;
        try {
            session = await getServerSession(authOptions);
        } catch (error) {
            console.error("[UpcomingScheduledTests] Session error:", error);
            return jsonResponse(null, {
                success: false,
                message: "Authentication service unavailable",
                status: 503
            });
        }

        // Check authentication
        if (!session?.user) {
            return jsonResponse(null, {
                success: false,
                message: "Unauthorized - Please log in",
                status: 401
            });
        }

        // Validate user stream
        const userStream = session?.user?.stream as Stream;
        if (!userStream) {
            console.warn("[UpcomingScheduledTests] User has no stream:", session.user.id);
            return jsonResponse(null, {
                success: false,
                message: "User stream not configured",
                status: 400
            });
        }

        // Validate stream value
        if (!Object.values(Stream).includes(userStream)) {
            console.warn("[UpcomingScheduledTests] Invalid stream value:", userStream);
            return jsonResponse(null, {
                success: false,
                message: "Invalid user stream",
                status: 400
            });
        }

        // Fetch upcoming tests with error handling
        let upcomingTests;
        try {
            upcomingTests = await getUpcomingTestsForStream(userStream);
        } catch (error) {
            console.error("[UpcomingScheduledTests] Cache/Database error:", error);
            
            // Fallback: try direct database query without cache
            try {
                const now = new Date();
                upcomingTests = await prisma.test.findMany({
                    where: {
                        stream: userStream,
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