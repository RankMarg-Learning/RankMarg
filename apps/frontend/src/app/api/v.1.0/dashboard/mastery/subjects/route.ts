export const dynamic = 'force-dynamic';

import { Stream } from "@prisma/client";
import { unstable_cache } from 'next/cache';
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import {
    generateChemistryRecommendationByMastery,
    generateMathematicsRecommendationByMastery,
    generatePhysicsRecommendationByMastery
} from "@/constant/recommendation/master.recommendation.constant";
import { Recommendation } from "@/types/recommendation.types";
import { getAuthSession } from "@/utils/session";

interface SubjectMasteryResponse {
    id: string;
    name: string;
    masteryPercentage: number;
    concepts: {
        mastered: number;
        total: number;
    };
    improvementFromLastMonth: number;
    improvementAreas: Array<{
        name: string;
        masteryLevel: number;
    }>;
    topPerformingTopics: Array<{
        name: string;
        masteryLevel: number;
    }>;
    recommendations: Recommendation[];
}

function generateRecommendations(
    subjectName: string,
    topicData: Array<{ name: string; masteryLevel: number }>,
    topicName: string
): Recommendation {
    try {
        const masteryLevel = topicData.find(t => t.name === topicName)?.masteryLevel || 0;

        switch (subjectName.toLowerCase()) {
            case "physics":
                return generatePhysicsRecommendationByMastery(topicName, masteryLevel);

            case "chemistry":
                return generateChemistryRecommendationByMastery(topicName, masteryLevel);

            case "mathematics":
                return generateMathematicsRecommendationByMastery(topicName, masteryLevel);

            case "biology":
                return generateChemistryRecommendationByMastery(topicName, masteryLevel);

            default:
                return {
                    icon: "info",
                    color: "gray",
                    type: "default",
                    message: `No specific recommendations available for **${subjectName}**. Keep practicing!`
                };
        }
    } catch (error) {
        console.error(`Error generating recommendations for ${subjectName}:`, error);
        return {
            icon: "info",
            color: "gray",
            type: "default",
            message: `Unable to generate recommendations for **${subjectName}**. Please try again later.`
        };
    }
}

