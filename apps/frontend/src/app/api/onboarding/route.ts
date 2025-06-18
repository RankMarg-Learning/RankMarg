import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";

export async function POST(req: Request) {
    const {phone, stream, gradeLevel, targetYear, studyHoursPerDay, selectedTopics } = await req.json();
    try {
        const session = await getAuthSession()
        if (!session) {
            return jsonResponse(null, { success: false, message: "Unauthorized", status: 401 });
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                phone: phone || null,
                stream,
                standard: gradeLevel,
                targetYear,
                studyHoursPerDay,
                onboardingCompleted:true,
            },
        });
        
        if (selectedTopics && Array.isArray(selectedTopics) && selectedTopics.length > 0) {
            const topicIds = selectedTopics.map(topic => topic.id);
            const topicsData = await prisma.topic.findMany({
                where: { id: { in: topicIds } },
                select: { id: true, subjectId: true }
            });
            
            const topicSubjectMap = Object.fromEntries(
                topicsData.map(topic => [topic.id, topic.subjectId])
            );
            
            const currentStudyTopicsData = selectedTopics
                .filter(topic => topicSubjectMap[topic.id]) 
                .map(topic => ({
                    userId: session.user.id,
                    subjectId: topicSubjectMap[topic.id],
                    topicId: topic.id,
                    isCurrent: true, 
                    isCompleted: false, 
                    startedAt: new Date()
                }));
            
            if (currentStudyTopicsData.length > 0) {
                await prisma.currentStudyTopic.deleteMany({
                    where: { 
                        userId: session.user.id,
                        topicId: { in: topicIds }
                    }
                });
                
                await prisma.currentStudyTopic.createMany({
                    data: currentStudyTopicsData
                });
            }
        }
        
        return jsonResponse(null, { 
            success: true, 
            message: "Onboarding information saved successfully" 
        });

    } catch (error) {
        console.error("[ONBOARDING] API:", error);
        return jsonResponse(null, { 
            success: false, 
            message: "Internal server error", 
            status: 500 
        });
    }
}