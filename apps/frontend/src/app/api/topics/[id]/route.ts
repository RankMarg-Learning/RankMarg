import prisma from "@/lib/prisma";

export async function GET(req: Request, {params} : { params: { id: string } }){
    const {id} = params;
    try {
        const subject = await prisma.topic.findUnique({
            where: { id }
        });
        if (!subject) return new Response("Topic not found", { status: 404 });
        return new Response(JSON.stringify(subject), { status: 200 })

    } catch (error) {
        return new Response("Internal Server Error", { status: 500 })
    }
}

export async function PUT(req: Request, {params} : { params: { id: string } }){
    const {id} = params;
    const body = await req.json();
    const { name,weightage } = body;
    try {
        const subject = await prisma.topic.update({
            where: { id },
            data: { name,weightage}
        });
        return new Response(JSON.stringify(subject), { status: 200 })

    } catch (error) {
        return new Response("Internal Server Error", { status: 500 })
    }
}

export async function DELETE(req: Request, {params} : { params: { id: string } }){
    const {id} = params;
    try {
        await prisma.topic.delete({
            where: { id }
        });
        return new Response("Topic deleted", { status: 200 })

    } catch (error) {
        return new Response("Internal Server Error", { status: 500 })
    }
}
