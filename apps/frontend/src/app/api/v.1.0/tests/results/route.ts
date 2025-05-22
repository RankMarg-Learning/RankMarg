import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { cache } from "react";

const querySchema = z.object({
    limit: z.preprocess(
        (val) => parseInt(String(val), 10),
        z.number().positive().int().default(10)
    )
});

const getCompletedTestResults = cache(async (userId: string, limit: number) => {
    return prisma.testParticipation.findMany({
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
});

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const validatedParams = querySchema.safeParse({
            limit: searchParams.get("limit")
        });

        if (!validatedParams.success) {
            return jsonResponse(null, {
                success: false,
                message: "Invalid query parameters",
                status: 400
            });
        }

        const { limit } = validatedParams.data;

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return jsonResponse(null, {
                success: false,
                message: "Unauthorized",
                status: 401
            });
        }

        const testResults = await getCompletedTestResults(session.user.id, limit);

        return jsonResponse(testResults, {
            success: true,
            message: "OK",
            status: 200
        });
    } catch (error) {
        console.error("[GET_TEST_RESULTS_ERROR]:", error);
        return jsonResponse(null, {
            success: false,
            message: "Internal Server Error",
            status: 500
        });
    }
}