const getSubjectMasteryData = unstable_cache(
    async (
        userId: string,
        stream: Stream,
        improvementAreasCount: number,
        topPerformingCount: number
    ): Promise<SubjectMasteryResponse[]> => {
        if (!userId) {
            throw new Error("User ID is required");
        }

        if (!stream) {
            throw new Error("Stream is required");
        }

        return await prisma.$transaction(async (tx) => {
            try {
                const [subjects, allSubjectMasteries, allTopicMasteries, allSubTopics] = await Promise.all([
                    tx.subject.findMany({
                        where: { stream },
                        select: { id: true, name: true }
                    }),
                    tx.subjectMastery.findMany({
                        where: { userId },
                        select: {
                            subjectId: true,
                            masteryLevel: true,
                            totalAttempts: true,
                            correctAttempts: true
                        }
                    }),
                    tx.topicMastery.findMany({
                        where: { userId },
                        select: {
                            topicId: true,
                            masteryLevel: true,
                            strengthIndex: true,
                            topic: {
                                select: {
                                    id: true,
                                    name: true,
                                    subjectId: true
                                }
                            }
                        }
                    }),
                    tx.subtopicMastery.findMany({
                        where: { userId },
                        select: {
                            subtopicId: true,
                            masteryLevel: true,
                            subtopic: {
                                select: {
                                    name: true,
                                    topicId: true
                                }
                            }
                        }
                    })
                ]);

                const previousMonthDate = new Date();
                previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

                const [previousMasteries, topicsPerSubject] = await Promise.all([
                    tx.masteryHistory.findMany({
                        where: {
                            userId,
                            recordedAt: { lt: previousMonthDate }
                        },
                        orderBy: { recordedAt: 'desc' },
                        distinct: ['subjectId'],
                        select: {
                            subjectId: true,
                            masteryLevel: true
                        }
                    }),
                    tx.topic.groupBy({
                        by: ['subjectId'],
                        _count: { id: true }
                    })
                ]);

                // Create maps for efficient lookups
                const subjectMasteriesMap = new Map(
                    allSubjectMasteries.map(sm => [sm.subjectId, sm])
                );

                const previousMasteriesMap = new Map(
                    previousMasteries.map(pm => [pm.subjectId, pm])
                );

                const topicsCountMap = new Map(
                    topicsPerSubject.map(t => [t.subjectId, t._count.id])
                );

                const topicMasteriesBySubject = new Map<string, Array<{
                    id: string;
                    name: string;
                    masteryLevel: number;
                    strengthIndex: number;
                }>>();

                // Group topic masteries by subject
                allTopicMasteries.forEach(tm => {
                    const subjectId = tm.topic.subjectId;
                    if (!topicMasteriesBySubject.has(subjectId)) {
                        topicMasteriesBySubject.set(subjectId, []);
                    }
                    topicMasteriesBySubject.get(subjectId)?.push({
                        id: tm.topic.id,
                        name: tm.topic.name,
                        masteryLevel: tm.masteryLevel,
                        strengthIndex: tm.strengthIndex
                    });
                });

                const subtopicsByTopic = new Map<string, Array<{
                    name: string;
                    masteryLevel: number;
                }>>();

                // Group subtopics by topic
                allSubTopics.forEach(stm => {
                    const topicId = stm.subtopic.topicId;
                    if (!subtopicsByTopic.has(topicId)) {
                        subtopicsByTopic.set(topicId, []);
                    }
                    subtopicsByTopic.get(topicId)?.push({
                        name: stm.subtopic.name,
                        masteryLevel: stm.masteryLevel
                    });
                });

                return subjects.map(subject => {
                    try {
                        const subjectId = subject.id;
                        const subjectMastery = subjectMasteriesMap.get(subjectId) || { masteryLevel: 0 };
                        const previousMastery = previousMasteriesMap.get(subjectId);
                        const topicCount = topicsCountMap.get(subjectId) || 0;

                        const subjectTopics = topicMasteriesBySubject.get(subjectId) || [];
                        const masteryLevel = Math.max(0, Math.min(100, subjectMastery.masteryLevel || 0));
                        const improvementPercentage = previousMastery
                            ? masteryLevel - previousMastery.masteryLevel
                            : 0;

                        const conceptsPerTopic = 10;
                        const totalConcepts = Math.max(0, topicCount * conceptsPerTopic);
                        const conceptsMastered = Math.round((masteryLevel / 100) * totalConcepts);

                        const sortedByMastery = [...subjectTopics].sort((a, b) => a.masteryLevel - b.masteryLevel);
                        const weakestTopics = sortedByMastery.slice(0, Math.max(0, improvementAreasCount));
                        const strongestTopics = [...subjectTopics]
                            .sort((a, b) => b.masteryLevel - a.masteryLevel)
                            .slice(0, Math.max(0, topPerformingCount));

                        const recommendations: Recommendation[] = [];

                        // Generate recommendations for weakest topic
                        if (weakestTopics.length > 0) {
                            const weakestTopic = weakestTopics[0];
                            const recommendation = generateRecommendations(
                                subject.name,
                                weakestTopics.map(t => ({ name: t.name, masteryLevel: t.masteryLevel })),
                                weakestTopic.name
                            );
                            recommendations.push(recommendation);
                        }

                        // Generate recommendations for strongest topic (if different from weakest)
                        if (strongestTopics.length > 0 && 
                            (!weakestTopics.length || strongestTopics[0].id !== weakestTopics[0].id)) {
                            const strongestTopic = strongestTopics[0];
                            const recommendation = generateRecommendations(
                                subject.name,
                                strongestTopics.map(t => ({ name: t.name, masteryLevel: t.masteryLevel })),
                                strongestTopic.name
                            );
                            recommendations.push(recommendation);
                        }

                        return {
                            id: subjectId,
                            name: subject.name,
                            masteryPercentage: masteryLevel,
                            concepts: {
                                mastered: conceptsMastered,
                                total: totalConcepts
                            },
                            improvementFromLastMonth: improvementPercentage,
                            improvementAreas: weakestTopics.map(t => ({
                                name: t.name,
                                masteryLevel: Math.max(0, Math.min(100, t.masteryLevel))
                            })),
                            topPerformingTopics: strongestTopics.map(t => ({
                                name: t.name,
                                masteryLevel: Math.max(0, Math.min(100, t.masteryLevel))
                            })),
                            recommendations: recommendations.slice(0, 2)
                        };
                    } catch (error) {
                        console.error(`Error processing subject ${subject.name}:`, error);
                        // Return a safe default for this subject
                        return {
                            id: subject.id,
                            name: subject.name,
                            masteryPercentage: 0,
                            concepts: {
                                mastered: 0,
                                total: 0
                            },
                            improvementFromLastMonth: 0,
                            improvementAreas: [],
                            topPerformingTopics: [],
                            recommendations: []
                        };
                    }
                });
            } catch (error) {
                console.error("Database transaction error:", error);
                throw new Error("Failed to fetch mastery data from database");
            }
        }, {
            isolationLevel: 'ReadCommitted',
            timeout: 30000 // 30 second timeout
        });
    },
    ['subject-mastery-data-v2'],
    { revalidate: 300, tags: ['subject-mastery'] }
);

