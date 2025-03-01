import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function DELETE(req:Request,{params}:{params:{testId:string}}){
    const {testId} = params;
    try {
        const session = await getServerSession(authOptions);
        if (!session && !session?.user?.id) {
            return new Response("Unauthorized", { status: 401 });
        }

        const test = await prisma.test.findUnique({
            where: {
                testId: testId,
                createdBy: session.user.id,
            },
        });


        if (!test) {
            return new Response("Test not found", { status: 404 });
        }

        
        await prisma.test.delete({
            where: {
                testId: test.testId,
            },
        });

        return new Response("Test Deleted Successfully", { status: 200 });
    } catch (error) {
        console.error("[DeleteTest]:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

export async function GET(req:Request,{ params }: { params: { testId: string } }){
    const { testId } = params;
    try {
        const session = await getServerSession(authOptions);
        if (!session && !session?.user?.id) {
            return new Response("Unauthorized", { status: 401 });
        }
        
        const participant =  await prisma.testParticipation.upsert({
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
                status:"STARTED",
                startTime:new Date(),
            }
        })
        if (!participant) {
            return new Response("Unauthorized", { status: 401 });
        }
        

        const test = await prisma.test.findUnique({
            where:{
                testId:params.testId
            },
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
              },
            
        });
        if (!test) {
            return new Response("Test not found", { status: 404 });
        }
        const totalMarks = test.TestSection.reduce((total, section) => {
            const numQuestions = section.TestQuestion.length;
            const consideredQuestions = section.isOptional
              ? Math.min(numQuestions, section.maxQuestions || 0) 
              : numQuestions;
      
            const sectionMarks = (section.correctMarks || 0) * consideredQuestions;
            return total + sectionMarks;
          }, 0);

          
        const section = await prisma.testSection.findMany({
            where:{
                testId:params.testId
            },
            select:{
                name:true,
                correctMarks:true,
                isOptional:true,
                maxQuestions:true,
                negativeMarks:true,
                TestQuestion:{
                    select:{
                        question:{
                            include:{
                                options:true
                            }
                        }
                    }
                }
            }
        })

        

        return new Response(
            JSON.stringify({
                ...test,
                totalMarks,
                section:section,
                questions:section.flatMap(sec => sec.TestQuestion.map(tq => tq.question)),
                testStatus:participant.status
            }),
            { status: 200 }
        );
    
    
    } catch (error) {
        console.error("[GetTest]:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}