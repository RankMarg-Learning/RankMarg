/**
 * Roadmap Generator - Creates 14-day study roadmap
 * Following rule-roadmap-rules: Phase-based constraints, max 2 subjects/day
 */

import {
    Roadmap,
    DailySession,
    StudyPhase,
    MasteryComparison,
    PerformanceWindow,
    RiskFlag,
} from "../../../types/coach.types";
import { coachConfig } from "../coach.config";
import { addDays, startOfDay } from "date-fns";
import prisma from "../../../lib/prisma";

interface TopicPriority {
    topicId: string;
    topicName: string;
    subjectId: string;
    subjectName: string;
    priority: "high" | "medium" | "low";
    reason: string;
    targetQuestions: number;
    estimatedMinutes: number;
    difficulty: number[];
}

export class RoadmapGenerator {
    /**
     * Generate 14-day roadmap based on performance and study phase
     */
    async generateRoadmap(
        userId: string,
        examCode: string,
        studyPhase: StudyPhase,
        performanceWindow: PerformanceWindow,
        masteryComparison: MasteryComparison,
        riskFlags: RiskFlag[]
    ): Promise<Roadmap> {
        // Prioritize topics based on performance and risks
        const prioritizedTopics = await this.prioritizeTopics(
            userId,
            studyPhase,
            performanceWindow,
            masteryComparison,
            riskFlags
        );

        // Generate daily sessions
        const dailySessions = this.generateDailySessions(
            studyPhase,
            prioritizedTopics
        );

        // Calculate summary
        const summary = this.calculateSummary(dailySessions, prioritizedTopics);

        const now = new Date();

        return {
            userId,
            examCode,
            studyPhase,
            generatedAt: now,
            validFrom: startOfDay(now),
            validUntil: addDays(startOfDay(now), 14),
            dailySessions,
            constraints: coachConfig.roadmapConstraints,
            summary,
        };
    }

