import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";

export async function POST(req: Request) {
    const { stream, gradeLevel, targetYear, studyHoursPerDay, selectedTopics } = await req.json();
    try {
        const session = await getAuthSession()
        if (!session) {
            return jsonResponse(null, { success: false, message: "Unauthorized", status: 401 });
        }

        // Update basic user information
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                stream,
                standard: gradeLevel,
                targetYear,
                studyHoursPerDay,
                onboardingCompleted:true,
            },
        });
        
        // Handle selected topics
        if (selectedTopics && Array.isArray(selectedTopics) && selectedTopics.length > 0) {
            // Get topic data in a single query to reduce database calls
            const topicIds = selectedTopics.map(topic => topic.id);
            const topicsData = await prisma.topic.findMany({
                where: { id: { in: topicIds } },
                select: { id: true, subjectId: true }
            });
            
            // Create a map for quick lookups
            const topicSubjectMap = Object.fromEntries(
                topicsData.map(topic => [topic.id, topic.subjectId])
            );
            
            // Prepare data for bulk create
            const currentStudyTopicsData = selectedTopics
                .filter(topic => topicSubjectMap[topic.id]) // Ensure we have subject ID
                .map(topic => ({
                    userId: session.user.id,
                    subjectId: topicSubjectMap[topic.id],
                    topicId: topic.id,
                    isCurrent: false, // Not current
                    isCompleted: true, // Mark as completed
                    startedAt: new Date()
                }));
            
            // First delete any existing entries to avoid conflicts with @@unique constraint
            if (currentStudyTopicsData.length > 0) {
                await prisma.currentStudyTopic.deleteMany({
                    where: { 
                        userId: session.user.id,
                        topicId: { in: topicIds }
                    }
                });
                
                // Create all entries in a single database call
                await prisma.currentStudyTopic.createMany({
                    data: currentStudyTopicsData
                });
            }
        }
        
        // Return success response
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