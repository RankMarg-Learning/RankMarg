import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/options"
import prisma from "@/lib/prisma"

export async function POST(req:Request){
    const body = await req.json()
    const {testId} = body;
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new Response('Unauthorized', { status: 401 })
        }
        const userId: string = session.user.id as string;
        
        const isReJoin = await prisma.testParticipation.findFirst({
            where:{
                userId:userId,
                testId:testId
            }
        })
        if(!isReJoin){
            const JoinTest = await prisma.testParticipation.create({
                data:{
                  testId: testId,
                  userId:userId  
                },
                include:{
                    test:true,
                    user:true
                }
            })
        }

        await prisma.testParticipation.update({
            where:{
                userId_testId:{
                    userId:userId,
                    testId:testId
                }
            },
            data:{
                status:"STARTED"
            }

            })
        
        return new Response(JSON.stringify({
            message: "You have successfully joined the test",
            testId: testId,
        }), { status: 200 })

        
    } catch (error) {
        console.error('[POST /api/test/join] Error joining test:', error)
        return new Response('Internal Server Error', { status: 500 })
    }
}