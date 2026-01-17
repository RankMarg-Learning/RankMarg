import prisma from "../lib/prisma";
import { ExamPhase, SessionPriority } from "@repo/db/enums";
import {
    CurriculumAlignment,
    CurrentTopic,
    RecommendedTopic,
    SkipMetrics,
} from "../types/extended.types";

/**
 * CurriculumTracker
 * 
 * Tracks student's curriculum progress and suggests next topics
 * aligned with their exam syllabus and weightage.
 */
export class CurriculumTracker {
    /**
     * Get current active topics for a user
     */
    async getCurrentTopics(userId: string, examCode: string): Promise<CurrentTopic[]> {
        const currentStudyTopics = await prisma.currentStudyTopic.findMany({
            where: {
                userId,
                isCurrent: true,
                isCompleted: false,
            },
            include: {
                topic: {
                    include: {
                        subject: true,
                    },
                },
            },
        });

        const currentTopics: CurrentTopic[] = [];

        for (const cst of currentStudyTopics) {
            // Get mastery level
            const mastery = await prisma.topicMastery.findUnique({
                where: {
                    userId_topicId: {
                        userId,
                        topicId: cst.topicId,
                    },
                },
            });

            // Count questions attempted
            const attemptCount = await prisma.attempt.count({
                where: {
                    userId,
                    question: {
                        topicId: cst.topicId,
                    },
                },
            });

            currentTopics.push({
                topicId: cst.topicId,
                topicName: cst.topic.name,
                subjectId: cst.subjectId,
                subjectName: cst.topic.subject.name,
                startedAt: cst.startedAt,
                questionsAttempted: attemptCount,
                masteryLevel: mastery?.masteryLevel || 0,
            });
        }

        return currentTopics;
    }

    /**
     * Get next recommended topics based on weightage and mastery
     */
    async getNextTopicsByWeightage(
        userId: string,
        examCode: string,
        limit: number = 5
    ): Promise<RecommendedTopic[]> {
        // Get exam subjects
        const examSubjects = await prisma.examSubject.findMany({
            where: { examCode },
            include: {
                subject: {
                    include: {
                        topics: {
                            orderBy: { weightage: "desc" },
                        },
                    },
                },
            },
        });

        const recommendations: RecommendedTopic[] = [];

        for (const examSubject of examSubjects) {
            for (const topic of examSubject.subject.topics) {
                // Check if already current or completed
                const currentStudy = await prisma.currentStudyTopic.findUnique({
                    where: {
                        userId_subjectId_topicId: {
                            userId,
                            subjectId: examSubject.subjectId,
                            topicId: topic.id,
                        },
                    },
                });

                if (currentStudy?.isCurrent || currentStudy?.isCompleted) {
                    continue;
                }

                // Get mastery level
                const mastery = await prisma.topicMastery.findUnique({
                    where: {
                        userId_topicId: {
                            userId,
                            topicId: topic.id,
                        },
                    },
                });

                const masteryLevel = mastery?.masteryLevel || 0;

                // Determine priority
                let priority: SessionPriority = "CURRICULUM";
                let reason = `High weightage topic (${topic.weightage}%)`;

                if (masteryLevel < 30) {
                    priority = "WEAK_TOPIC";
                    reason = `Weak mastery (${masteryLevel}%) on high weightage topic`;
                } else if (topic.weightage > 10) {
                    priority = "HIGH_ROI";
                    reason = `High exam weightage (${topic.weightage}%)`;
                }

                recommendations.push({
                    topicId: topic.id,
                    topicName: topic.name,
                    subjectId: examSubject.subjectId,
                    subjectName: examSubject.subject.name,
                    weightage: topic.weightage,
                    priority,
                    reason,
                });
            }
        }

        // Sort by weightage and mastery (high weightage + low mastery = high priority)
        recommendations.sort((a, b) => {
            if (a.priority === "HIGH_ROI" && b.priority !== "HIGH_ROI") return -1;
            if (b.priority === "HIGH_ROI" && a.priority !== "HIGH_ROI") return 1;
            return b.weightage - a.weightage;
        });

        return recommendations.slice(0, limit);
    }

    /**
     * Calculate topic completion status based on mastery
     */
    async getTopicCompletionStatus(
        userId: string,
        topicId: string
    ): Promise<{ isComplete: boolean; masteryLevel: number }> {
        const mastery = await prisma.topicMastery.findUnique({
            where: {
                userId_topicId: {
                    userId,
                    topicId,
                },
            },
        });

        const masteryLevel = mastery?.masteryLevel || 0;
        const isComplete = masteryLevel >= 80; // 80% mastery = complete

        return { isComplete, masteryLevel };
    }

