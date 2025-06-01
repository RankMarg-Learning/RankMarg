import prisma from '@/lib/prisma';
import { jsonResponse } from '@/utils/api-response';
import { getAuthSession } from '@/utils/session';

export async function GET(req: Request) {
    try {
        // Parse URL and query parameters
        let url: URL;
        try {
            url = new URL(req.url);
        } catch (error) {
            console.error('Invalid URL:', error);
            return jsonResponse(null, { 
                success: false, 
                message: 'Invalid request URL', 
                status: 400 
            });
        }

        const subjectId = url.searchParams.get('subjectId');
        const topicId = url.searchParams.get('topicId');
        const includeCompleted = url.searchParams.get('includeCompleted') === 'true';
        const isCurrent = url.searchParams.get('isCurrent') === 'true';
        const uniqueSubjects = url.searchParams.get('uniqueSubjects') === 'true';

        // Handle authentication
        let session;
        try {
            session = await getAuthSession();
        } catch (error) {
            console.error('Authentication error:', error);
            return jsonResponse(null, { 
                success: false, 
                message: 'Authentication failed', 
                status: 401 
            });
        }

        const userId = session?.user?.id;
        if (!userId) {
            return jsonResponse(null, { 
                success: false, 
                message: 'Unauthorized - User ID is required', 
                status: 401 
            });
        }

        // Validate subjectId and topicId if provided
        if (subjectId && (isNaN(Number(subjectId)) || Number(subjectId) <= 0)) {
            return jsonResponse(null, { 
                success: false, 
                message: 'Invalid subjectId parameter', 
                status: 400 
            });
        }

        if (topicId && (isNaN(Number(topicId)) || Number(topicId) <= 0)) {
            return jsonResponse(null, { 
                success: false, 
                message: 'Invalid topicId parameter', 
                status: 400 
            });
        }

        if (uniqueSubjects) {
            let allTopics;
            try {
                allTopics = await prisma.currentStudyTopic.findMany({
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
            } catch (error) {
                console.error('Database error fetching unique subjects:', error);
                
                // Handle specific Prisma errors
                if (error.code === 'P2002') {
                    return jsonResponse(null, { 
                        success: false, 
                        message: 'Unique constraint violation', 
                        status: 409 
                    });
                }
                if (error.code === 'P2025') {
                    return jsonResponse(null, { 
                        success: false, 
                        message: 'Record not found', 
                        status: 404 
                    });
                }
                
                return jsonResponse(null, { 
                    success: false, 
                    message: 'Database error occurred', 
                    status: 500 
                });
            }

            if (!allTopics || allTopics.length === 0) {
                return jsonResponse([], { 
                    success: true, 
                    message: 'No study topics found', 
                    status: 200 
                });
            }

            try {
                const subjectMap = new Map();
                
                allTopics.forEach(item => {
                    // Validate required fields
                    if (!item.subject?.id || !item.subject?.name || !item.topic?.name) {
                        console.warn('Incomplete data for topic:', item.id);
                        return; // Skip this item
                    }

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

                const uniqueSubjectsResult = Array.from(subjectMap.values());
                
                return jsonResponse(uniqueSubjectsResult, { 
                    success: true, 
                    message: 'Unique subjects retrieved successfully', 
                    status: 200 
                });
            } catch (error) {
                console.error('Error processing unique subjects data:', error);
                return jsonResponse(null, { 
                    success: false, 
                    message: 'Error processing data', 
                    status: 500 
                });
            }
        }

        // Build where clause safely
        const where: any = {
            userId,
            ...(isCurrent && { isCurrent: true }),
            ...(includeCompleted === true ? {} : { isCompleted: false }),
        };

        // Add subjectId and topicId only if they're valid numbers
        if (subjectId) {
            where.subjectId = parseInt(subjectId, 10);
        }
        if (topicId) {
            where.topicId = parseInt(topicId, 10);
        }

        let currentStudyTopics;
        try {
            currentStudyTopics = await prisma.currentStudyTopic.findMany({
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
        } catch (error) {
            console.error('Database error fetching study topics:', error);
            
            // Handle specific Prisma errors
            if (error.code === 'P2002') {
                return jsonResponse(null, { 
                    success: false, 
                    message: 'Unique constraint violation', 
                    status: 409 
                });
            }
            if (error.code === 'P2025') {
                return jsonResponse(null, { 
                    success: false, 
                    message: 'Record not found', 
                    status: 404 
                });
            }
            
            return jsonResponse(null, { 
                success: false, 
                message: 'Database error occurred', 
                status: 500 
            });
        }

        if (!currentStudyTopics) {
            return jsonResponse([], { 
                success: true, 
                message: 'No study topics found', 
                status: 200 
            });
        }

        try {
            const transformedData = currentStudyTopics
                .filter(item => item.subject?.name && item.topic?.name) // Filter out incomplete data
                .map(item => ({
                    id: item.id,
                    isCurrent: item.isCurrent,
                    isCompleted: item.isCompleted,
                    startedAt: item.startedAt,
                    subjectName: item.subject.name,
                    topicName: item.topic.name
                }));

            return jsonResponse(transformedData, { 
                success: true, 
                message: 'Study topics retrieved successfully', 
                status: 200 
            });
        } catch (error) {
            console.error('Error transforming data:', error);
            return jsonResponse(null, { 
                success: false, 
                message: 'Error processing data', 
                status: 500 
            });
        }

    } catch (error) {
        // Catch any unexpected errors
        console.error('Unexpected error in GET /api/study-topics:', error);
        
        // Don't expose internal error details in production
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        return jsonResponse(null, { 
            success: false, 
            message: isDevelopment 
                ? `Internal Server Error: ${error.message}` 
                : 'Internal Server Error', 
            status: 500 
        });
    }
}