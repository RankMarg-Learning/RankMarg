import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import { jsonResponse } from "@/utils/api-response";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function GET(req: Request, { params }: { params: { sessionId: string } }) {
    const { sessionId } = params;

    try {
        // Validate sessionId
        if (!sessionId || typeof sessionId !== 'string') {
            return jsonResponse(null, { 
                success: false, 
                message: "Invalid session ID", 
                status: 400 
            });
        }

        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return jsonResponse(null, { 
                success: false, 
                message: "Unauthorized: Please log in", 
                status: 401 
            });
        }

        // Fetch practice session with proper error handling
        const practiceSession = await prisma.practiceSession.findUnique({
            where: {
                id: sessionId,
                userId: session.user.id,
            },
            include: {
                questions: {
                    include: {
                        question: {
                            include: {
                                options: true,
                                topic: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                },
                                category: {
                                    select: {
                                        category: true
                                    }
                                }
                            },
                        },
                    },
                },
                attempts: true,
            }
        });

        // Check if practice session exists
        if (!practiceSession) {
            return jsonResponse(null, { 
                success: false, 
                message: "Practice session not found or you don't have access", 
                status: 404 
            });
        }

        return jsonResponse(practiceSession, { 
            success: true, 
            message: "Practice session retrieved successfully", 
            status: 200 
        });

    } catch (error) {
        // Type guard for error
        const errorMessage = error instanceof Error 
            ? error.message 
            : "An unexpected error occurred";

        // Log detailed error information
        console.error("[AiPracticeSession-Dynamic] Error:", {
            error: errorMessage,
            sessionId,
            stack: error instanceof Error ? error.stack : undefined
        });

        // Handle specific Prisma errors
        if (error instanceof PrismaClientKnownRequestError) {
            // Handle specific Prisma error codes
            if (error.code === 'P2025') {
                return jsonResponse(null, { 
                    success: false, 
                    message: "Practice session not found", 
                    status: 404 
                });
            }
        }

        // Generic error response
        return jsonResponse(null, { 
            success: false, 
            message: "Internal server error", 
            status: 500,
        });
    }
}