//shifted to backend
export const dynamic = "force-dynamic";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getServerSession } from "next-auth";
import { cache } from "react";


const getSessionCache = cache(async () => {
    return await getServerSession(authOptions);
});


export async function GET() {
    try {
        const session = await getSessionCache();
        if (!session) {
            return jsonResponse(null, {
                success: false,
                message: "Unauthorized",
                status: 401
            });
        }

        const userId = session.user.id;

        const weakestSubject = await prisma.subjectMastery.findFirst({
            where: { userId },
            orderBy: { masteryLevel: 'asc' },
            select: {
                subject: {
                    select: {
                        id: true
                    }
                }
            }
        });

        const weakestSubjectId = weakestSubject?.subject?.id;

        
        const recommendedTest = await prisma.test.findFirst({
            where: {
                ...(weakestSubjectId ? {
                    testSection: {
                        some: {
                            testQuestion: {
                                some: {
                                    question: {
                                        subjectId: weakestSubjectId
                                    }
                                }
                            }
                        }
                    }
                } : {})
            },
            orderBy: { createdAt: 'desc' },
            select: {
                testId: true,
                title: true,
                description: true,
                totalMarks: true,
                totalQuestions: true,
                difficulty: true,
                duration: true,
                status: true,
                visibility: true,
                examType: true,
                startTime: true,
                endTime: true,
                createdAt: true,
                updatedAt: true,
                examCode: true
            }
        });

        if (!recommendedTest) {
            return jsonResponse([], {
                success: true,
                message: "No recommended tests found",
                status: 200
            });
        }

        return jsonResponse(recommendedTest, {
            success: true,
            message: "Ok",
            status: 200
        });
    } catch (error) {
        console.error("[RecommendedTests] Error:", error);
        return jsonResponse(null, {
            success: false,
            message: "Internal Server Error",
            status: 500
        });
    }
}