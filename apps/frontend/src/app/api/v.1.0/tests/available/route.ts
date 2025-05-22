export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { z } from "zod";
import { ExamType, Stream, TestStatus, Visibility } from "@prisma/client";
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";



const querySchema = z.object({
    limit: z.coerce.number().int().positive().default(10),
    type: z.nativeEnum(ExamType).optional(),
});

export const revalidate = 600;

export async function GET(req: NextRequest) {
    try {
        

        const { searchParams } = new URL(req.url);
        const validatedParams = querySchema.safeParse({
            limit: searchParams.get("limit"),
            type: searchParams.get("type"),
        });

        if (!validatedParams.success) {
            return jsonResponse(null, {
                success: false,
                message: "Invalid query parameters",
                status: 400,
            });
        }

        const { limit, type } = validatedParams.data;

        const session = await getAuthSession();
        if (!session?.user) {
            return jsonResponse(null, {
                success: false,
                message: "Unauthorized",
                status: 401,
            });
        }

        const stream = session.user.stream as Stream;

        const whereClause = {
            status: "ACTIVE" as TestStatus,
            visibility: "PUBLIC" as Visibility,
            ...(type
                ? { examType: type }
                : {
                    examType: {
                        in: ["FULL_LENGTH", "SUBJECT_WISE", "PYQ"] as ExamType[],
                    },
                }),
            ...(stream && { stream }),
        };

        const availableTests = await prisma.test.findMany({
            where: whereClause,
            select: {
                testId: true,
                title: true,
                description: true,
                totalMarks: true,
                totalQuestions: true,
                difficulty: true,
                duration: true,
                examType: true,
                startTime: true,
                endTime: true,
                createdAt: true,
                stream: true,
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return jsonResponse(availableTests, {
            success: true,
            message: "OK",
            status: 200,
        });
    } catch (error) {
        console.error("[AvailableTests Error]:", error);
        return jsonResponse(null, {
            success: false,
            message: "Internal Server Error",
            status: 500,
        });
    }
}