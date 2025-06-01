export const dynamic = "force-dynamic";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { cache } from "react";
import { Prisma } from "@prisma/client";

const querySchema = z.object({
    limit: z.preprocess(
        (val) => {
            if (val === null || val === undefined || val === '') {
                return 10; // default value
            }
            const parsed = parseInt(String(val), 10);
            return isNaN(parsed) ? 10 : parsed;
        },
        z.number().positive().int().max(100).default(10)
    )
});

const getCompletedTestResults = cache(async (userId: string, limit: number) => {
    try {
        return await prisma.testParticipation.findMany({
            where: {
                userId,
                status: 'COMPLETED'
            },
            include: {
                test: {
                    select: {
                        testId: true,
                        title: true,
                        description: true,
                        stream: true,
                        totalMarks: true,
                        totalQuestions: true,
                        difficulty: true,
                        duration: true,
                        examType: true
                    }
                },
            },
            orderBy: {
                endTime: 'desc'
            },
            take: limit
        });
    } catch (error) {
        console.error("[DATABASE_QUERY_ERROR]:", error);
        throw new Error("Failed to fetch test results from database");
    }
});

export async function GET(req: Request) {
    try {
        // Validate URL parsing
        let searchParams: URLSearchParams;
        try {
            const url = new URL(req.url);
            searchParams = url.searchParams;
        } catch (urlError) {
            console.error("[URL_PARSING_ERROR]:", urlError);
            return jsonResponse(null, {
                success: false,
                message: "Invalid request URL",
                status: 400
            });
        }

        // Validate query parameters
        const validatedParams = querySchema.safeParse({
            limit: searchParams.get("limit")
        });

        if (!validatedParams.success) {
            console.error("[VALIDATION_ERROR]:", validatedParams.error.errors);
            return jsonResponse(null, {
                success: false,
                message: `Invalid query parameters: ${validatedParams.error.errors.map(e => e.message).join(', ')}`,
                status: 400
            });
        }

        const { limit } = validatedParams.data;

        // Validate session
        let session;
        try {
            session = await getServerSession(authOptions);
        } catch (sessionError) {
            console.error("[SESSION_ERROR]:", sessionError);
            return jsonResponse(null, {
                success: false,
                message: "Authentication service unavailable",
                status: 503
            });
        }

        if (!session?.user?.id) {
            return jsonResponse(null, {
                success: false,
                message: "Unauthorized - Please log in",
                status: 401
            });
        }

        // Validate user ID format (assuming it should be a valid string)
        if (typeof session.user.id !== 'string' || session.user.id.trim() === '') {
            console.error("[INVALID_USER_ID]:", session.user.id);
            return jsonResponse(null, {
                success: false,
                message: "Invalid user session",
                status: 400
            });
        }

        // Fetch test results with specific error handling
        let testResults;
        try {
            testResults = await getCompletedTestResults(session.user.id, limit);
        } catch (dbError) {
            console.error("[DATABASE_ERROR]:", dbError);
            
            // Handle specific Prisma errors
            if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
                switch (dbError.code) {
                    case 'P2002':
                        return jsonResponse(null, {
                            success: false,
                            message: "Data constraint violation",
                            status: 409
                        });
                    case 'P2025':
                        return jsonResponse(null, {
                            success: false,
                            message: "Record not found",
                            status: 404
                        });
                    default:
                        return jsonResponse(null, {
                            success: false,
                            message: "Database operation failed",
                            status: 500
                        });
                }
            }
            
            if (dbError instanceof Prisma.PrismaClientUnknownRequestError) {
                return jsonResponse(null, {
                    success: false,
                    message: "Unknown database error occurred",
                    status: 500
                });
            }
            
            if (dbError instanceof Prisma.PrismaClientRustPanicError) {
                return jsonResponse(null, {
                    success: false,
                    message: "Database service temporarily unavailable",
                    status: 503
                });
            }
            
            if (dbError instanceof Prisma.PrismaClientInitializationError) {
                return jsonResponse(null, {
                    success: false,
                    message: "Database connection failed",
                    status: 503
                });
            }
            
            if (dbError instanceof Prisma.PrismaClientValidationError) {
                return jsonResponse(null, {
                    success: false,
                    message: "Invalid database query parameters",
                    status: 400
                });
            }

            // Generic database error
            return jsonResponse(null, {
                success: false,
                message: "Failed to retrieve test results",
                status: 500
            });
        }

        // Validate the response data
        if (!Array.isArray(testResults)) {
            console.error("[INVALID_RESPONSE_FORMAT]:", typeof testResults);
            return jsonResponse(null, {
                success: false,
                message: "Invalid data format received",
                status: 500
            });
        }

        return jsonResponse(testResults, {
            success: true,
            message: testResults.length === 0 ? "No completed tests found" : "Test results retrieved successfully",
            status: 200
        });

    } catch (error) {
        // Catch any unexpected errors
        console.error("[UNEXPECTED_ERROR]:", {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });

        return jsonResponse(null, {
            success: false,
            message: "An unexpected error occurred. Please try again later.",
            status: 500
        });
    }
}