    /**
     * Prioritize topics based on multiple factors
     */
    private async prioritizeTopics(
        userId: string,
        studyPhase: StudyPhase,
        performanceWindow: PerformanceWindow,
        masteryComparison: MasteryComparison,
        riskFlags: RiskFlag[]
    ): Promise<TopicPriority[]> {
        const priorities: TopicPriority[] = [];

        // Get weak topics (low mastery or regression)
        const weakTopics = masteryComparison.deltas.filter(
            (d) =>
                d.entityType === "topic" &&
                (d.classification === "regression" || d.currentMastery < 0.6)
        );

        // Get topics with risk flags
        const riskyTopicIds = new Set(
            riskFlags.filter((r) => r.topicId).map((r) => r.topicId!)
        );

        // Get topics from performance window
        for (const subject of performanceWindow.subjects) {
            for (const topic of subject.topics) {
                const isWeak = weakTopics.some((d) => d.entityId === topic.topicId);
                const isRisky = riskyTopicIds.has(topic.topicId);
                const hasLowAccuracy = topic.accuracy < 0.6;

                // Determine priority
                let priority: "high" | "medium" | "low" = "low";
                let reason = "";

                if (isRisky) {
                    priority = "high";
                    reason = "Risk flag detected";
                } else if (isWeak) {
                    priority = "high";
                    reason = "Mastery regression or low mastery";
                } else if (hasLowAccuracy) {
                    priority = "medium";
                    reason = "Low accuracy in recent practice";
                } else if (topic.accuracy < 0.75) {
                    priority = "medium";
                    reason = "Room for improvement";
                } else {
                    priority = "low";
                    reason = "Maintaining mastery";
                }

                // Calculate target questions based on priority and phase
                const targetQuestions = this.calculateTargetQuestions(
                    priority,
                    studyPhase
                );

                // Calculate estimated time
                const estimatedMinutes = targetQuestions * 3; // ~3 min per question

                // Determine difficulty distribution
                const difficulty = this.getDifficultyDistribution(
                    priority,
                    studyPhase,
                    topic.accuracy
                );

                priorities.push({
                    topicId: topic.topicId,
                    topicName: topic.topicName,
                    subjectId: subject.subjectId,
                    subjectName: subject.subjectName,
                    priority,
                    reason,
                    targetQuestions,
                    estimatedMinutes,
                    difficulty,
                });
            }
        }

        // Sort by priority
        return priorities.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    /**
     * Generate daily sessions from prioritized topics
     */
    private generateDailySessions(
        studyPhase: StudyPhase,
        prioritizedTopics: TopicPriority[]
    ): DailySession[] {
        const sessions: DailySession[] = [];
        const constraints = coachConfig.roadmapConstraints;

        // Distribute topics across 14 days
        let topicIndex = 0;
        const now = new Date();

        for (let day = 1; day <= 14; day++) {
            const date = addDays(startOfDay(now), day - 1);
            const subjectsForDay = new Map<
                string,
                { subjectName: string; topics: any[] }
            >();

            let totalMinutes = 0;
            let subjectCount = 0;

            // Add topics for this day
            while (
                topicIndex < prioritizedTopics.length &&
                subjectCount < constraints.maxSubjectsPerDay &&
                totalMinutes < constraints.maxStudyHoursPerDay * 60
            ) {
                const topic = prioritizedTopics[topicIndex];

                // Check if we can add this subject
                if (!subjectsForDay.has(topic.subjectId)) {
                    if (subjectCount >= constraints.maxSubjectsPerDay) {
                        break;
                    }
                    subjectCount++;
                    subjectsForDay.set(topic.subjectId, {
                        subjectName: topic.subjectName,
                        topics: [],
                    });
                }

                // Determine session type based on phase
                const sessionType = this.getSessionType(studyPhase, topic.priority);

                subjectsForDay.get(topic.subjectId)!.topics.push({
                    topicId: topic.topicId,
                    topicName: topic.topicName,
                    sessionType,
                    targetQuestions: topic.targetQuestions,
                    estimatedMinutes: topic.estimatedMinutes,
                    difficulty: topic.difficulty,
                    priority: topic.priority,
                });

                totalMinutes += topic.estimatedMinutes;
                topicIndex++;

                // If we've exceeded time limit, move to next day
                if (totalMinutes >= constraints.maxStudyHoursPerDay * 60) {
                    break;
                }
            }

            // Convert to session format
            const subjects = Array.from(subjectsForDay.entries()).map(
                ([subjectId, data]) => ({
                    subjectId,
                    subjectName: data.subjectName,
                    topics: data.topics,
                })
            );

            // Generate goals for the day
            const goals = this.generateDailyGoals(subjects, studyPhase);

            sessions.push({
                day,
                date,
                subjects,
                totalEstimatedMinutes: totalMinutes,
                goals,
            });
        }

        return sessions;
    }

    /**
     * Calculate target questions based on priority and phase
     */
    private calculateTargetQuestions(
        priority: "high" | "medium" | "low",
        studyPhase: StudyPhase
    ): number {
        const baseQuestions = {
            high: 15,
            medium: 10,
            low: 5,
        };

        // Adjust based on study phase
        const phaseMultiplier = {
            [StudyPhase.FOUNDATION]: 1.0,
            [StudyPhase.BUILDING]: 1.2,
            [StudyPhase.REVISION]: 1.5,
            [StudyPhase.EXAM_READY]: 2.0,
        };

        return Math.round(
            baseQuestions[priority] * phaseMultiplier[studyPhase]
        );
    }

    /**
     * Get difficulty distribution based on priority and phase
     */
    private getDifficultyDistribution(
        priority: "high" | "medium" | "low",
        studyPhase: StudyPhase,
        currentAccuracy: number
    ): number[] {
        // For weak topics, start with easier questions
        if (priority === "high" && currentAccuracy < 0.5) {
            return [1, 2]; // Easy to medium
        }

        // For medium priority, balanced distribution
        if (priority === "medium") {
            return [2, 3]; // Medium to hard
        }

        // For revision phase, focus on harder questions
        if (studyPhase === StudyPhase.REVISION || studyPhase === StudyPhase.EXAM_READY) {
            return [3, 4]; // Hard to very hard
        }

        // Default: balanced
        return [2, 3];
    }

    /**
     * Get session type based on phase and priority
     */
    private getSessionType(
        studyPhase: StudyPhase,
        priority: "high" | "medium" | "low"
    ): "practice" | "revision" | "test" {
        if (studyPhase === StudyPhase.EXAM_READY) {
            return "test";
        }

        if (studyPhase === StudyPhase.REVISION) {
            return "revision";
        }

        if (priority === "high") {
            return "practice";
        }

        return "practice";
    }

    /**
     * Generate daily goals
     */
    private generateDailyGoals(
        subjects: any[],
        studyPhase: StudyPhase
    ): string[] {
        const goals: string[] = [];

        // Add subject-specific goals
        for (const subject of subjects) {
            const topicNames = subject.topics
                .slice(0, 2)
                .map((t: any) => t.topicName)
                .join(" and ");
            goals.push(`Complete practice in ${topicNames}`);
        }

        // Add phase-specific goals
        if (studyPhase === StudyPhase.REVISION) {
            goals.push("Review previous mistakes");
        } else if (studyPhase === StudyPhase.EXAM_READY) {
            goals.push("Simulate exam conditions");
        }

        return goals.slice(0, 3); // Max 3 goals per day
    }

    /**
     * Calculate roadmap summary
     */
    private calculateSummary(
        dailySessions: DailySession[],
        prioritizedTopics: TopicPriority[]
    ): {
        totalSessions: number;
        totalQuestions: number;
        totalEstimatedHours: number;
        focusAreas: string[];
    } {
        const totalSessions = dailySessions.length;

        const totalQuestions = dailySessions.reduce(
            (sum, session) =>
                sum +
                session.subjects.reduce(
                    (subSum, subject) =>
                        subSum +
                        subject.topics.reduce(
                            (topicSum, topic) => topicSum + topic.targetQuestions,
                            0
                        ),
                    0
                ),
            0
        );

        const totalMinutes = dailySessions.reduce(
            (sum, session) => sum + session.totalEstimatedMinutes,
            0
        );
        const totalEstimatedHours = Math.round((totalMinutes / 60) * 10) / 10;

        // Get top focus areas (high priority topics)
        const focusAreas = prioritizedTopics
            .filter((t) => t.priority === "high")
            .slice(0, 5)
            .map((t) => `${t.subjectName}: ${t.topicName}`);

        return {
            totalSessions,
            totalQuestions,
            totalEstimatedHours,
            focusAreas,
        };
    }
}
