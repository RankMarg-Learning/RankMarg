
import prisma from "@/lib/prisma";
import { testQuestion, testSection } from "@/types/typeAdmin";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";

export async function DELETE(req:Request,{params}:{params:{testId:string}}){
    const {testId} = params;
    try {
        const session = await getAuthSession()
        if (!session && !session?.user?.id) {
            return jsonResponse(null,{success:false,message:"Unauthorized",status:401});
        }

        const test = await prisma.test.findUnique({
            where: {
                testId: testId,
                createdBy: session.user.id,
            },
        });

        if (!test) {
            return jsonResponse(null,{success:false,message:"Test not found",status:404});
        }

        await prisma.test.delete({
            where: {
                testId: test.testId,
            },
        });

        return jsonResponse(null,{success:true,message:"Test Deleted Successfully",status:200});
    } catch (error) {
        console.error("[DeleteTest]:", error);
        return jsonResponse(null,{success:false,message:"Failed to delete test",status:500});
    }
}

export async function GET(req:Request,{params}:{params:{testId:string}}){
    const {testId} = params;
    try {

        const test = await prisma.test.findUnique({
            where: {
                testId: testId,
                // createdBy: session.user.id,
            },
            include:{
                testSection:{
                    include:{
                        testQuestion:{
                            select:{
                                question:{
                                    select:{
                                        id:true,
                                        title:true
                                        }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!test) {
            return jsonResponse(null,{success:false,message:"Test not found",status:404});
        }
        const formattedTest = {
            ...test,
            testSection: test?.testSection.map((section) => ({
              ...section,
              testQuestion: section.testQuestion.map((q) => ({
                id: q.question.id,
                title: q.question.title,
              })),
            })),
          };

        return jsonResponse(formattedTest,{success:true,message:"Ok",status:200});
    } catch (error) {
        console.error("[GetTest]:", error);
        return jsonResponse(null,{success:false,message:"Failed to fetch test",status:500});
    }
}

export async function PUT(req: Request, { params }: { params: { testId: string } }) {
    const { testId } = params;
    const body = await req.json();
    const {
        title, description, stream, duration, testKey, testSection,
        startTime, endTime, examType, difficulty,  status, visibility
    } = body;

    try {

        const calculateTotalMarks = (testSections: {
            testQuestion: { id: string }[];
            maxQuestions?: number;
            isOptional: boolean;
            correctMarks: number;
          }[]) => {
            return testSections.reduce((total, section) => {
              const consideredQuestions = section.isOptional ? Math.min(section.testQuestion.length, section.maxQuestions) : section.testQuestion.length;
        
              return total + consideredQuestions * section.correctMarks;
            }, 0);
          };
         const totalMarks = calculateTotalMarks(testSection.map(section => ({
            testQuestion: section.testQuestion || [],
            maxQuestions: section.maxQuestions,
            isOptional: section.isOptional,
            correctMarks: section.correctMarks || 0
          })));
          const totalQuestions = testSection.reduce(
            (total, section) => total + section.testQuestion.length,
            0
          );
        await prisma.test.update({
            where: { testId },
            data: {
                title,
                description,
                stream,
                totalMarks,
                totalQuestions,
                status,
                visibility,
                testKey,
                difficulty,
                examType,
                duration,
                startTime,
                endTime,

                // Handle TestSection updates
                testSection: {
                    deleteMany: {}, // Remove existing sections
                    create: testSection.map((section: testSection) => ({
                        name: section.name,
                        isOptional: section.isOptional,
                        maxQuestions: section.maxQuestions,
                        correctMarks: section.correctMarks,
                        negativeMarks: section.negativeMarks,
                        testQuestion: {
                            create: section.testQuestion.map((question: testQuestion) => ({
                                questionId: question.id
                            })),
                        },
                    })),
                },
            },
        });

        return jsonResponse(null,{success:true,message:"Test Updated Successfully",status:200});
    } catch (error) {
        console.error("[UpdateTest]:", error);
        return jsonResponse(null,{success:false,message:"Failed to update test",status:500});
    }
}



// export async function GET(req:Request,{ params }: { params: { testId: string } }){
//     const { testId } = params;
//     try {
//         
//         if (!session && !session?.user?.id) {
//             return new Response("Unauthorized", { status: 401 });
//         }
        
//         const participant =  await prisma.testParticipation.upsert({
//             where:{
//                 userId_testId: {
//                     userId: session.user.id,
//                     testId: testId
//                 }
//             },
//             update:{},
//             create:{
//                 testId:testId,
//                 userId:session.user.id,
//                 status:"STARTED",
//                 startTime:new Date(),
//             }
//         })
//         if (!participant) {
//             return new Response("Unauthorized", { status: 401 });
//         }
        

//         const test = await prisma.test.findUnique({
//             where:{
//                 testId:params.testId
//             },
//             include: {
//                 TestSection: {
//                   include: {
//                     TestQuestion: {
//                       include: {
//                         question: true,
//                       },
//                     },
//                   },
//                 },
//               },
            
//         });
//         if (!test) {
//             return new Response("Test not found", { status: 404 });
//         }
//         const totalMarks = test.TestSection.reduce((total, section) => {
//             const numQuestions = section.TestQuestion.length;
//             const consideredQuestions = section.isOptional
//               ? Math.min(numQuestions, section.maxQuestions || 0) 
//               : numQuestions;
      
//             const sectionMarks = (section.correctMarks || 0) * consideredQuestions;
//             return total + sectionMarks;
//           }, 0);

          
//         const section = await prisma.testSection.findMany({
//             where:{
//                 testId:params.testId
//             },
//             select:{
//                 name:true,
//                 correctMarks:true,
//                 isOptional:true,
//                 maxQuestions:true,
//                 negativeMarks:true,
//                 TestQuestion:{
//                     select:{
//                         question:{
//                             include:{
//                                 options:true
//                             }
//                         }
//                     }
//                 }
//             }
//         })

        

//         return new Response(
//             JSON.stringify({
//                 ...test,
//                 totalMarks,
//                 section:section,
//                 questions:section.flatMap(sec => sec.TestQuestion.map(tq => tq.question)),
//                 testStatus:participant.status
//             }),
//             { status: 200 }
//         );
    
    
//     } catch (error) {
//         console.error("[GetTest]:", error);
//         return new Response("Internal Server Error", { status: 500 });
//     }
// }