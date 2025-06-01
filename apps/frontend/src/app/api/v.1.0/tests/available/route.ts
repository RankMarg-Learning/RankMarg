export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { z } from "zod";
import { ExamType, Stream, TestStatus, Visibility } from "@prisma/client";
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";

const querySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).default(10),
    type: z.nativeEnum(ExamType).optional(),
});

export const revalidate = 600;

export async function GET(req: NextRequest) {
    try {
        // Parse and validate query parameters
        const { searchParams } = new URL(req.url);
        const validatedParams = querySchema.safeParse({
            limit: searchParams.get("limit"),
            type: searchParams.get("type"),
        });

        if (!validatedParams.success) {
            console.error("[Query Validation Error]:", validatedParams.error.errors);
            return jsonResponse(null, {
                success: false,
                message: "Invalid query parameters: " + validatedParams.error.errors
                    .map(err => `${err.path.join('.')}: ${err.message}`)
                    .join(', '),
                status: 400,
            });
        }

        const { limit, type } = validatedParams.data;

        // Handle authentication
        let session;
        try {
            session = await getAuthSession();
        } catch (authError) {
            console.error("[Authentication Error]:", authError);
            return jsonResponse(null, {
                success: false,
                message: "Authentication failed",
                status: 401,
            });
        }

        if (!session?.user) {
            return jsonResponse(null, {
                success: false,
                message: "User not authenticated",
                status: 401,
            });
        }

        // Validate user stream
        const stream = session.user.stream as Stream;
        if (stream && !Object.values(Stream).includes(stream)) {
            console.error("[Invalid Stream]:", stream);
            return jsonResponse(null, {
                success: false,
                message: "Invalid user stream",
                status: 400,
            });
        }

        // Build where clause with proper type checking
        const whereClause = {
            status: TestStatus.ACTIVE,
            visibility: Visibility.PUBLIC,
            ...(type
                ? { examType: type }
                : {
                    examType: {
                        in: [ExamType.FULL_LENGTH, ExamType.SUBJECT_WISE, ExamType.PYQ],
                    },
                }),
            ...(stream && { stream }),
        };

        // Database query with timeout and error handling
        let availableTests;
        try {
            availableTests = await Promise.race([
                prisma.test.findMany({
                    where: whereClause,
                    select: {
                        testId: true,
                        title: true,
                        description: true,
                        totalMarks: true,
                        totalQuestions: true,
                        difficulty: true,
                        duration: true,
                        examType: true,
                        startTime: true,
                        endTime: true,
                        createdAt: true,
                        stream: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: limit,
                }),
                // 10 second timeout
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Database query timeout")), 10000)
                )
            ]);
        } catch (dbError) {
            console.error("[Database Error]:", dbError);
            
            // Handle specific database errors
            if (dbError instanceof Error) {
                if (dbError.message.includes("timeout")) {
                    return jsonResponse(null, {
                        success: false,
                        message: "Request timeout - please try again",
                        status: 504,
                    });
                }
                
                if (dbError.message.includes("connection")) {
                    return jsonResponse(null, {
                        success: false,
                        message: "Database connection error",
                        status: 503,
                    });
                }
            }
            
            return jsonResponse(null, {
                success: false,
                message: "Failed to fetch tests",
                status: 500,
            });
        }

        // Validate response data
        if (!Array.isArray(availableTests)) {
            console.error("[Data Validation Error]: Expected array, got:", typeof availableTests);
            return jsonResponse(null, {
                success: false,
                message: "Invalid data format received",
                status: 500,
            });
        }

        return jsonResponse(availableTests, {
            success: true,
            message: availableTests.length === 0 ? "No tests found" : "Tests retrieved successfully",
            status: 200,
        });

    } catch (error) {
        // Catch-all error handler
        console.error("[Unexpected Error]:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
        });

        // Don't expose internal errors to client in production
        const isDevelopment = process.env.NODE_ENV === "development";
        
        return jsonResponse(null, {
            success: false,
            message: isDevelopment 
                ? `Internal Server Error: ${error instanceof Error ? error.message : "Unknown error"}`
                : "Internal Server Error",
            status: 500,
        });
    }
}