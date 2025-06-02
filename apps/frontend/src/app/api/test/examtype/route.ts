import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { ExamType } from "@prisma/client";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const examType = searchParams.get('examType');
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new Response("Unauthorized", { status: 401 });
        }

        const tests = await prisma.test.findMany({
            where: {
                //! stream: session.user.stream as Stream, //Add this afterwards
                visibility: "PUBLIC",
                examType:examType as ExamType
            },
            include: {
                testParticipation: {
                    where: {
                        userId: session.user.id
                    },
                    select: {
                        status: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Add hasAttempted flag to each test
        const testsWithAttemptStatus = tests.map(test => ({
            ...test,
            hasAttempted: test.testParticipation[0]?.status === "COMPLETED" || false,
        }));

        return new Response(JSON.stringify(testsWithAttemptStatus), { status: 200 });
    } catch (error) {
        console.error("[GetTests]:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

