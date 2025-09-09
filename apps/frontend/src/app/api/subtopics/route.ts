//shifted to backend
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";

export async function GET(req: Request) {
    const {searchParams}  = new URL(req.url)
    const topicId = searchParams.get("topicId");
    try {
        
        const subtopics = await prisma.subTopic.findMany({
            where: topicId ? { topicId } : undefined,
            include: {
                topic: {
                    include: {
                        subject: true
                    }
                }
            },
            orderBy: {
                orderIndex: "asc"
            }
        });
        return jsonResponse(subtopics, { success: true, message: "Ok", status: 200 ,headers:{
            "Cache-Control": "public, max-age=60, stale-while-revalidate=60",
            Vary: "Authorization",
        }})

    } catch (error) {
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
    }
}

export async function POST(req: Request) {
    const { name, topicId, slug, orderIndex, estimatedMinutes } = await req.json();
    try {
        const subtopic = await prisma.subTopic.create({
            data: {
                name,
                topicId,
                slug,
                orderIndex,
                estimatedMinutes
            }
        });
        return jsonResponse(subtopic, { success: true, message: "Ok", status: 200 })
    } catch (error) {
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 })
    }
}