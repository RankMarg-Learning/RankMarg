import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";


export async function GET(req:Request,{ params }: { params: { testId: string } }) {
    const { testId } = params;
    try {
        const session = await getServerSession( authOptions);
        if (!session) {
          return new Response('Unauthorized', { status: 401 })
        }

        await prisma.testParticipation.upsert({
            where:{
                userId_testId: {
                    userId: session.user.id,
                    testId: testId
                }
            },
            update:{},
            create:{
                testId:testId,
                userId:session.user.id,
                status:"STARTED"
            }
        })

        const test = await prisma.test.findUnique({
          where: { testId },
          include: {
            TestSection: {
              include: {
                TestQuestion: {
                  include: {
                    question: true,
                  },
                },
              },
            },
            TestParticipation: true,
          },
        });
    
        if (!test) {
          return new Response('Test not found', { status: 404 })
        }
        const totalMarks = test.TestSection.reduce((total, section) => {
            const numQuestions = section.TestQuestion.length;
            const consideredQuestions = section.isOptional
              ? Math.min(numQuestions, section.maxQuestions || 0) 
              : numQuestions;
      
            const sectionMarks = (section.correctMarks || 0) * consideredQuestions;
            return total + sectionMarks;
          }, 0);

          const totalQuestions = test.TestSection.reduce(
            (total, section) => total + section.TestQuestion.length,
            0
          );
    
        const response = {
          testId: test.testId,
          title: test.title,
          totalMarks,
          totalQuestions,
          description: test.description,
          testKey: test.testKey,
          duration: test.duration,
          examType: test.examType,
          startTime: test.startTime,
          endTime: test.endTime,
          sections: test.TestSection.map((section) => ({
            id: section.id,
            name: section.name,
            isOptional: section.isOptional,
            maxQuestions: section.maxQuestions,
            correctMarks: section.correctMarks,
            negativeMarks: section.negativeMarks,
            questions: section.TestQuestion.map((testQuestion) => ({
              id: testQuestion.question.id,
              title: testQuestion.question.title,
            })),
          })),
          
        };
    
        return new Response(JSON.stringify(response), {status:200})
            
        
    } catch (error) {
        console.error('[GET /api/test/[testId]/details] Error getting test details:', error)
        return new Response('Internal Server Error', { status: 500 })
    }
}