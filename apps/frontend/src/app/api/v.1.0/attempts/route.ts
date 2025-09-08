// Shifted to Backend
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";

export const dynamic = 'force-dynamic'; 

export async function GET(request: Request) {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'calendar';

    try {
        // Validate type parameter
        if (type !== 'calendar') {
            return jsonResponse(null, {
                success: false,
                message: "Invalid type parameter. Only 'calendar' is supported.",
                status: 400
            });
        }

        // Handle authentication with proper error handling
        let session;
        try {
            session = await getAuthSession();
        } catch (authError) {
            console.error("Authentication error:", authError);
            return jsonResponse(null, {
                success: false,
                message: "Authentication failed",
                status: 401
            });
        }
        
        if (!session?.user?.id) {
            return jsonResponse(null, {
                success: false,
                message: "Unauthorized - Please login to access this resource",
                status: 401
            });
        }

        const userId = session.user.id;

        // Validate userId format (assuming it should be a valid string/number)
        if (!userId || (typeof userId !== 'string' && typeof userId !== 'number')) {
            console.error("Invalid userId format:", userId);
            return jsonResponse(null, {
                success: false,
                message: "Invalid user session",
                status: 401
            });
        }

        // Handle database query with specific error handling
        let calendarData;
        try {
            calendarData = await prisma.$queryRaw`
                SELECT 
                    DATE("solvedAt") as date,
                    COUNT(*) as "totalAttempts"
                FROM "Attempt" 
                WHERE "userId" = ${userId}
                    AND "solvedAt" IS NOT NULL
                GROUP BY DATE("solvedAt")
                ORDER BY DATE("solvedAt") DESC
                LIMIT 365
            ` as Array<{
                date: Date;
                totalAttempts: bigint;
            }>;
        } catch (dbError) {
            console.error("Database query error:", {
                error: dbError,
                userId,
                timestamp: new Date().toISOString()
            });
            
            // Handle specific database errors
            if (dbError instanceof Error) {
                if (dbError.message.includes('connection')) {
                    return jsonResponse(null, {
                        success: false,
                        message: "Database connection error. Please try again later.",
                        status: 503
                    });
                }
                if (dbError.message.includes('timeout')) {
                    return jsonResponse(null, {
                        success: false,
                        message: "Request timeout. Please try again.",
                        status: 408
                    });
                }
            }
            
            return jsonResponse(null, {
                success: false,
                message: "Failed to fetch calendar data",
                status: 500
            });
        }

        // Validate query results
        if (!Array.isArray(calendarData)) {
            console.error("Invalid query result format:", calendarData);
            return jsonResponse(null, {
                success: false,
                message: "Invalid data format received",
                status: 500
            });
        }

        // Format the response data with error handling
        let formattedCalendarData;
        try {
            formattedCalendarData = calendarData.map((day, index) => {
                // Validate each record
                if (!day || typeof day !== 'object') {
                    console.warn(`Invalid calendar data at index ${index}:`, day);
                    return null;
                }

                // Handle date conversion
                let formattedDate;
                try {
                    if (day.date instanceof Date) {
                        formattedDate = day.date.toISOString().split('T')[0];
                    } else if (typeof day.date === 'string') {
                        formattedDate = new Date(day.date).toISOString().split('T')[0];
                    } else {
                        console.warn(`Invalid date format at index ${index}:`, day.date);
                        return null;
                    }
                } catch (dateError) {
                    console.warn(`Date conversion error at index ${index}:`, dateError);
                    return null;
                }

                // Handle totalAttempts conversion
                let totalAttempts;
                try {
                    if (typeof day.totalAttempts === 'bigint') {
                        totalAttempts = Number(day.totalAttempts);
                    } else if (typeof day.totalAttempts === 'number') {
                        totalAttempts = day.totalAttempts;
                    } else if (typeof day.totalAttempts === 'string') {
                        totalAttempts = parseInt(day.totalAttempts, 10);
                    } else {
                        console.warn(`Invalid totalAttempts format at index ${index}:`, day.totalAttempts);
                        totalAttempts = 0;
                    }

                    // Validate the number
                    if (isNaN(totalAttempts) || totalAttempts < 0) {
                        console.warn(`Invalid totalAttempts value at index ${index}:`, day.totalAttempts);
                        totalAttempts = 0;
                    }
                } catch (numberError) {
                    console.warn(`Number conversion error at index ${index}:`, numberError);
                    totalAttempts = 0;
                }

                return {
                    date: formattedDate,
                    totalAttempts
                };
            }).filter(Boolean); // Remove null entries
        } catch (formatError) {
            console.error("Data formatting error:", formatError);
            return jsonResponse(null, {
                success: false,
                message: "Failed to format calendar data",
                status: 500
            });
        }

        // Final validation
        if (!formattedCalendarData || formattedCalendarData.length === 0) {
            return jsonResponse([], {
                success: true,
                message: "No calendar data found for this user",
                status: 200
            });
        }

        return jsonResponse(formattedCalendarData, {
            success: true,
            message: "Calendar data fetched successfully",
            status: 200
        });
        
    } catch (error) {
        // Catch-all error handler
        console.error("Unexpected Calendar API Error:", {
            error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : error,
            timestamp: new Date().toISOString(),
            url: request.url
        });

        // Don't expose internal error details to client
        return jsonResponse(null, {
            success: false,
            message: "An unexpected error occurred. Please try again later.",
            status: 500
        });
    }
}