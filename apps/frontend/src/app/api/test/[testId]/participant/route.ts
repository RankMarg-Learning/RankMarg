import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET(req:Request,{ params }: { params: { testId: string } }){
    try {
        const session = await getServerSession(authOptions);
        if (!session && !session?.user?.id) {
            return new Response("Unauthorized", { status: 401 });
        }
        const participant = await prisma.testParticipation.findFirst({
            where:{
                testId:params.testId,
                userId:session.user.id
            }
        })
        if(!participant){
            return new Response("Unauthorized", { status: 401 });
        }
        return new Response(JSON.stringify(participant.status), { status: 200 });
        
    } catch (error) {
        console.error("[GET-test/[testId]/participant]:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}