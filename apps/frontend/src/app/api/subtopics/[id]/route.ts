//shifted to backend
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";


export async function GET(req: Request, {params} : { params: { id: string } }){
    const {id} = params;
    try {

        const subtopics = await prisma.subTopic.findUnique(
            {where: {id}}
        )
        if(!subtopics) return jsonResponse(null, { success: false, message: "Subtopic not found", status: 404 })
        return jsonResponse(subtopics, { success: true, message: "Ok", status: 200 ,headers:{
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
    const { name, topicId, slug, orderIndex, estimatedMinutes } = body;
    try {
        const subtopics = await prisma.subTopic.update({
            where: { id },
            data: { name, topicId, slug, orderIndex, estimatedMinutes }
        });
        return jsonResponse(subtopics, { success: true, message: "Ok", status: 200 })

    } catch (error) {
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
    }
}

export async function DELETE(req: Request, {params} : { params: { id: string } }){
    const {id} = params;
    try {
        
        await prisma.subTopic.delete({
            where: { id }
        });
        return jsonResponse(null, { success: true, message: "Ok", status: 200 })
    } catch (error) {
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
    }
}