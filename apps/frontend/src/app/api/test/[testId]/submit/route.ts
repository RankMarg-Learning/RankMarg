import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";



export async function POST(req: Request, { params }: { params: { testId: string } }) {
  const { testId } = params;
  const { submission, marks, timing } = await req.json();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }
    const participation = await prisma.testParticipation.findUnique(
      {
        where: {
          userId_testId: {
            userId: session.user.id,
            testId: testId,
          },
        },
        include:{
          test:{
            select:{
              endTime:true
            }
          }
        }
      },
    )
    if (!participation) {
      return new Response("Unauthorized", { status: 401 });
    }

    const submissionsToStore = submission.map((answer) => ({
      participationId: participation.id,
      testId: participation.testId,
      questionId: answer.questionId,
      timing: answer.timing,
      isCorrect: answer.isCorrect,
    }));

    await prisma.testSubmission.createMany({
      data: submissionsToStore,
    });

    await prisma.testParticipation.update({
      where: {
        id: participation.id,
      },
      data: {
        status: "COMPLETED",
        score: marks,
        timing
      },
    });

    return new Response(JSON.stringify({TestEnd:participation.test.endTime}), { status: 200 });
  } catch (error) {
    console.log("[Test Submit API Error]:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
