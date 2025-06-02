import prisma from "@/lib/prisma";

export async function POST(req:Request,{ params }: { params: { testId: string } }) {
    try {
        const { testId } = params; 

        const participants = await prisma.test.findMany({
            where: { testId: testId },
            select:{
                title:true,
                totalMarks:true,
                testParticipation:{
                    orderBy:[
                        { score: "desc" }, 
                        { timing: "asc" }, 
                      ],
                    select:{
                        accuracy:true,
                        score:true,
                        timing:true,
                        user:{
                            select:{
                                avatar:true,
                                name:true,
                                username:true
                            }
                        }
                    }
                }
            }

        });

        return new Response(JSON.stringify(participants), { status: 200 });
    } catch (error) {
        console.log("[Test Leaderboard API Error]:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}