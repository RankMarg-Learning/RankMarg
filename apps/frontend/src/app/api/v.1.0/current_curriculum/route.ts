import prisma from '@/lib/prisma';
import { jsonResponse } from '@/utils/api-response';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('id');
        const subjectId = url.searchParams.get('subjectId');
        const topicId = url.searchParams.get('topicId');
        const includeCompleted = url.searchParams.get('includeCompleted') === 'true';
        const isCurrent = url.searchParams.get('isCurrent') === 'true';
        const uniqueSubjects = url.searchParams.get('uniqueSubjects') === 'true';

        if (!userId) {
            return jsonResponse(null, { success: false, message: 'User ID is required', status: 400 });
        }

        // Handle the unique subjects request separately
        if (uniqueSubjects) {
            // Get all study topics for the user
            const allTopics = await prisma.currentStudyTopic.findMany({
                where: {
                    userId,
                    ...(includeCompleted ? {} : { isCompleted: false }),
                },
                orderBy: {
                    startedAt: 'desc'
                },
                select: {
                    id: true,
                    isCurrent: true,
                    isCompleted: true,
                    startedAt: true,
                    subjectId: true,
                    subject: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    topic: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            // Create a map to track the most recent topic for each subject
            const subjectMap = new Map();
            
            // Populate the map with the most recent topic for each subject
            allTopics.forEach(item => {
                const subjectId = item.subject.id;
                
                if (!subjectMap.has(subjectId)) {
                    subjectMap.set(subjectId, {
                        id: item.id,
                        isCurrent: item.isCurrent,
                        isCompleted: item.isCompleted,
                        startedAt: item.startedAt,
                        subjectName: item.subject.name,
                        topicName: item.topic.name
                    });
                }
            });

            // Convert map to array
            const uniqueSubjectsResult = Array.from(subjectMap.values());
            
            return jsonResponse(uniqueSubjectsResult, { success: true, message: 'Ok', status: 200 });
        }

        // Regular query logic
        const where: any = {
            userId,
            ...(isCurrent && { isCurrent: true }),
            ...(subjectId && { subjectId }),
            ...(topicId && { topicId }),
            ...(includeCompleted === true ? {} : { isCompleted: false }),
        };

        const currentStudyTopics = await prisma.currentStudyTopic.findMany({
            where,
            select: {
                id: true,
                isCurrent: true,
                isCompleted: true,
                startedAt: true,
                subject: {
                    select: {
                        name: true
                    }
                },
                topic: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                startedAt: 'desc'
            }
        });

        const transformedData = currentStudyTopics.map(item => ({
            id: item.id,
            isCurrent: item.isCurrent,
            isCompleted: item.isCompleted,
            startedAt: item.startedAt,
            subjectName: item.subject.name,
            topicName: item.topic.name
        }));

        return jsonResponse(transformedData, { success: true, message: 'Ok', status: 200 });
    } catch (error) {
        console.error('Error fetching current study topics:', error);
        return jsonResponse(null, { success: false, message: 'Internal Server Error', status: 500 });
    }
}