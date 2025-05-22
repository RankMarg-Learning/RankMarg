import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { Stream } from "@prisma/client";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { unstable_cache } from "next/cache";

const getUpcomingTestsForStream = unstable_cache(
    async (stream: Stream) => {
        const now = new Date();

        return prisma.test.findMany({
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
    },
    ["upcoming-tests"],
    { revalidate: 300 } 
);

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return jsonResponse(null, {
                success: false,
                message: "Unauthorized",
                status: 401
            });
        }

        const userStream = session.user.stream as Stream;
        if (!userStream) {
            return jsonResponse(null, {
                success: false,
                message: "User stream not found",
                status: 400
            });
        }

        const upcomingTests = await getUpcomingTestsForStream(userStream);

        return jsonResponse(upcomingTests, {
            success: true,
            message: "OK",
            status: 200
        });
    } catch (error) {
        console.error("[UpcomingScheduledTests]:", error);

        return jsonResponse(null, {
            success: false,
            message: "Internal Server Error",
            status: 500
        });
    }
}