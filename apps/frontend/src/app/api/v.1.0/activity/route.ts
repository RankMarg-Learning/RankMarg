import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";

export async function GET(request: Request) {
    try {
        const searchParams = new URL(request.url).searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const userId = searchParams.get("id");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const type = searchParams.get("type") || undefined;

        // Query the database
        const activities = await prisma.activity.findMany({
            where: {
                userId: userId,
                ...(type && { type }),
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        });

        // Get total count for pagination
        const total = await prisma.activity.count({
            where: {
                userId: userId,
                ...(type && { type }),
            },
        });

        return jsonResponse({
            activities,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        }, { success: true, message: "Ok", status: 200 });

    } catch (error) {
        console.error("Error fetching activities:", error);
            return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
        }
    }