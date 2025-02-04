import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(req: Request) {

    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return new Response("Unauthorized", { status: 401 });
        }
        const coins = await prisma.activity.findMany({
            where: {
                userId: session.user.id
            },
            orderBy:{
                createdAt: 'desc'
            }
        })
        return new Response(JSON.stringify(coins), { status: 200 })
    } catch (error) {
        return new Response("Internal Server Error", { status: 500 })

    }
}