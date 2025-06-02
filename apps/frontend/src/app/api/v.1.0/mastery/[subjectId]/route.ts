import { getAuthSession } from "@/utils/session";
import prisma from "@/lib/prisma";
import { jsonResponse } from "@/utils/api-response";
import { SubjectMasteryResponseProps } from "@/types";
import { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic'; 

export async function GET(
    request: Request,
    { params }: { params: { subjectId: string } }
) {
    try {
        const subjectId = params?.subjectId;
        if (!subjectId || typeof subjectId !== 'string') {
            return jsonResponse(null, {
                message: "Invalid subject ID provided",
                status: 400,
                success: false,
            });
        }

        let session;
        try {
            session = await getAuthSession();
        } catch (error) {
            console.error("Session validation error:", error);
            return jsonResponse(null, {
                message: "Session validation failed",
                status: 401,
                success: false,
            });
        }

        const userId = session?.user?.id;
        if (!userId) {
            return jsonResponse(null, {
                message: "Unauthorized - Please log in",
                status: 401,
                success: false,
            });
        }

        let subject;
        try {
            subject = await prisma.subject.findUnique({
                where: { id: subjectId },
                select: { id: true, name: true, stream: true },
            });
        } catch (error) {
            console.error("Database error while fetching subject:", error);
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                return jsonResponse(null, {
                    message: "Database error occurred",
                    status: 500,
                    success: false,
                });
            }
            throw error; // Re-throw unknown errors
        }

        if (!subject) {
            return jsonResponse(null, {
                message: "Subject not found",
                status: 404,
                success: false,
            });
        }

        let subjectMastery;
        try {
            subjectMastery = await prisma.subjectMastery.findUnique({
                where: {
                    userId_subjectId: { userId, subjectId },
                },
            });
        } catch (error) {
            console.error("Database error while fetching subject mastery:", error);
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                return jsonResponse(null, {
                    message: "Error fetching mastery data",
                    status: 500,
                    success: false,
                });
            }
            throw error;
        }

        const overallMastery = subjectMastery && subjectMastery.totalAttempts > 0
            ? Math.round((subjectMastery.correctAttempts / subjectMastery.totalAttempts) * 100)
            : 0;

        let topicsData;
        try {
            topicsData = await prisma.topic.findMany({
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
        } catch (error) {
            console.error("Database error while fetching topics:", error);
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                return jsonResponse(null, {
                    message: "Error fetching topics data",
                    status: 500,
                    success: false,
                });
            }
            throw error;
        }

        const topics = topicsData.map(topic => {
            try {
                const masteryData = topic.topicMastery?.[0];
                const mastery = masteryData
                    ? Math.round(
                        masteryData.totalAttempts > 0
                            ? (masteryData.correctAttempts / masteryData.totalAttempts) * 100
                            : masteryData.masteryLevel || 0
                    )
                    : 0;

                const subtopics = topic.subTopics.map(sub => {
                    try {
                        const subMastery = sub.subtopicMastery?.[0];
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
                            lastPracticed: null, // Will be populated later
                        };
                    } catch (error) {
                        console.error(`Error processing subtopic ${sub.id}:`, error);
                        return {
                            id: sub.id,
                            name: sub.name,
                            mastery: 0,
                            totalAttempts: 0,
                            masteredCount: 0,
                            lastPracticed: null,
                        };
                    }
                });

                return {
                    id: topic.id,
                    name: topic.name,
                    weightage: topic.weightage || 0,
                    mastery,
                    lastPracticed: null, // Will be populated later
                    subtopics,
                };
            } catch (error) {
                console.error(`Error processing topic ${topic.id}:`, error);
                return {
                    id: topic.id,
                    name: topic.name,
                    weightage: 0,
                    mastery: 0,
                    lastPracticed: null,
                    subtopics: [],
                };
            }
        });

        const topicIds = topics.map(t => t.id).filter(Boolean);
        const subtopicIds = topics.flatMap(t => t.subtopics.map(s => s.id)).filter(Boolean);

        let recentSessions = [];
        if (topicIds.length > 0 || subtopicIds.length > 0) {
            try {
                recentSessions = await prisma.practiceSession.findMany({
                    where: {
                        userId,
                        questions: {
                            some: {
                                question: {
                                    OR: [
                                        ...(topicIds.length > 0 ? [{ topicId: { in: topicIds } }] : []),
                                        ...(subtopicIds.length > 0 ? [{ subtopicId: { in: subtopicIds } }] : []),
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
            } catch (error) {
                console.error("Database error while fetching practice sessions:", error);
                recentSessions = [];
            }
        }

        const lastPracticeDates = new Map<string, Date>();

        try {
            for (const session of recentSessions) {
                if (!session.createdAt) continue;
                
                for (const q of session.questions || []) {
                    if (!q.question) continue;
                    
                    const { topicId, subtopicId } = q.question;

                    if (topicId && !lastPracticeDates.has(`topic-${topicId}`)) {
                        lastPracticeDates.set(`topic-${topicId}`, session.createdAt);
                    }

                    if (subtopicId && !lastPracticeDates.has(`subtopic-${subtopicId}`)) {
                        lastPracticeDates.set(`subtopic-${subtopicId}`, session.createdAt);
                    }
                }
            }
        } catch (error) {
            console.error("Error processing practice session dates:", error);
        }

        const enhancedTopics = topics.map(topic => {
            try {
                const lastPracticed = lastPracticeDates.get(`topic-${topic.id}`);
                const subtopics = topic.subtopics.map(sub => {
                    try {
                        const subLastPracticed = lastPracticeDates.get(`subtopic-${sub.id}`);
                        return {
                            ...sub,
                            lastPracticed: subLastPracticed
                                ? getRelativeTimeString(subLastPracticed)
                                : null,
                        };
                    } catch (error) {
                        console.error(`Error processing subtopic last practiced date for ${sub.id}:`, error);
                        return { ...sub, lastPracticed: null };
                    }
                });

                return {
                    ...topic,
                    lastPracticed: lastPracticed ? getRelativeTimeString(lastPracticed) : null,
                    subtopics,
                };
            } catch (error) {
                console.error(`Error enhancing topic ${topic.id}:`, error);
                return { ...topic, lastPracticed: null };
            }
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
        console.error("Unexpected error in subject mastery API:", error);
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return jsonResponse(null, {
                message: "Database operation failed",
                status: 500,
                success: false,
            });
        }
        
        if (error instanceof Prisma.PrismaClientUnknownRequestError) {
            return jsonResponse(null, {
                message: "Unknown database error occurred",
                status: 500,
                success: false,
            });
        }
        
        if (error instanceof Prisma.PrismaClientRustPanicError) {
            return jsonResponse(null, {
                message: "Database connection error",
                status: 500,
                success: false,
            });
        }
        
        if (error instanceof Prisma.PrismaClientInitializationError) {
            return jsonResponse(null, {
                message: "Database initialization error",
                status: 500,
                success: false,
            });
        }
        
        if (error instanceof Prisma.PrismaClientValidationError) {
            return jsonResponse(null, {
                message: "Invalid data provided",
                status: 400,
                success: false,
            });
        }

        return jsonResponse(null, {
            message: "An unexpected error occurred",
            status: 500,
            success: false,
        });
    }
}

function getRelativeTimeString(date: Date): string {
    try {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return "Unknown";
        }

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        if (diff < 0) {
            return "Recently";
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return "Today";
        if (days === 1) return "Yesterday";
        if (days < 7) return `${days} days ago`;
        if (days < 14) return "1 week ago";
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        if (days < 60) return "1 month ago";

        return `${Math.floor(days / 30)} months ago`;
    } catch (error) {
        console.error("Error in getRelativeTimeString:", error);
        return "Unknown";
    }
}