import { getAuthSession } from "@/utils/session";
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { SubjectMasteryResponseProps } from "@/types";

export const dynamic = 'force-dynamic'; 

export async function GET(
    request: Request,
    { params }: { params: { subjectId: string } }
) {
    try {
        const session = await getAuthSession();
        const userId = session?.user?.id;

        if (!userId) {
            return jsonResponse(null, {
                message: "Unauthorized",
                status: 401,
                success: false,
            });
        }

        const subjectId = params.subjectId;

        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
            select: { id: true, name: true, stream: true },
        });

        if (!subject) {
            return jsonResponse(null, {
                message: "Subject not found",
                status: 404,
                success: false,
            });
        }

        const subjectMastery = await prisma.subjectMastery.findUnique({
            where: {
                userId_subjectId: { userId, subjectId },
            },
        });

        const overallMastery = subjectMastery
            ? Math.round(subjectMastery.totalAttempts > 0
                ? (subjectMastery.correctAttempts / subjectMastery.totalAttempts) * 100
                : 0)
            : 0;

        const topicsData = await prisma.topic.findMany({
            where: { subjectId },
            select: {
                id: true,
                name: true,
                weightage: true,
                topicMastery: {
                    where: { userId },
                    select: {
                        masteryLevel: true,
                        totalAttempts: true,
                        correctAttempts: true,
                        strengthIndex: true,
                    },
                },
                subTopics: {
                    select: {
                        id: true,
                        name: true,
                        subtopicMastery: {
                            where: { userId },
                            select: {
                                masteryLevel: true,
                                totalAttempts: true,
                                correctAttempts: true,
                                strengthIndex: true,
                            },
                        },
                    },
                },
            },
        });

        const topics = topicsData.map(topic => {
            const masteryData = topic.topicMastery[0];
            const mastery = masteryData
                ? Math.round(
                    masteryData.totalAttempts > 0
                        ? (masteryData.correctAttempts / masteryData.totalAttempts) * 100
                        : masteryData.masteryLevel || 0
                )
                : 0;

            const subtopics = topic.subTopics.map(sub => {
                const subMastery = sub.subtopicMastery[0];
                const mastery = subMastery
                    ? Math.round(
                        subMastery.totalAttempts > 0
                            ? (subMastery.correctAttempts / subMastery.totalAttempts) * 100
                            : subMastery.masteryLevel || 0
                    )
                    : 0;

                return {
                    id: sub.id,
                    name: sub.name,
                    mastery,
                    totalAttempts: subMastery?.totalAttempts || 0,
                    masteredCount: subMastery?.correctAttempts || 0,
                    lastPracticed: null, // Placeholder
                };
            });

            return {
                id: topic.id,
                name: topic.name,
                weightage: topic.weightage,
                mastery,
                lastPracticed: null, // Placeholder
                subtopics,
            };
        });

        const topicIds = topics.map(t => t.id);
        const subtopicIds = topics.flatMap(t => t.subtopics.map(s => s.id));

        const recentSessions = await prisma.practiceSession.findMany({
            where: {
                userId,
                questions: {
                    some: {
                        question: {
                            OR: [
                                { topicId: { in: topicIds } },
                                { subtopicId: { in: subtopicIds } },
                            ],
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
            select: {
                createdAt: true,
                questions: {
                    select: {
                        question: {
                            select: {
                                topicId: true,
                                subtopicId: true,
                            },
                        },
                    },
                },
            },
        });

        const lastPracticeDates = new Map<string, Date>();

        for (const session of recentSessions) {
            for (const q of session.questions) {
                const { topicId, subtopicId } = q.question;

                if (topicId && !lastPracticeDates.has(`topic-${topicId}`)) {
                    lastPracticeDates.set(`topic-${topicId}`, session.createdAt);
                }

                if (subtopicId && !lastPracticeDates.has(`subtopic-${subtopicId}`)) {
                    lastPracticeDates.set(`subtopic-${subtopicId}`, session.createdAt);
                }
            }
        }

        const enhancedTopics = topics.map(topic => {
            const lastPracticed = lastPracticeDates.get(`topic-${topic.id}`);
            const subtopics = topic.subtopics.map(sub => {
                const subLastPracticed = lastPracticeDates.get(`subtopic-${sub.id}`);
                return {
                    ...sub,
                    lastPracticed: subLastPracticed
                        ? getRelativeTimeString(subLastPracticed)
                        : null,
                };
            });

            return {
                ...topic,
                lastPracticed: lastPracticed ? getRelativeTimeString(lastPracticed) : null,
                subtopics,
            };
        });

        return jsonResponse<SubjectMasteryResponseProps>({
            subject: {
                id: subject.id,
                name: subject.name,
                stream: subject.stream,
            },
            overallMastery,
            topics: enhancedTopics,
        }, {
            status: 200,
            success: true,
            message: "OK",
        });

    } catch (error) {
        console.error("Error fetching mastery data:", error);
        return jsonResponse(null, {
            message: "Internal Server Error",
            status: 500,
            success: false,
        });
    }
}

// Convert date to relative time string
function getRelativeTimeString(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 14) return "1 week ago";
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 60) return "1 month ago";

    return `${Math.floor(days / 30)} months ago`;
}
