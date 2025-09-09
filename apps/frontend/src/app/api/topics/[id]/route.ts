//shifted to backend
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";

export async function GET(req: Request, {params} : { params: { id: string } }){
    const {id} = params;
    try {
        const topic = await prisma.topic.findUnique({
            where: { id }
        });
        if (!topic) return jsonResponse(null, { success: false, message: "Topic not found", status: 404 });
        return jsonResponse(topic, { success: true, message: "Ok", status: 200 ,headers:{
            "Cache-Control": "public, max-age=60, stale-while-revalidate=60",
            Vary: "Authorization",
        }})

    } catch (error) {
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
    }
}

export async function PUT(req: Request, {params} : { params: { id: string } }){
    const {id} = params;
    const body = await req.json();
    const { name, subjectId, weightage, slug, orderIndex, estimatedMinutes } = body;
    try {
        const topic = await prisma.topic.update({
            where: { id },
            data: { name, subjectId, weightage, slug, orderIndex, estimatedMinutes }
        });
        return jsonResponse(topic, { success: true, message: "Ok", status: 200 })

    } catch (error) {
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
    }
}

export async function DELETE(req: Request, {params} : { params: { id: string } }){
    const {id} = params;
    try {
        await prisma.topic.delete({
            where: { id }
        });
        return jsonResponse(null, { success: true, message: "Topic deleted", status: 200 })

    } catch (error) {
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
    }
}
