import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";


export async function GET(req:Request){
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");

    try {
        const topics = await prisma.topic.findMany({
            where: subjectId ? { subjectId } : undefined,
            orderBy: {
                orderIndex: "asc"
            }
        });

        return jsonResponse(topics, {
            success: true,
            message: "Ok",
            status: 200
        });

    } catch (error) {
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
    }

}

export async function POST(req:Request){
    const body = await req.json();
    const { name, subjectId, weightage, slug, orderIndex, estimatedMinutes } = body;
    try {
        await prisma.topic.create({
            data: {
                name,
                subjectId,
                weightage,
                slug,
                orderIndex,
                estimatedMinutes
            },
        });
        return jsonResponse(null, { success: true, message: "Ok", status: 200 })
    } catch (error) {
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
    }
}
    
