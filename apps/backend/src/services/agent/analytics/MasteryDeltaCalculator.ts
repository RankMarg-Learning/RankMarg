/**
 * Mastery Delta Calculator - Compares mastery snapshots
 * Following rule-mastery-delta-rules: +0.05 improvement, -0.05 regression
 */

import {
    MasterySnapshot,
    MasteryComparison,
    MasteryDelta,
    SubjectMasterySnapshot,
    TopicMasterySnapshot,
} from "../../../types/coach.types";
import { coachConfig } from "../coach.config";

export class MasteryDeltaCalculator {
    /**
     * Calculate mastery deltas between two snapshots
     * Returns structured comparison with improvement/regression classification
     */
    calculateDeltas(
        currentSnapshot: MasterySnapshot,
        previousSnapshot: MasterySnapshot
    ): MasteryComparison {
        const deltas: MasteryDelta[] = [];

        // Compare subjects
        for (const currentSubject of currentSnapshot.subjects) {
            const previousSubject = previousSnapshot.subjects.find(
                (s) => s.subjectId === currentSubject.subjectId
            );

            if (previousSubject) {
                const subjectDelta = this.calculateEntityDelta(
                    currentSubject.subjectId,
                    "subject",
                    currentSubject.subjectName,
                    currentSubject.masteryLevel,
                    previousSubject.masteryLevel,
                    currentSubject.totalAttempts
                );
                deltas.push(subjectDelta);

                // Compare topics within subject
                const topicDeltas = this.compareTopics(
                    currentSubject.topics,
                    previousSubject.topics
                );
                deltas.push(...topicDeltas);
            }
        }

        // Calculate summary statistics
        const summary = this.calculateSummary(deltas);

        return {
            userId: currentSnapshot.userId,
            currentSnapshot,
            previousSnapshot,
            deltas,
            summary,
        };
    }

    /**
     * Compare topics between snapshots
     */
    private compareTopics(
        currentTopics: TopicMasterySnapshot[],
        previousTopics: TopicMasterySnapshot[]
    ): MasteryDelta[] {
        const deltas: MasteryDelta[] = [];

        for (const currentTopic of currentTopics) {
            const previousTopic = previousTopics.find(
                (t) => t.topicId === currentTopic.topicId
            );

            if (previousTopic) {
                const topicDelta = this.calculateEntityDelta(
                    currentTopic.topicId,
                    "topic",
                    currentTopic.topicName,
                    currentTopic.masteryLevel,
                    previousTopic.masteryLevel,
                    currentTopic.totalAttempts
                );
                deltas.push(topicDelta);

                // Compare subtopics
                for (const currentSubtopic of currentTopic.subtopics) {
                    const previousSubtopic = previousTopic.subtopics.find(
                        (st) => st.subtopicId === currentSubtopic.subtopicId
                    );

                    if (previousSubtopic) {
                        const subtopicDelta = this.calculateEntityDelta(
                            currentSubtopic.subtopicId,
                            "subtopic",
                            currentSubtopic.subtopicName,
                            currentSubtopic.masteryLevel,
                            previousSubtopic.masteryLevel,
                            currentSubtopic.totalAttempts
                        );
                        deltas.push(subtopicDelta);
                    }
                }
            }
        }

        return deltas;
    }

    /**
     * Calculate delta for a single entity (subject/topic/subtopic)
     */
    private calculateEntityDelta(
        entityId: string,
        entityType: "subject" | "topic" | "subtopic",
        entityName: string,
        currentMastery: number,
        previousMastery: number,
        totalAttempts: number
    ): MasteryDelta {
        const delta = currentMastery - previousMastery;
        const deltaPercentage =
            previousMastery > 0 ? (delta / previousMastery) * 100 : 0;

        // Classify based on thresholds from config
        let classification: "improvement" | "regression" | "stable";
        if (delta >= coachConfig.masteryDeltaThresholds.improvement) {
            classification = "improvement";
        } else if (delta <= coachConfig.masteryDeltaThresholds.regression) {
            classification = "regression";
        } else {
            classification = "stable";
        }

        // Calculate confidence based on number of attempts
        // More attempts = higher confidence in the delta
        const confidence = this.calculateConfidence(totalAttempts);

        return {
            entityId,
            entityType,
            entityName,
            currentMastery,
            previousMastery,
            delta,
            deltaPercentage,
            classification,
            confidence,
        };
    }

    /**
     * Calculate confidence score based on sample size
     * More attempts = higher confidence
     */
    private calculateConfidence(totalAttempts: number): number {
        if (totalAttempts >= 50) return 1.0; // High confidence
        if (totalAttempts >= 20) return 0.8; // Good confidence
        if (totalAttempts >= 10) return 0.6; // Moderate confidence
        if (totalAttempts >= 5) return 0.4; // Low confidence
        return 0.2; // Very low confidence
    }

    /**
     * Calculate summary statistics
     */
    private calculateSummary(deltas: MasteryDelta[]): {
        totalImprovements: number;
        totalRegressions: number;
        totalStable: number;
        avgDelta: number;
    } {
        const totalImprovements = deltas.filter(
            (d) => d.classification === "improvement"
        ).length;
        const totalRegressions = deltas.filter(
            (d) => d.classification === "regression"
        ).length;
        const totalStable = deltas.filter(
            (d) => d.classification === "stable"
        ).length;

        const totalDelta = deltas.reduce((sum, d) => sum + d.delta, 0);
        const avgDelta = deltas.length > 0 ? totalDelta / deltas.length : 0;

        return {
            totalImprovements,
            totalRegressions,
            totalStable,
            avgDelta,
        };
    }

    /**
     * Get significant deltas (high confidence and large change)
     */
    getSignificantDeltas(
        deltas: MasteryDelta[],
        minConfidence: number = 0.6
    ): MasteryDelta[] {
        return deltas.filter(
            (d) =>
                d.confidence >= minConfidence &&
                (d.classification === "improvement" || d.classification === "regression")
        );
    }

    /**
     * Get top improvements
     */
    getTopImprovements(deltas: MasteryDelta[], count: number = 5): MasteryDelta[] {
        return deltas
            .filter((d) => d.classification === "improvement")
            .sort((a, b) => b.delta - a.delta)
            .slice(0, count);
    }

    /**
     * Get top regressions
     */
    getTopRegressions(deltas: MasteryDelta[], count: number = 5): MasteryDelta[] {
        return deltas
            .filter((d) => d.classification === "regression")
            .sort((a, b) => a.delta - b.delta)
            .slice(0, count);
    }
}
