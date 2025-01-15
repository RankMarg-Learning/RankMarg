import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";


export async function GET(req:Request, { params }: { params: { challengeId: string } }){
    const { challengeId } = params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new Response("Unauthorized", { status: 401 });
        }
        console.log("Challenge ID: ", challengeId);
        const challenge = await prisma.challenge.findUnique({
            where: { challengeId },
            select:{
                challengeId:true,
                player1Id:true,
                player2Id:true,
                status:true,
                result:true,
                ChallengeQuestion:{
                    select:{
                        question:true,
                    }
                },
                player1:{
                    select:{
                        id:true,
                        username:true,
                        avatar:true,
                        rank:true
                    }
                },
                player2:{
                    select:{
                        id:true,
                        username:true,
                        avatar:true,
                        rank:true
                    }
                },
                player1Score:true,
                attemptByPlayer1:true,
                attemptByPlayer2:true,
                player2Score:true,
                endedAt:true,
                createdAt:true
            }
        })
        if(!challenge){
            return new Response("Challenge not found", { status: 404 });
        }
        return new Response(JSON.stringify(challenge), { status: 200 });

    } catch (error) {
       console.log("[Review] Error: ", error);
         return new Response("Internal Server Error", { status: 500 }); 
    }

}