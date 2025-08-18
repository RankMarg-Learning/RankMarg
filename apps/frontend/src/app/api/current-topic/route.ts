import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const subjectId = searchParams.get("subjectId");

        const session = await getAuthSession();
        if (!session) {
            return jsonResponse(null, { success: false, message: "Unauthorized", status: 401 });
        }

        const userId = session.user.id;

        const topics = await prisma.currentStudyTopic.findMany({
            where: {
                userId,
                ...(subjectId ? { subjectId } : {}),
            },
            select: {
                topicId: true,
                isCurrent: true,
                isCompleted: true,
            },
            orderBy: { startedAt: "desc" },
        });

        return jsonResponse(topics, { success: true, message: "Ok", status: 200 });
    } catch (error) {
        console.log("[Get Current Topic States] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
    }
}

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
        
        // Enforce per-subject max current topics = 2
        const currentCountForSubject = await prisma.currentStudyTopic.count({
            where: { userId, subjectId, isCurrent: true }
        });

        // If already at cap and the target isn't already current, reject
        const isTargetAlreadyCurrent = await prisma.currentStudyTopic.findUnique({
            where: { userId_subjectId_topicId: { userId, subjectId, topicId } },
            select: { isCurrent: true }
        });

        if (currentCountForSubject >= 2 && !isTargetAlreadyCurrent?.isCurrent) {
            return jsonResponse(null, { success: false, message: "You can have at most 2 current topics in this subject.", status: 400 });
        }

        // Upsert the selected topic as current without demoting others
        await prisma.currentStudyTopic.upsert({
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
        });

        return jsonResponse(null, { success: true, message: "Current topic updated successfully.", status: 200 });
    } catch (error) {
        console.log("[Update Current Topic] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { subjectId, topicId, isCompleted } = await req.json();

        const session = await getAuthSession();
        if (!session) {
            return jsonResponse(null, { success: false, message: "Unauthorized", status: 401 });
        }

        const userId = session.user.id;

        if (!subjectId || !topicId || typeof isCompleted !== "boolean") {
            return jsonResponse(null, { success: false, message: "Missing subject, topic, or isCompleted flag", status: 400 });
        }

        await prisma.currentStudyTopic.upsert({
            where: {
                userId_subjectId_topicId: { userId, subjectId, topicId },
            },
            update: {
                isCompleted,
                ...(isCompleted ? { isCurrent: false } : {}),
            },
            create: {
                userId,
                subjectId,
                topicId,
                isCurrent: false,
                isCompleted,
                startedAt: new Date(),
            },
        });

        return jsonResponse(null, { success: true, message: isCompleted ? "Marked as completed" : "Marked as not completed", status: 200 });
    } catch (error) {
        console.log("[Patch Current Topic] :", error);
        return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
    }
}