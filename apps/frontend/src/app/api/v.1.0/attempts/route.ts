import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";

export const dynamic = 'force-dynamic'; 

export async function GET(request: Request) {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'calendar';

    try {
        const session = await getAuthSession()
        const userId = session?.user?.id;
        
        if (!session || !session.user) {
            return jsonResponse(null, {
                success: false,
                message: "Unauthorized",
                status: 401
            });
        }
        if (type === 'calendar') {
            

            const calendarData = await prisma.$queryRaw`
                SELECT 
                    DATE("solvedAt") as date,
                    COUNT(*) as "totalAttempts"
                FROM "Attempt" 
                WHERE "userId" = ${userId}
                GROUP BY DATE("solvedAt")
                ORDER BY DATE("solvedAt") DESC
            ` as Array<{
                date: Date;
                totalAttempts: bigint;
            }>;

            // Format the response data
            const formattedCalendarData = calendarData.map(day => ({
                date: day.date.toISOString().split('T')[0],
                totalAttempts: Number(day.totalAttempts)
            }));

            return jsonResponse(formattedCalendarData, {
                success: true,
                message: "Calendar data fetched successfully",
                status: 200
            });
        }

        // Handle other types here if needed
        return jsonResponse(null, {
            success: false,
            message: "Invalid type parameter",
            status: 400
        });
        
    } catch (error) {
        console.error("Calendar API Error:", error);
        return jsonResponse(null, {
            success: false,
            message: "Internal Server Error",
            status: 500
        });
    }
}