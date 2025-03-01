import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { TestWithIncludes } from "@/types/typeTest";
import { SectionA, SectionB, SectionC, SectionD } from "@/utils/test/analysis";
import { SectionE } from "@/utils/test/analysis/SectionE";
import { getServerSession } from "next-auth";

export async function GET(req:Request,{ params }: { params: { testId: string } }){
    const {testId} = params;
    try {
        const session = await getServerSession(authOptions);
        if (!session && !session?.user?.id) {
            return new Response("Unauthorized", { status: 401 });
        }
        const participant = await prisma.testParticipation.findFirst({
            where:{
                testId:testId,
                userId:session.user.id
            }
        })
        if(!participant){
            return new Response("Unauthorized", { status: 401 });
        }
        const test = await prisma.testParticipation.findFirst({
            where:{
                userId:session.user.id,
                testId:testId
            },
            include:{
                test:{
                    include:{
                        TestSection:{
                            include:{
                                TestQuestion:{
                                    include:{
                                        question:{
                                            select:{
                                                id:true,
                                                slug:true,
                                                subject:true,
                                                difficulty:true,
                                                topic:true,
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                TestSubmission:{
                    include:{
                        Question:{
                            select:{
                                id:true,
                                slug:true,
                                subject:true,
                                difficulty:true,
                                topic:true,
                            }
                        }
                    }
                }
            }
        }) as TestWithIncludes
        if(!test){
            return new Response("Test Not Found", { status: 404 });
        }
        const sectionA = SectionA(test)
        const sectionB = SectionB(test)
        const sectionC = SectionC(test)
        const sectionD = SectionD(test)
        const sectionE = SectionE(test)


        return new Response(JSON.stringify(
            {
                sectionA,
                sectionB,
                sectionC,
                sectionD,
                sectionE
            }
        ), { status: 200 });

    } catch (error) {
        console.error("[GET]:/api/test/[testId]/analysis", error);
        return new Response("Internal Server Error", { status: 500 });
        
    }
}

// {
            //     TestName:test.test.title,
            //     AttemptDate:test.TestSubmission[0].submittedAt,
            //     TotalMarks:test.test.totalMarks,
            //     TotalTime:test.test.duration,
            //     ObtainedMarks:test.score,
            //     SpendTime:test.timing,
            //     Accurcy:test.accuracy,
            //     Section:test.test.TestSection
            // })  