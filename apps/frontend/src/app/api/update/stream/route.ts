import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    const body = await req.json();
    const { stream } = body;
    try {
        const session = await getServerSession(authOptions);
        if(session){
            session.user.stream = stream;
        }
        const user = await prisma.user.update({
            where: { id: session?.user.id },
            data: { stream: stream }
        })
        if(user){
            return new Response("Stream updated", { status: 200 })
        }
        return new Response("User not found", { status: 404 })
        
    } catch (error) {
        console.error("Error updating stream", error)
        return new Response("Error updating stream", { status: 500 })
    }

}