export async function GET(req: Request) {
    const startTime = Date.now();
    
    try {
        const url = new URL(req.url);
        let userId = url.searchParams.get('userId');
        
        // Validate and sanitize query parameters
        const improvementAreasCountParam = url.searchParams.get('improvementAreasCount');
        const topPerformingCountParam = url.searchParams.get('topPerformingCount');
        
        const improvementAreasCount = improvementAreasCountParam 
            ? Math.max(1, Math.min(10, parseInt(improvementAreasCountParam))) 
            : 2;
        const topPerformingCount = topPerformingCountParam 
            ? Math.max(1, Math.min(10, parseInt(topPerformingCountParam))) 
            : 3;

        // Check for NaN values
        if (isNaN(improvementAreasCount) || isNaN(topPerformingCount)) {
            return jsonResponse(null, { 
                success: false, 
                message: "Invalid query parameters. improvementAreasCount and topPerformingCount must be valid numbers.", 
                status: 400 
            });
        }

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

        userId = session?.user?.id || userId;
        const stream = session?.user?.stream as Stream;

        if (!userId) {
            return jsonResponse(null, { 
                success: false, 
                message: "User ID is required. Please provide userId parameter or ensure you are authenticated.", 
                status: 400 
            });
        }

        if (!stream && session) {
            return jsonResponse(null, { 
                success: false, 
                message: "User stream not found. Please ensure your profile is complete.", 
                status: 400 
            });
        }

        if (!session && !userId) {
            return jsonResponse(null, { 
                success: false, 
                message: "Unauthorized. Please log in or provide a valid userId.", 
                status: 401 
            });
        }

        console.time('subject-mastery-fetch');
        
        let subjectMasteryData;
        try {
            subjectMasteryData = await getSubjectMasteryData(
                userId,
                stream,
                improvementAreasCount,
                topPerformingCount
            );
        } catch (error) {
            console.timeEnd('subject-mastery-fetch');
            console.error("Error fetching subject mastery data:", error);
            
            if (error instanceof Error) {
                if (error.message.includes("User ID is required") || error.message.includes("Stream is required")) {
                    return jsonResponse(null, {
                        success: false,
                        message: error.message,
                        status: 400
                    });
                }
                
                if (error.message.includes("database") || error.message.includes("connection")) {
                    return jsonResponse(null, {
                        success: false,
                        message: "Database connection error. Please try again later.",
                        status: 503
                    });
                }
            }
            
            return jsonResponse(null, {
                success: false,
                message: "Failed to fetch subject mastery data. Please try again later.",
                status: 500
            });
        }
        
        console.timeEnd('subject-mastery-fetch');
        
        const executionTime = Date.now() - startTime;
        console.log(`Subject mastery API executed in ${executionTime}ms`);

        return jsonResponse(subjectMasteryData, {
            success: true,
            message: "Subject mastery data fetched successfully",
            status: 200,
            
        });
        
    } catch (error) {
        const executionTime = Date.now() - startTime;
        console.error(`[Subject Mastery API Error - ${executionTime}ms]:`, error);
        
        if (error instanceof SyntaxError) {
            return jsonResponse(null, {
                success: false,
                message: "Invalid request format",
                status: 400
            });
        }
        
        if (error instanceof TypeError && error.message.includes('URL')) {
            return jsonResponse(null, {
                success: false,
                message: "Invalid request URL",
                status: 400
            });
        }
        
        return jsonResponse(null, {
            success: false,
            message: "Internal Server Error. Please try again later.",
            status: 500,
            
        });
    }
}