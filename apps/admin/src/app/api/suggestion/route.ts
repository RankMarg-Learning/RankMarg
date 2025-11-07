//Shited to Backend
export const dynamic = 'force-dynamic';

import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";
import { SuggestionStatus, TriggerType } from "@repo/db/enums";


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") as SuggestionStatus | "ACTIVE";
        const triggerType = searchParams.get("triggerType") as TriggerType | "DAILY_ANALYSIS";
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const duration = parseInt(searchParams.get("duration") || "0", 10);
        const sort = searchParams.get("sort") || "desc";
    
        const session = await getAuthSession();
        if (!session || !session.user) {
          return  jsonResponse(null, {message:"Unauthorized", status: 401, success: false} );
        }
        const userId = session?.user?.id;
    
        const suggestions = await prisma.studySuggestion.findMany({
          where: {
            userId,
            status: status ? status as SuggestionStatus : undefined,
            triggerType: triggerType ? triggerType as TriggerType : undefined,
            OR: [
              { displayUntil: null },
              { displayUntil: { gt: new Date() } }
            ],
            displayUntil: duration > 0 ? { gte: new Date(Date.now() - duration * 24 * 60 * 60 * 1000) } : undefined
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc"
          },
          take: limit,
        });
    
        return jsonResponse(suggestions, {message:"Ok", status: 200, success: true});
      } catch (error) {
        console.error("Suggestion fetch error:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
      }
}