    /**
     * Align topics with exam phase (prioritize differently based on days until exam)
     */
    async alignWithExamPhase(
        topics: RecommendedTopic[],
        phase: ExamPhase
    ): Promise<RecommendedTopic[]> {
        switch (phase) {
            case "FOUNDATION":
                // Focus on high weightage topics
                return topics.sort((a, b) => b.weightage - a.weightage);

            case "CONSOLIDATION":
                // Balance between weak topics and high weightage
                return topics.sort((a, b) => {
                    if (a.priority === "WEAK_TOPIC" && b.priority !== "WEAK_TOPIC") return -1;
                    if (b.priority === "WEAK_TOPIC" && a.priority !== "WEAK_TOPIC") return 1;
                    return b.weightage - a.weightage;
                });

            case "FINAL_PREP":
                // Focus only on high ROI topics (high weightage, quick wins)
                return topics
                    .filter((t) => t.priority === "HIGH_ROI" || t.weightage > 8)
                    .sort((a, b) => b.weightage - a.weightage);

            default:
                return topics;
        }
    }

    /**
     * Get complete curriculum alignment for a user
     */
    async getCurriculumAlignment(
        userId: string,
        examCode: string
    ): Promise<CurriculumAlignment> {
        const currentTopics = await this.getCurrentTopics(userId, examCode);
        const nextRecommendedTopics = await this.getNextTopicsByWeightage(userId, examCode);

        // Calculate completion percentage
        const allTopics = await prisma.topic.findMany({
            where: {
                subject: {
                    examSubjects: {
                        some: { examCode },
                    },
                },
            },
        });

        const completedTopics = await prisma.currentStudyTopic.count({
            where: {
                userId,
                isCompleted: true,
                subject: {
                    examSubjects: {
                        some: { examCode },
                    },
                },
            },
        });

        const completionPercentage = allTopics.length > 0
            ? (completedTopics / allTopics.length) * 100
            : 0;

        // Calculate exam coverage (weighted by topic weightage)
        const totalWeightage = allTopics.reduce((sum, t) => sum + t.weightage, 0);
        const completedWeightage = await this.getCompletedWeightage(userId, examCode);
        const examCoverage = totalWeightage > 0
            ? (completedWeightage / totalWeightage) * 100
            : 0;

        return {
            currentTopics,
            nextRecommendedTopics,
            completionPercentage: Math.round(completionPercentage),
            examCoverage: Math.round(examCoverage),
        };
    }

    /**
     * Calculate total weightage of completed topics
     */
    private async getCompletedWeightage(
        userId: string,
        examCode: string
    ): Promise<number> {
        const completedTopics = await prisma.currentStudyTopic.findMany({
            where: {
                userId,
                isCompleted: true,
                subject: {
                    examSubjects: {
                        some: { examCode },
                    },
                },
            },
            include: {
                topic: true,
            },
        });

        return completedTopics.reduce((sum, ct) => sum + ct.topic.weightage, 0);
    }

    /**
     * Detect skipped sessions and calculate skip metrics
     */
    async detectSkippedSessions(
        userId: string,
        last7Days: Date
    ): Promise<SkipMetrics> {
        const attempts = await prisma.attempt.findMany({
            where: {
                userId,
                solvedAt: {
                    gte: last7Days,
                },
            },
            orderBy: {
                solvedAt: "desc",
            },
            select: {
                solvedAt: true,
            },
        });

        if (attempts.length === 0) {
            return {
                skippedDays: 7,
                lastPracticeDate: null,
                averageGap: 0,
                isAtRisk: true,
            };
        }

        const lastPracticeDate = attempts[0].solvedAt;
        const daysSinceLastPractice = Math.floor(
            (Date.now() - lastPracticeDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Calculate gaps between practice days
        const practiceDates = attempts.map((a) => a.solvedAt.toDateString());
        const uniqueDates = [...new Set(practiceDates)];
        const skippedDays = 7 - uniqueDates.length;

        // Calculate average gap
        const gaps: number[] = [];
        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const date1 = new Date(uniqueDates[i]);
            const date2 = new Date(uniqueDates[i + 1]);
            const gap = Math.abs(
                Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24))
            );
            gaps.push(gap);
        }

        const averageGap = gaps.length > 0
            ? gaps.reduce((sum, g) => sum + g, 0) / gaps.length
            : 0;

        const isAtRisk = daysSinceLastPractice >= 3 || skippedDays >= 4;

        return {
            skippedDays,
            lastPracticeDate,
            averageGap: Math.round(averageGap * 10) / 10,
            isAtRisk,
        };
    }
}
