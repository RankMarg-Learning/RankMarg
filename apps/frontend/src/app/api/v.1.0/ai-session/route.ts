import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";

export async function GET(req: Request) {
    let searchParams;
    let userId;
    let count;

    try {
        // Parse URL with error handling
        try {
            const url = new URL(req.url);
            searchParams = url.searchParams;
            userId = searchParams.get("userId");
            count = searchParams.get("sessionCount") || "12";
        } catch (urlError) {
            console.error("Error parsing URL:", urlError);
            return jsonResponse(null, { 
                success: false, 
                message: "Invalid request URL", 
                status: 400 
            });
        }

        // Validate required parameters
        if (!userId || userId.trim() === "") {
            return jsonResponse(null, { 
                success: false, 
                message: "User ID is required and cannot be empty", 
                status: 400 
            });
        }

        // Validate and parse count parameter
        const parsedCount = parseInt(count, 10);
        if (isNaN(parsedCount) || parsedCount < 1 || parsedCount > 100) {
            return jsonResponse(null, { 
                success: false, 
                message: "Session count must be a number between 1 and 100", 
                status: 400 
            });
        }

        let sessions;
        try {
            // Database query with error handling
            sessions = await prisma.practiceSession.findMany({
                where: {
                    userId: userId.trim(),
                },
                select: {
                    id: true,
                    userId: true,
                    subjectId: true,
                    questionsSolved: true,
                    correctAnswers: true,
                    isCompleted: true,
                    createdAt: true,
                    attempts: {
                        select: {
                            timing: true,
                            status: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                },
                take: parsedCount,
            });
        } catch (dbError) {
            console.error("Database error fetching practice sessions:", dbError);
            
            // Handle specific database errors
            if (dbError.code === 'P2002') {
                return jsonResponse(null, { 
                    success: false, 
                    message: "Database constraint violation", 
                    status: 400 
                });
            } else if (dbError.code === 'P2025') {
                return jsonResponse(null, { 
                    success: false, 
                    message: "Record not found", 
                    status: 404 
                });
            } else if (dbError.name === 'PrismaClientKnownRequestError') {
                return jsonResponse(null, { 
                    success: false, 
                    message: "Database request error", 
                    status: 400 
                });
            } else if (dbError.name === 'PrismaClientUnknownRequestError') {
                return jsonResponse(null, { 
                    success: false, 
                    message: "Unknown database error", 
                    status: 500 
                });
            }
            
            // Generic database error
            return jsonResponse(null, { 
                success: false, 
                message: "Failed to fetch practice sessions", 
                status: 500 
            });
        }

        // Handle empty results
        if (!sessions || sessions.length === 0) {
            return jsonResponse([], { 
                success: true, 
                message: "No practice sessions found for this user", 
                status: 200 
            });
        }

        // Validate session data structure
        const validSessions = sessions.filter(session => {
            if (!session.id || !session.createdAt) {
                console.warn(`Invalid session data found: ${JSON.stringify(session)}`);
                return false;
            }
            return true;
        });

        if (validSessions.length === 0) {
            console.warn("All sessions had invalid data structure");
            return jsonResponse([], { 
                success: true, 
                message: "No valid practice sessions found", 
                status: 200 
            });
        }

        // Get subject IDs with validation
        const subjectIds = validSessions
            .filter(session => session.subjectId && typeof session.subjectId === 'string')
            .map(session => session.subjectId);

        let subjects = [];
        if (subjectIds.length > 0) {
            try {
                subjects = await prisma.subject.findMany({
                    where: {
                        id: {
                            in: subjectIds
                        }
                    },
                    select: {
                        id: true,
                        name: true
                    }
                });
            } catch (subjectError) {
                console.error("Error fetching subjects:", subjectError);
                // Continue without subjects rather than failing completely
                subjects = [];
            }
        }

        // Create subject lookup map with error handling
        const subjectMap = new Map();
        try {
            subjects.forEach(subject => {
                if (subject && subject.id && subject.name) {
                    subjectMap.set(subject.id, subject.name);
                }
            });
        } catch (mapError) {
            console.error("Error creating subject map:", mapError);
        }

        // Process sessions with comprehensive error handling
        const formattedSessions = [];
        
        for (const session of validSessions) {
            try {
                // Validate session data
                const questionsSolved = Number(session.questionsSolved) || 0;
                const correctAnswers = Number(session.correctAnswers) || 0;
                
                // Validate that correctAnswers doesn't exceed questionsSolved
                const validCorrectAnswers = Math.min(correctAnswers, questionsSolved);
                
                // Calculate total time with error handling
                let totalTimeSeconds = 0;
                if (Array.isArray(session.attempts)) {
                    totalTimeSeconds = session.attempts.reduce((total, attempt) => {
                        const timing = Number(attempt?.timing) || 0;
                        return total + Math.max(0, timing); // Ensure non-negative
                    }, 0);
                }

                const minutes = Math.floor(totalTimeSeconds / 60);
                const seconds = Math.floor(totalTimeSeconds % 60);

                // Format date with error handling
                let formattedDate;
                try {
                    const date = new Date(session.createdAt);
                    if (isNaN(date.getTime())) {
                        throw new Error("Invalid date");
                    }
                    formattedDate = `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
                } catch (dateError) {
                    console.error("Error formatting date:", dateError);
                    formattedDate = "Invalid Date";
                }

                // Calculate accuracy with validation
                const accuracy = questionsSolved > 0
                    ? Math.round((validCorrectAnswers / questionsSolved) * 100)
                    : 0;

                // Ensure accuracy is within valid range
                const validAccuracy = Math.max(0, Math.min(100, accuracy));

                // Generate suggestion based on performance
                let suggestion;
                if (validAccuracy >= 90) {
                    suggestion = "Mastered";
                } else if (validAccuracy >= 75) {
                    suggestion = "Strong";
                } else if (validAccuracy >= 60) {
                    suggestion = "Review";
                } else if (validAccuracy >= 40) {
                    suggestion = "Practice";
                } else {
                    suggestion = "Study";
                }

                const formattedSession = {
                    id: session.id,
                    subject: subjectMap.get(session.subjectId) || "Unknown Subject",
                    date: formattedDate,
                    score: `${validCorrectAnswers}/${questionsSolved}`,
                    accuracy: validAccuracy,
                    time: `${minutes}m ${seconds}s`,
                    suggestion: suggestion,
                    userId: session.userId,
                };

                formattedSessions.push(formattedSession);
            } catch (sessionError) {
                console.error(`Error processing session ${session.id}:`, sessionError);
                // Continue processing other sessions rather than failing completely
                continue;
            }
        }

        // Check if we have any successfully processed sessions
        if (formattedSessions.length === 0) {
            return jsonResponse([], { 
                success: true, 
                message: "No sessions could be processed successfully", 
                status: 200 
            });
        }

        return jsonResponse(formattedSessions, { 
            success: true, 
            message: `Successfully retrieved ${formattedSessions.length} practice sessions`, 
            status: 200 
        });

    } catch (error) {
        // Log the full error for debugging
        console.error("Unexpected error in GET /api/practice-sessions:", {
            error: error.message,
            stack: error.stack,
            userId,
            timestamp: new Date().toISOString()
        });

        // Return generic error response
        return jsonResponse(null, { 
            success: false, 
            message: "An unexpected error occurred while fetching practice sessions", 
            status: 500 
        });
    }
}