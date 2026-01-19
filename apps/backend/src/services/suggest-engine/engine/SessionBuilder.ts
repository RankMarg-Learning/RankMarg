import prisma from "@repo/db";
import { SessionPriority } from "@repo/db/enums";
import {
    SessionMetadata,
    SessionTopicInfo,
} from "../types/extended.types";
import { EnhancedAnalysis } from "../types/coach.types";

/**
 * SessionBuilder
 * 
 * Builds practice session metadata for coaching suggestions.
 * Integrates with backend's PracticeSessionGenerator to create actual sessions.
 */
export class SessionBuilder {
    /**
     * Build session metadata based on analysis
     */
    async buildSessionMetadata(
        subjectId: string,
        topics: SessionTopicInfo[],
        questionCount: number,
        priority: SessionPriority
    ): Promise<SessionMetadata> {
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
        });

        if (!subject) {
            throw new Error(`Subject not found: ${subjectId}`);
        }

        // Calculate estimated duration (90 seconds per question)
        const estimatedDuration = Math.ceil((questionCount * 90) / 60); // in minutes

        // Determine difficulty based on priority
        let difficulty = "MEDIUM";
        if (priority === "HIGH_ROI") {
            difficulty = "HARD";
        } else if (priority === "WEAK_TOPIC") {
            difficulty = "EASY";
        }

        return {
            subjectId,
            subjectName: subject.name,
            topics,
            questionCount,
            estimatedDuration,
            difficulty,
            priority,
        };
    }

    /**
     * Select topics for session based on errors and ROI
     */
    async selectTopicsForSession(
        analysis: EnhancedAnalysis,
        subjectId: string,
        maxTopics: number = 3
    ): Promise<SessionTopicInfo[]> {
        // Get subject breakdown
        const subjectBreakdown = analysis.subjectBreakdown.find(
            (sb) => sb.subjectId === subjectId
        );

        if (!subjectBreakdown) {
            // Fallback: get high weightage topics
            return this.getHighWeightageTopics(subjectId, maxTopics);
        }

        // Prioritize topics with errors
        const topicsWithErrors = subjectBreakdown.topicsWithErrors
            .sort((a, b) => b.errorCount - a.errorCount)
            .slice(0, maxTopics);

        const sessionTopics: SessionTopicInfo[] = [];

        for (const topicError of topicsWithErrors) {
            // Calculate question count based on error frequency
            const questionCount = Math.min(10, Math.max(3, topicError.errorCount * 2));

            sessionTopics.push({
                topicId: topicError.topicId,
                topicName: topicError.topicName,
                subtopicId: topicError.subtopicId,
                subtopicName: topicError.subtopicName,
                questionCount,
            });
        }

        // If not enough topics with errors, add high ROI topics
        if (sessionTopics.length < maxTopics) {
            const additionalTopics = await this.getHighROITopics(
                analysis,
                subjectId,
                maxTopics - sessionTopics.length
            );
            sessionTopics.push(...additionalTopics);
        }

        return sessionTopics;
    }

    /**
     * Get high weightage topics for a subject
     */
    private async getHighWeightageTopics(
        subjectId: string,
        limit: number
    ): Promise<SessionTopicInfo[]> {
        const topics = await prisma.topic.findMany({
            where: { subjectId },
            orderBy: { weightage: "desc" },
            take: limit,
        });

        return topics.map((topic) => ({
            topicId: topic.id,
            topicName: topic.name,
            questionCount: 5,
        }));
    }

    /**
     * Get high ROI topics from analysis
     */
    private async getHighROITopics(
        analysis: EnhancedAnalysis,
        subjectId: string,
        limit: number
    ): Promise<SessionTopicInfo[]> {
        const subjectTopics = analysis.topicROI
            .filter((t) => t.subjectId === subjectId)
            .sort((a, b) => b.roi - a.roi)
            .slice(0, limit);

        return subjectTopics.map((topic) => ({
            topicId: topic.topicId,
            topicName: topic.topicName,
            questionCount: 5,
        }));
    }

    /**
     * Determine session priority based on analysis
     */
    public determinePriority(
        analysis: EnhancedAnalysis,
        subjectId: string
    ): SessionPriority {
        const subjectBreakdown = analysis.subjectBreakdown.find(
            (sb) => sb.subjectId === subjectId
        );

        if (!subjectBreakdown) {
            return "CURRICULUM";
        }

        // Check if subject has high error rate
        if (subjectBreakdown.accuracy < 50) {
            return "WEAK_TOPIC";
        }

        // Check if subject has high ROI topics
        const subjectROI = analysis.topicROI.filter(
            (t) => t.subjectId === subjectId
        );
        const avgROI = subjectROI.reduce((sum, t) => sum + t.roi, 0) / subjectROI.length;

        if (avgROI > 0.7) {
            return "HIGH_ROI";
        }



        return "CURRICULUM";
    }
}
