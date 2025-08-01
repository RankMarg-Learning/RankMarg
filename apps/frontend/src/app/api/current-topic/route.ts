import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";

export async function PUT(req: Request) {
    const { subjectId, topicId } = await req.json();
    try {
        const session = await getAuthSession()
        if (!session) {
            return jsonResponse(null, { success: false, message: "Unauthorized", status: 401 })
        }
        
        const userId = session.user.id;
        
        if (!subjectId || !topicId) {
            return jsonResponse(null, { success: false, message: "Missing subject or topic", status: 400 })
        }
        
        const existingCurrentTopic = await prisma.currentStudyTopic.findFirst({
            where: {
                userId,
                subjectId,
                topicId,
                isCurrent: true
            }
        });
        
        if (existingCurrentTopic) {
            return jsonResponse(null, { success: true, message: "This is already your current topic for this subject", status: 200 });
        }
        
        await prisma.$transaction([
            prisma.currentStudyTopic.updateMany({
                where: {
                    userId,
                    subjectId,
                    isCurrent: true,
                },
                data: {
                    isCurrent: false,
                    isCompleted: true,//? Make this as per live feedback (If more than one topic is current)
                },
            }),
            
            prisma.currentStudyTopic.upsert({
                where: {
                    userId_subjectId_topicId: { userId, subjectId, topicId },
                },
                update: {
                    isCurrent: true,
                    isCompleted: false,
                    startedAt: new Date(),
                },
                create: {
                    userId,
                    subjectId,
                    topicId,
                    isCurrent: true,
                    isCompleted: false,
                    startedAt: new Date(),
                },
            }),
        ]);
        
        return jsonResponse(null, { success: true, message: "Current topic updated successfully and previous topic marked as completed", status: 200 });
    } catch (error) {
        console.log("[Update Current Topic] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
    }
}