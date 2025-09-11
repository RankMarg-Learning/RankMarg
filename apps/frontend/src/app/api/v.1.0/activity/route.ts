//shifted to backend : /api/activity
export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";
// Optional: Redis for caching
// import { createClient } from "redis";

// const redis = createClient({ url: "redis://your-redis-url" });
// await redis.connect();

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const searchParams = new URL(request.url).searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const type = searchParams.get("type") || undefined;

    // Verify user session
    const session = await getAuthSession();
    if (!session || !session.user?.id) {
      return jsonResponse(null, { success: false, message: "Unauthorized", status: 401 });
    }
    const userId = session.user.id;

    // Optional: Check cache
    // const cacheKey = `student_activities:${userId}:${page}:${limit}:${type || "all"}`;
    // const cachedData = await redis.get(cacheKey);
    // if (cachedData) {
    //   return jsonResponse(JSON.parse(cachedData), { success: true, message: "Ok", status: 200 });
    // }

    // Fetch activities and total count in a single transaction
    const [activities, total] = await prisma.$transaction([
      prisma.activity.findMany({
        where: {
          userId,
          ...(type && { type }),
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          type: true,
          message: true,
          earnCoin: true,
          createdAt: true,
        },
      }),
      prisma.activity.count({
        where: {
          userId,
          ...(type && { type }),
        },
      }),
    ]);

    // Prepare response
    const response = {
      activities: activities.map((activity) => ({
        id: activity.id,
        type: activity.type,
        message: activity.message,
        earnCoin: activity.earnCoin,
        createdAt: activity.createdAt.toISOString(),
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    // Optional: Cache response for 60 seconds
    // await redis.setEx(cacheKey, 60, JSON.stringify(response));

    return jsonResponse(response, { success: true, message: "Ok", status: 200 });
  } catch (error) {
    console.error("Error fetching student activities:", error);
    return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
  }
}