import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { QCategory } from "@repo/db/enums";

export async function GET(req: Request, { params }: { params: { slug: string } }) {

    const { slug } = params;

    try {
        
        // if(!session){
        //     return jsonResponse(null,{success:false,message:"Unauthorized",status:401});
        // }
        const question = await prisma.question.findUnique({
            where: {
                slug
            },
            include: {
                options: true,
                topic: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                category: {
                    select: {
                        category: true
                    }
                }
            }
        });
        if (!question) {
            return jsonResponse(null, { success: false, message: "Question not found", status: 404 });
        }
        const formattedQuestion = {
            ...question,
            category: question?.category.map(cat => cat.category) || []
        };
        // let ActiveCooldown = 0;
        // if (question.attempts.length > 0) {
        //     const lastAttempt = question.attempts[0];
        //     const cooldownEnds = new Date(lastAttempt.solvedAt.getTime() + ( 43200* 1000)); //24 hours Cooldown
        //     const now = new Date();

        //     if (cooldownEnds > now) {
        //          ActiveCooldown = Math.ceil((cooldownEnds.getTime() - now.getTime()) / 1000);
        //     }
        // }
        // delete question.attempts;
        // { ...question, ActiveCooldown }
        return jsonResponse(formattedQuestion, { success: true, message: "Ok", status: 200 });

    } catch (error) {
        console.log("[Question-Dynamic] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
    }
}


export async function PUT(req: Request, { params }: { params: { slug: string } }) {
    const { slug } = params;
    const body = await req.json();
    try {
        await prisma.question.update({
            where: {
                slug
            },
            data: {
                ...body,

                options: {
                    deleteMany: {},
                    create: body.options?.map((option) => ({
                        content: option.content,
                        isCorrect: option.isCorrect,
                    })),
                },
                category: {
                    deleteMany: {},
                    create: body.category.map((category: QCategory) => ({
                        category: category,
                    })),
                },
            },
        });
        return jsonResponse(null, { success: true, message: "Ok", status: 200 });
    } catch (error) {
        console.error("[Question-Dynamic] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
    const { slug } = params;
    try {
        await prisma.question.delete({
            where: {
                slug
            }
        });
        return jsonResponse(null, { success: true, message: "Ok", status: 200 });
    } catch (error) {
        console.log("[Question-Dynamic] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
    }
}