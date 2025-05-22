
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";


export async function GET(req:Request,{ params }: { params: { testId: string } }){
  const { testId } = params;
  try {
      const session = await getAuthSession()
      if (!session && !session?.user?.id) {
          return jsonResponse(null,{success:false,message:"Unauthorized",status:401});
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
              status:"STARTED"
          }
      })
      if (!participant) {
          return jsonResponse(null,{success:false,message:"Unauthorized",status:401});
      }
      

      const test = await prisma.test.findUnique({
          where:{
              testId:params.testId
          },
          include: {
              testSection: {
                include: {
                  testQuestion: {
                    include: {
                      question: {
                        include: {
                          options: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          
      });


      if (!test) {
          return jsonResponse(null,{success:false,message:"Test not found",status:404});
      }
      // const totalMarks = test.TestSection.reduce((total, section) => {
      //     const numQuestions = section.TestQuestion.length;
      //     const consideredQuestions = section.isOptional
      //       ? Math.min(numQuestions, section.maxQuestions || 0) 
      //       : numQuestions;
    
      //     const sectionMarks = (section.correctMarks || 0) * consideredQuestions;
      //     return total + sectionMarks;
      //   }, 0);

        
      // const section = await prisma.testSection.findMany({
      //     where:{
      //         testId:params.testId
      //     },
      //     select:{
      //         name:true,
      //         correctMarks:true,
      //         isOptional:true,
      //         maxQuestions:true,
      //         negativeMarks:true,
      //         TestQuestion:{
      //             select:{
      //                 question:{
      //                     include:{
      //                         options:true
      //                     }
      //                 }
      //             }
      //         }
      //     }
      // })

      

      return jsonResponse(
        { ...test, testStatus: participant.status },
        { status: 200 })
  
  
  } catch (error) {
      console.error("[GetTest]:", error);
      return jsonResponse(null,{success:false,message:"Internal Server Error",status:500});
  }
}