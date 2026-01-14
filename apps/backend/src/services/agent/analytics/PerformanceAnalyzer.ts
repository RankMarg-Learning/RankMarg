/**
 * Performance Analyzer - 14-day window analytics
 * Following rule-analytics-first-llm-last: All metrics computed deterministically
 */

import prisma from "../../../lib/prisma";
import {
    PerformanceWindow,
    SubjectPerformance,
    TopicPerformance,
    AttemptTelemetry,
} from "../../../types/coach.types";
import { coachConfig } from "../coach.config";
import { captureServiceError } from "../../../lib/sentry";
import { subDays, startOfDay, endOfDay } from "date-fns";

export class PerformanceAnalyzer {
    /**
     * Analyze performance for the last 14 days
     * Returns deterministic metrics for LLM consumption
     */
    async analyzePerformanceWindow(
        userId: string,
        windowDays: number = coachConfig.windowDays
    ): Promise<PerformanceWindow> {
        try {
            const windowEnd = endOfDay(new Date());
            const windowStart = startOfDay(subDays(windowEnd, windowDays));

            // Fetch all attempts in the window
            const attempts = await this.fetchAttempts(userId, windowStart, windowEnd);

            if (attempts.length === 0) {
                throw new Error(
                    `Insufficient data: No attempts found in the last ${windowDays} days`
                );
            }

            // Group attempts by subject
            const attemptsBySubject = this.groupAttemptsBySubject(attempts);

            // Calculate subject-level performance
            const subjects: SubjectPerformance[] = [];

            for (const [subjectId, subjectAttempts] of attemptsBySubject.entries()) {
                const subjectPerf = await this.calculateSubjectPerformance(
                    subjectId,
                    subjectAttempts
                );
                subjects.push(subjectPerf);
            }

            // Calculate overall metrics
            const overallMetrics = this.calculateOverallMetrics(
                attempts,
                windowStart,
                windowEnd
            );

            return {
                userId,
                windowStart,
                windowEnd,
                subjects,
                overallMetrics,
            };
        } catch (error) {
            captureServiceError(error as Error, {
                service: "CoachAgent",
                method: "PerformanceAnalyzer.analyzePerformanceWindow",
                userId,
                additionalData: { windowDays },
            });
            throw error;
        }
    }

    /**
     * Fetch attempts within the time window
     */
    private async fetchAttempts(
        userId: string,
        startDate: Date,
        endDate: Date
    ): Promise<AttemptTelemetry[]> {
        const attempts = await prisma.attempt.findMany({
            where: {
                userId,
                solvedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                question: {
                    select: {
                        id: true,
                        subjectId: true,
                        topicId: true,
                        subtopicId: true,
                        difficulty: true,
                    },
                },
            },
            orderBy: {
                solvedAt: "asc",
            },
        });

        return attempts.map((attempt) => ({
            userId: attempt.userId,
            questionId: attempt.questionId,
            subjectId: attempt.question.subjectId || "",
            topicId: attempt.question.topicId || "",
            subtopicId: attempt.question.subtopicId || undefined,
            difficulty: attempt.question.difficulty,
            isCorrect: attempt.status === "CORRECT",
            timeSpent: attempt.timing || 0,
            errorType: attempt.mistake || undefined,
            attemptedAt: attempt.solvedAt,
            hintsUsed: attempt.hintsUsed,
        }));
    }

    /**
     * Group attempts by subject
     */
    private groupAttemptsBySubject(
        attempts: AttemptTelemetry[]
    ): Map<string, AttemptTelemetry[]> {
        const grouped = new Map<string, AttemptTelemetry[]>();

        for (const attempt of attempts) {
            if (!attempt.subjectId) continue;

            if (!grouped.has(attempt.subjectId)) {
                grouped.set(attempt.subjectId, []);
            }

            grouped.get(attempt.subjectId)!.push(attempt);
        }

        return grouped;
    }

