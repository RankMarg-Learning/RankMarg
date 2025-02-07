import prisma from "@/lib/prisma";

export async function GET( req:Request,{params} : { params: { slug: string } }) {

    const { slug } = params;

    try {
        
        const question = await prisma.question.findUnique({
            where: {
                slug
            },
            include:{
                options:true,
                attempts:{
                    where:{
                        userId:"e24574c6-1162-43b8-8bdf-99d30669c5ca"
                    },
                    orderBy:{
                        solvedAt:'desc'
                    },
                    take:1
                }
            }
        });
        

        if (!question) {
            return new Response("Question not found", { status: 404 });
        }
        let ActiveCooldown = 0;
        if (question.attempts.length > 0) {
            const lastAttempt = question.attempts[0];
            const cooldownEnds = new Date(lastAttempt.solvedAt.getTime() + ( 86400* 1000)); //24 hours Cooldown
            const now = new Date();

            if (cooldownEnds > now) {
                 ActiveCooldown = Math.ceil((cooldownEnds.getTime() - now.getTime()) / 1000);
            }
        }
        delete question.attempts;
        return new Response(JSON.stringify({ ...question, ActiveCooldown }), { status: 200 });
        
    } catch (error) {
        console.log("[Question-Dynamic] :", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}