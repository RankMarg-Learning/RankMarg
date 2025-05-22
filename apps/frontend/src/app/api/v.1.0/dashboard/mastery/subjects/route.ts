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
}

const getSubjectMasteryData = unstable_cache(
    async (
        userId: string,
        stream: Stream,
        improvementAreasCount: number,
        topPerformingCount: number
    ): Promise<SubjectMasteryResponse[]> => {
        return await prisma.$transaction(async (tx) => {
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

            const previousMasteries = await tx.masteryHistory.findMany({
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
            });

            const topicsPerSubject = await tx.topic.groupBy({
                by: ['subjectId'],
                _count: { id: true }
            });

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
                const subjectId = subject.id;
                const subjectMastery = subjectMasteriesMap.get(subjectId) || { masteryLevel: 0 };
                const previousMastery = previousMasteriesMap.get(subjectId);
                const topicCount = topicsCountMap.get(subjectId) || 0;

                const subjectTopics = topicMasteriesBySubject.get(subjectId) || [];
                const masteryLevel = subjectMastery.masteryLevel || 0;
                const improvementPercentage = previousMastery
                    ? masteryLevel - previousMastery.masteryLevel
                    : 0;

                const conceptsPerTopic = 10;
                const totalConcepts = topicCount * conceptsPerTopic;
                const conceptsMastered = Math.round((masteryLevel / 100) * totalConcepts);

                const sortedByMastery = [...subjectTopics].sort((a, b) => a.masteryLevel - b.masteryLevel);
                const weakestTopics = sortedByMastery.slice(0, improvementAreasCount);
                const strongestTopics = [...subjectTopics].sort((a, b) => b.masteryLevel - a.masteryLevel).slice(0, topPerformingCount);

                const recommendations: Recommendation[] = [];

                if (weakestTopics.length > 0) {
                    const weakestTopic = weakestTopics[0];
                    recommendations.push(
                        generateRecommendations(
                            subject.name,
                            weakestTopics.map(t => ({ name: t.name, masteryLevel: t.masteryLevel })),
                            weakestTopic.name
                        )
                    );
                }

                if (strongestTopics.length > 0 && (!weakestTopics.length || strongestTopics[0].id !== weakestTopics[0].id)) {
                    const strongestTopic = strongestTopics[0];
                    recommendations.push(
                        generateRecommendations(
                            subject.name,
                            strongestTopics.map(t => ({ name: t.name, masteryLevel: t.masteryLevel })),
                            strongestTopic.name
                        )
                    );
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
                        masteryLevel: t.masteryLevel
                    })),
                    topPerformingTopics: strongestTopics.map(t => ({
                        name: t.name,
                        masteryLevel: t.masteryLevel
                    })),
                    recommendations: recommendations.slice(0, 2)
                };
            });
        }, {
            isolationLevel: 'ReadCommitted'
        });
    },
    ['subject-mastery-data-v2'],
    { revalidate: 300, tags: ['subject-mastery'] }
);


export async function GET(req: Request) {
    const url = new URL(req.url);
    let userId = url.searchParams.get('userId');
    const improvementAreasCount = parseInt(url.searchParams.get('improvementAreasCount') || '2');
    const topPerformingCount = parseInt(url.searchParams.get('topPerformingCount') || '3');

    try {
        const session = await getAuthSession()

        userId = session?.user.id || userId;
        const stream = session?.user.stream as Stream
        if (!userId && !session) {
            return jsonResponse(null, { success: false, message: "Unauthorized", status: 401 });
        }


        console.time('subject-mastery-fetch');
        const subjectMasteryData = await getSubjectMasteryData(
            userId,
            stream,
            improvementAreasCount,
            topPerformingCount
        );
        console.timeEnd('subject-mastery-fetch');

        return jsonResponse(subjectMasteryData, {
            success: true,
            message: "Subject mastery data fetched successfully",
            status: 200
        });
    }
    catch (error) {
        console.error("[Subject Mastery API Error]:", error);
        return jsonResponse(null, {
            success: false,
            message: "Internal Server Error",
            status: 500
        });
    }
}