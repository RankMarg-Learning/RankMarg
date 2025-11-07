import prisma from "@/lib/prisma"
import { getAuthSession } from "@/utils/session";

export async function GET() {

    try {
        const session = await getAuthSession()
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