    /**
     * Calculate subject-level performance
     */
    private async calculateSubjectPerformance(
        subjectId: string,
        attempts: AttemptTelemetry[]
    ): Promise<SubjectPerformance> {
        // Get subject name
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
            select: { name: true },
        });

        const totalAttempts = attempts.length;
        const correctAttempts = attempts.filter((a) => a.isCorrect).length;
        const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;

        // Calculate average time
        const totalTime = attempts.reduce((sum, a) => sum + a.timeSpent, 0);
        const avgTime = totalAttempts > 0 ? totalTime / totalAttempts : 0;

        // Calculate speed index (relative to expected time)
        const expectedTime = this.calculateExpectedTime(attempts);
        const speedIndex = expectedTime > 0 ? avgTime / expectedTime : 1;

        // Error breakdown
        const errorBreakdown = this.calculateErrorBreakdown(attempts);

        // Group by topic
        const attemptsByTopic = this.groupAttemptsByTopic(attempts);
        const topics: TopicPerformance[] = [];

        for (const [topicId, topicAttempts] of attemptsByTopic.entries()) {
            const topicPerf = await this.calculateTopicPerformance(
                topicId,
                topicAttempts
            );
            topics.push(topicPerf);
        }

        return {
            subjectId,
            subjectName: subject?.name || "Unknown",
            accuracy,
            avgTime,
            speedIndex,
            totalAttempts,
            correctAttempts,
            topics,
            errorBreakdown,
        };
    }

    /**
     * Calculate topic-level performance
     */
    private async calculateTopicPerformance(
        topicId: string,
        attempts: AttemptTelemetry[]
    ): Promise<TopicPerformance> {
        // Get topic name
        const topic = await prisma.topic.findUnique({
            where: { id: topicId },
            select: { name: true },
        });

        const totalAttempts = attempts.length;
        const correctAttempts = attempts.filter((a) => a.isCorrect).length;
        const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;

        const totalTime = attempts.reduce((sum, a) => sum + a.timeSpent, 0);
        const avgTime = totalAttempts > 0 ? totalTime / totalAttempts : 0;

        const expectedTime = this.calculateExpectedTime(attempts);
        const speedIndex = expectedTime > 0 ? avgTime / expectedTime : 1;

        const errorBreakdown = this.calculateErrorBreakdown(attempts);

        return {
            topicId,
            topicName: topic?.name || "Unknown",
            accuracy,
            avgTime,
            speedIndex,
            totalAttempts,
            correctAttempts,
            errorBreakdown,
        };
    }

    /**
     * Group attempts by topic
     */
    private groupAttemptsByTopic(
        attempts: AttemptTelemetry[]
    ): Map<string, AttemptTelemetry[]> {
        const grouped = new Map<string, AttemptTelemetry[]>();

        for (const attempt of attempts) {
            if (!attempt.topicId) continue;

            if (!grouped.has(attempt.topicId)) {
                grouped.set(attempt.topicId, []);
            }

            grouped.get(attempt.topicId)!.push(attempt);
        }

        return grouped;
    }

    /**
     * Calculate expected time based on difficulty
     * Difficulty 1: 60s, 2: 90s, 3: 120s, 4: 150s
     */
    private calculateExpectedTime(attempts: AttemptTelemetry[]): number {
        const expectedTimes = attempts.map((a) => {
            switch (a.difficulty) {
                case 1:
                    return 60;
                case 2:
                    return 90;
                case 3:
                    return 120;
                case 4:
                    return 150;
                default:
                    return 90;
            }
        });

        const totalExpected = expectedTimes.reduce((sum, t) => sum + t, 0);
        return attempts.length > 0 ? totalExpected / attempts.length : 0;
    }

    /**
     * Calculate error breakdown
     */
    private calculateErrorBreakdown(attempts: AttemptTelemetry[]): {
        conceptual: number;
        calculation: number;
        careless: number;
    } {
        const incorrectAttempts = attempts.filter((a) => !a.isCorrect);
        const total = incorrectAttempts.length;

        if (total === 0) {
            return { conceptual: 0, calculation: 0, careless: 0 };
        }

        let conceptual = 0;
        let calculation = 0;
        let careless = 0;

        for (const attempt of incorrectAttempts) {
            const errorType = attempt.errorType?.toLowerCase() || "";

            if (errorType.includes("concept") || errorType.includes("understanding")) {
                conceptual++;
            } else if (
                errorType.includes("calculation") ||
                errorType.includes("arithmetic")
            ) {
                calculation++;
            } else if (errorType.includes("careless") || errorType.includes("silly")) {
                careless++;
            } else {
                // Default to conceptual if unknown
                conceptual++;
            }
        }

        return {
            conceptual: conceptual / total,
            calculation: calculation / total,
            careless: careless / total,
        };
    }

    /**
     * Calculate overall metrics
     */
    private calculateOverallMetrics(
        attempts: AttemptTelemetry[],
        windowStart: Date,
        windowEnd: Date
    ): {
        totalAttempts: number;
        overallAccuracy: number;
        avgDailyQuestions: number;
        studyDays: number;
        avgStudyHoursPerDay: number;
    } {
        const totalAttempts = attempts.length;
        const correctAttempts = attempts.filter((a) => a.isCorrect).length;
        const overallAccuracy =
            totalAttempts > 0 ? correctAttempts / totalAttempts : 0;

        // Calculate study days (days with at least one attempt)
        const uniqueDays = new Set(
            attempts.map((a) => startOfDay(a.attemptedAt).getTime())
        );
        const studyDays = uniqueDays.size;

        // Calculate average daily questions
        const windowDays =
            Math.ceil(
                (windowEnd.getTime() - windowStart.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;
        const avgDailyQuestions = studyDays > 0 ? totalAttempts / studyDays : 0;

        // Calculate average study hours per day
        const totalTimeMinutes = attempts.reduce((sum, a) => sum + a.timeSpent, 0);
        const totalTimeHours = totalTimeMinutes / 60;
        const avgStudyHoursPerDay = studyDays > 0 ? totalTimeHours / studyDays : 0;

        return {
            totalAttempts,
            overallAccuracy,
            avgDailyQuestions,
            studyDays,
            avgStudyHoursPerDay,
        };
    }
}
