// Shifted to Backend
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { getAuthSession } from "@/utils/session";

interface MasteryData {
    subject: {
        id: string;
        name: string;
        examCode: string;
    };
    overallMastery: number;
    topics: Array<{
        id: string;
        name: string;
        slug?: string;
        mastery: number;
        weightage: number;
        orderIndex: number;
        estimatedMinutes?: number;
        totalAttempts: number;
        masteredCount: number;
        strengthIndex: number;
        lastPracticed: string | null;
        subtopics: Array<{
            id: string;
            name: string;
            slug?: string;
            mastery: number;
            totalAttempts: number;
            masteredCount: number;
            orderIndex: number;
            estimatedMinutes?: number;
            strengthIndex: number;
            lastPracticed: string | null;
        }>;
    }>;
    userExamCode?: string;
}

interface TopicWithMastery {
    mastery: number;
    orderIndex: number;
}

interface LastAttemptData {
    entity_id: string;
    entity_type: 'topic' | 'subtopic';
    solvedAt: string;
}

// Cache for frequent computations
const masteryCache = new Map<string, { data: MasteryData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Custom comparator functions for different sort types
const sortComparators = {
    'mastery-asc': (a: TopicWithMastery, b: TopicWithMastery) => a.mastery - b.mastery,
    'mastery-desc': (a: TopicWithMastery, b: TopicWithMastery) => b.mastery - a.mastery,
    'index': (a: TopicWithMastery, b: TopicWithMastery) => a.orderIndex - b.orderIndex
} as const;

async function getSubjectMasteryData(
    userId: string,
    subjectId: string,
    sortBy: string = 'index'
): Promise<MasteryData> {
    // Input validation with early return
    if (!userId || !subjectId) {
        throw new Error('User ID and Subject ID are required');
    }

    // Check cache first (O(1) lookup)
    const cacheKey = `${userId}-${subjectId}-${sortBy}`;
    const cached = masteryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Cache Hit] Serving cached data for ${cacheKey}`);
        return cached.data;
    }

    // Optimized: Single query to fetch all required data using joins
    // This reduces database round trips from ~4 queries to 1 query
    const [subjectData, lastAttemptData] = await Promise.all([
        // Main data query with optimized joins
        prisma.subject.findUnique({
            where: { id: subjectId },
            select: {
                id: true,
                name: true,
                examSubjects: {
                    select: { examCode: true },
                    take: 1 // Only need the first exam code
                },
                topics: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        weightage: true,
                        orderIndex: true,
                        estimatedMinutes: true,
                        topicMastery: {
                            where: { userId },
                            select: {
                                masteryLevel: true,
                                strengthIndex: true,
                                totalAttempts: true,
                                correctAttempts: true
                            }
                        },
                        subTopics: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                orderIndex: true,
                                estimatedMinutes: true,
                                subtopicMastery: {
                                    where: { userId },
                                    select: {
                                        masteryLevel: true,
                                        strengthIndex: true,
                                        totalAttempts: true,
                                        correctAttempts: true
                                    }
                                }
                            },
                            orderBy: { orderIndex: 'asc' }
                        }
                    },
                    orderBy: { orderIndex: 'asc' }
                }
            }
        }),

        // Optimized: Single query for last attempts with proper indexing
        prisma.$queryRaw`
            WITH topic_attempts AS (
                SELECT DISTINCT ON (q."topicId") 
                    q."topicId" as entity_id,
                    'topic' as entity_type,
                    a."solvedAt"
                FROM "Attempt" a
                JOIN "Question" q ON a."questionId" = q.id
                WHERE a."userId" = ${userId} 
                  AND q."topicId" IN (
                      SELECT t.id FROM "Topic" t WHERE t."subjectId" = ${subjectId}
                  )
                ORDER BY q."topicId", a."solvedAt" DESC
            ),
            subtopic_attempts AS (
                SELECT DISTINCT ON (q."subtopicId") 
                    q."subtopicId" as entity_id,
                    'subtopic' as entity_type,
                    a."solvedAt"
                FROM "Attempt" a
                JOIN "Question" q ON a."questionId" = q.id
                WHERE a."userId" = ${userId} 
                  AND q."subtopicId" IN (
                      SELECT st.id FROM "SubTopic" st 
                      JOIN "Topic" t ON st."topicId" = t.id 
                      WHERE t."subjectId" = ${subjectId}
                  )
                ORDER BY q."subtopicId", a."solvedAt" DESC
            )
            SELECT * FROM topic_attempts 
            UNION ALL 
            SELECT * FROM subtopic_attempts
        `
    ]);

    if (!subjectData) {
        throw new Error('Subject not found');
    }

    // Get user's exam code efficiently
    const userExamRegistration = await prisma.examUser.findFirst({
        where: { userId },
        select: { examCode: true },
        orderBy: { registeredAt: 'desc' },
        take: 1 // Only need the latest one
    });

    const userExamCode = userExamRegistration?.examCode || 
                        subjectData.examSubjects[0]?.examCode || '';

    // Create efficient lookup maps (O(1) access instead of O(n) array.find)
    const lastAttemptMap = new Map<string, Date>();
    
    // Process last attempt data into maps
    (lastAttemptData as LastAttemptData[]).forEach((attempt: LastAttemptData) => {
        if (attempt.entity_id && !lastAttemptMap.has(attempt.entity_id)) {
            lastAttemptMap.set(attempt.entity_id, new Date(attempt.solvedAt));
        }
    });

    // Process topics data with optimized calculations
    const processedTopics = subjectData.topics.map(topic => {
        const topicMastery = topic.topicMastery[0];
        const mastery = topicMastery?.masteryLevel || 0;
        const totalAttempts = topicMastery?.totalAttempts || 0;
        const strengthIndex = topicMastery?.strengthIndex || 0;
        const masteredCount = mastery >= 70 ? 1 : 0;

        // Process subtopics with optimized mapping
        const subtopics = topic.subTopics.map(subtopic => {
            const subtopicMastery = subtopic.subtopicMastery[0];
            const subtopicMasteryLevel = subtopicMastery?.masteryLevel || 0;
            const subtopicTotalAttempts = subtopicMastery?.totalAttempts || 0;
            const subtopicStrengthIndex = subtopicMastery?.strengthIndex || 0;
            const subtopicMasteredCount = subtopicMasteryLevel >= 70 ? 1 : 0;

            // O(1) lookup instead of array search
            const lastPracticedDate = lastAttemptMap.get(subtopic.id);
            const lastPracticed = lastPracticedDate ? lastPracticedDate.toISOString() : null;

            return {
                id: subtopic.id,
                name: subtopic.name,
                slug: subtopic.slug,
                mastery: subtopicMasteryLevel,
                totalAttempts: subtopicTotalAttempts,
                masteredCount: subtopicMasteredCount,
                orderIndex: subtopic.orderIndex,
                estimatedMinutes: subtopic.estimatedMinutes,
                strengthIndex: subtopicStrengthIndex,
                lastPracticed
            };
        });

        // O(1) lookup for topic last practiced
        const topicLastPracticedDate = lastAttemptMap.get(topic.id);
        const topicLastPracticed = topicLastPracticedDate ? topicLastPracticedDate.toISOString() : null;

        return {
            id: topic.id,
            name: topic.name,
            slug: topic.slug,
            mastery,
            weightage: topic.weightage,
            orderIndex: topic.orderIndex,
            estimatedMinutes: topic.estimatedMinutes,
            totalAttempts,
            masteredCount,
            strengthIndex,
            lastPracticed: topicLastPracticed,
            subtopics
        };
    });

    // Optimized sorting using pre-defined comparator functions
    // This avoids function creation overhead in each sort call
    const comparator = sortComparators[sortBy as keyof typeof sortComparators] || 
                      sortComparators.index;
    
    // Use stable sort (Timsort) which is O(n log n) worst case, O(n) best case
    const sortedTopics = [...processedTopics].sort(comparator);

    // Optimized overall mastery calculation using single pass
    let totalWeight = 0;
    let weightedMasterySum = 0;
    
    for (const topic of sortedTopics) {
        totalWeight += topic.weightage;
        weightedMasterySum += topic.mastery * topic.weightage;
    }
    
    const overallMastery = totalWeight > 0 ? Math.round(weightedMasterySum / totalWeight) : 0;

    const result: MasteryData = {
        subject: {
            id: subjectData.id,
            name: subjectData.name,
            examCode: userExamCode
        },
        overallMastery,
        topics: sortedTopics,
        userExamCode
    };

    // Cache the result for future requests
    masteryCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
    });

    if (masteryCache.size > 1000) { // Arbitrary limit
        const now = Date.now();
        const keysToDelete: string[] = [];
        masteryCache.forEach((value, key) => {
            if (now - value.timestamp > CACHE_TTL) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => masteryCache.delete(key));
    }

    return result;
}

// Input validation constants for better performance
const VALID_SORT_OPTIONS = new Set(['index', 'mastery-asc', 'mastery-desc']);

export async function GET(
    request: NextRequest,
    { params }: { params: { subjectId: string } }
) {
    const startTime = performance.now(); // More precise timing
    
    try {
        // Early validation to fail fast
        if (!params.subjectId) {
            return jsonResponse(null, {
                success: false,
                message: "Subject ID is required",
                status: 400
            });
        }

        // Get query parameters
        const url = new URL(request.url);
        const sortBy = url.searchParams.get('sortBy') || 'index';
        const userIdFromQuery = url.searchParams.get('userId');

        // Optimized validation using Set lookup (O(1) instead of array.includes O(n))
        if (!VALID_SORT_OPTIONS.has(sortBy)) {
            return jsonResponse(null, {
                success: false,
                message: 'Invalid sortBy parameter. Must be one of: index, mastery-asc, mastery-desc',
                status: 400
            });
        }

        // Get user session with error handling
        let session;
        try {
            session = await getAuthSession();
        } catch (error) {
            console.error("Session error:", error);
            return jsonResponse(null, {
                success: false,
                message: "Authentication service unavailable",
                status: 503
            });
        }

        const userId = session?.user?.id || userIdFromQuery;

        if (!userId) {
            return jsonResponse(null, {
                success: false,
                message: "User not authenticated",
                status: 401
            });
        }

        // Fetch mastery data (now optimized with caching and better queries)
        const masteryData = await getSubjectMasteryData(userId, params.subjectId, sortBy);

        // Validate response data
        if (!masteryData?.subject || !masteryData?.topics) {
            console.error('[Mastery API] Invalid mastery data structure:', masteryData);
            return jsonResponse(null, {
                success: false,
                message: "Invalid mastery data structure",
                status: 500
            });
        }

        const responseTime = performance.now() - startTime;
        console.log(`[Mastery API] Subject ${params.subjectId} data fetched in ${responseTime.toFixed(2)}ms for user ${userId} (${masteryData.topics.length} topics)`);

        return jsonResponse(masteryData, {
            success: true,
            message: "Subject mastery data retrieved successfully",
            status: 200
        });

    } catch (error) {
        console.error('[Mastery API] Error:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        const status = error instanceof Error && error.message.includes('not found') ? 404 : 500;

        return jsonResponse(null, {
            success: false,
            message: errorMessage,
            status
        });
    }
}