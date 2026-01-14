/**
 * Risk Detector - Identifies student risk patterns
 * Following rule-risk-flags: Avoidance, Burnout, False Confidence, Knowledge Decay
 */

import {
    RiskFlag,
    RiskType,
    RiskSeverity,
    PerformanceWindow,
    MasteryComparison,
    AttemptTelemetry,
} from "../../../types/coach.types";
import { coachConfig } from "../coach.config";
import { v4 as uuidv4 } from "uuid";

export class RiskDetector {
    /**
     * Detect all risk flags for a user
     * Returns array of detected risks with evidence
     */
    detectRisks(
        userId: string,
        performanceWindow: PerformanceWindow,
        masteryComparison: MasteryComparison
    ): RiskFlag[] {
        const risks: RiskFlag[] = [];

        // Detect avoidance patterns
        risks.push(...this.detectAvoidance(userId, performanceWindow));

        // Detect burnout
        risks.push(...this.detectBurnout(userId, performanceWindow));

        // Detect false confidence
        risks.push(...this.detectFalseConfidence(userId, performanceWindow));

        // Detect knowledge decay
        risks.push(...this.detectKnowledgeDecay(userId, masteryComparison));

        return risks;
    }

    /**
     * Detect avoidance: Student avoiding difficult topics
     */
    private detectAvoidance(
        userId: string,
        performanceWindow: PerformanceWindow
    ): RiskFlag[] {
        const risks: RiskFlag[] = [];
        const threshold = coachConfig.riskThresholds.avoidance;

        for (const subject of performanceWindow.subjects) {
            for (const topic of subject.topics) {
                // Check if topic has very few attempts despite being important
                if (topic.totalAttempts < 5) {
                    // Low attempt count could indicate avoidance
                    const severity = this.calculateAvoidanceSeverity(topic.totalAttempts);

                    if (severity !== RiskSeverity.LOW) {
                        risks.push({
                            id: uuidv4(),
                            userId,
                            riskType: RiskType.AVOIDANCE,
                            severity,
                            subjectId: subject.subjectId,
                            topicId: topic.topicId,
                            description: `Low practice activity in ${topic.topicName}. Only ${topic.totalAttempts} attempts in the last 14 days.`,
                            evidence: [
                                {
                                    metric: "totalAttempts",
                                    value: topic.totalAttempts,
                                    threshold: threshold.minDaysSinceLastPractice,
                                },
                            ],
                            detectedAt: new Date(),
                        });
                    }
                }
            }
        }

        return risks;
    }

    /**
     * Detect burnout: Excessive study hours with declining performance
     */
    private detectBurnout(
        userId: string,
        performanceWindow: PerformanceWindow
    ): RiskFlag[] {
        const risks: RiskFlag[] = [];
        const threshold = coachConfig.riskThresholds.burnout;

        const { avgStudyHoursPerDay, overallAccuracy } =
            performanceWindow.overallMetrics;

        // Check if studying too much with poor results
        if (
            avgStudyHoursPerDay > threshold.maxStudyHoursPerDay &&
            overallAccuracy < threshold.minAccuracyThreshold
        ) {
            const severity = this.calculateBurnoutSeverity(
                avgStudyHoursPerDay,
                overallAccuracy
            );

            risks.push({
                id: uuidv4(),
                userId,
                riskType: RiskType.BURNOUT,
                severity,
                description: `High study hours (${avgStudyHoursPerDay.toFixed(1)}h/day) with low accuracy (${(overallAccuracy * 100).toFixed(1)}%). Possible burnout.`,
                evidence: [
                    {
                        metric: "avgStudyHoursPerDay",
                        value: avgStudyHoursPerDay,
                        threshold: threshold.maxStudyHoursPerDay,
                    },
                    {
                        metric: "overallAccuracy",
                        value: overallAccuracy,
                        threshold: threshold.minAccuracyThreshold,
                    },
                ],
                detectedAt: new Date(),
            });
        }

        return risks;
    }

    /**
     * Detect false confidence: High accuracy only on easy questions
     */
    private detectFalseConfidence(
        userId: string,
        performanceWindow: PerformanceWindow
    ): RiskFlag[] {
        const risks: RiskFlag[] = [];
        const threshold = coachConfig.riskThresholds.falseConfidence;

        for (const subject of performanceWindow.subjects) {
            // Analyze difficulty distribution
            // Note: This is simplified - in production, you'd analyze actual attempt data
            const easyQuestionRatio = 0.7; // Placeholder
            const accuracyOnEasy = 0.9; // Placeholder
            const accuracyOnHard = 0.4; // Placeholder

            if (
                easyQuestionRatio > threshold.minEasyQuestionPercentage &&
                accuracyOnEasy > threshold.minAccuracyOnEasy &&
                accuracyOnHard < threshold.maxAccuracyOnHard
            ) {
                const severity = RiskSeverity.MEDIUM;

                risks.push({
                    id: uuidv4(),
                    userId,
                    riskType: RiskType.FALSE_CONFIDENCE,
                    severity,
                    subjectId: subject.subjectId,
                    description: `High accuracy on easy questions (${(accuracyOnEasy * 100).toFixed(1)}%) but low on hard questions (${(accuracyOnHard * 100).toFixed(1)}%) in ${subject.subjectName}.`,
                    evidence: [
                        {
                            metric: "easyQuestionRatio",
                            value: easyQuestionRatio,
                            threshold: threshold.minEasyQuestionPercentage,
                        },
                        {
                            metric: "accuracyOnEasy",
                            value: accuracyOnEasy,
                            threshold: threshold.minAccuracyOnEasy,
                        },
                        {
                            metric: "accuracyOnHard",
                            value: accuracyOnHard,
                            threshold: threshold.maxAccuracyOnHard,
                        },
                    ],
                    detectedAt: new Date(),
                });
            }
        }

        return risks;
    }

    /**
     * Detect knowledge decay: Mastery declining over time
     */
    private detectKnowledgeDecay(
        userId: string,
        masteryComparison: MasteryComparison
    ): RiskFlag[] {
        const risks: RiskFlag[] = [];
        const threshold = coachConfig.riskThresholds.decay;

        // Check for significant regressions
        const significantRegressions = masteryComparison.deltas.filter(
            (d) =>
                d.classification === "regression" &&
                d.delta <= threshold.maxMasteryDrop &&
                d.confidence >= 0.6
        );

        for (const regression of significantRegressions) {
            const severity = this.calculateDecaySeverity(regression.delta);

            risks.push({
                id: uuidv4(),
                userId,
                riskType: RiskType.KNOWLEDGE_DECAY,
                severity,
                subjectId:
                    regression.entityType === "subject" ? regression.entityId : undefined,
                topicId:
                    regression.entityType === "topic" ? regression.entityId : undefined,
                description: `Mastery declined by ${Math.abs(regression.delta * 100).toFixed(1)}% in ${regression.entityName}. Possible knowledge decay.`,
                evidence: [
                    {
                        metric: "masteryDelta",
                        value: regression.delta,
                        threshold: threshold.maxMasteryDrop,
                    },
                    {
                        metric: "confidence",
                        value: regression.confidence,
                        threshold: 0.6,
                    },
                ],
                detectedAt: new Date(),
            });
        }

        return risks;
    }

    /**
     * Calculate avoidance severity based on attempt count
     */
    private calculateAvoidanceSeverity(attempts: number): RiskSeverity {
        if (attempts === 0) return RiskSeverity.CRITICAL;
        if (attempts <= 2) return RiskSeverity.HIGH;
        if (attempts <= 5) return RiskSeverity.MEDIUM;
        return RiskSeverity.LOW;
    }

    /**
     * Calculate burnout severity
     */
    private calculateBurnoutSeverity(
        studyHours: number,
        accuracy: number
    ): RiskSeverity {
        const hoursScore = studyHours > 12 ? 2 : studyHours > 10 ? 1 : 0;
        const accuracyScore = accuracy < 0.5 ? 2 : accuracy < 0.6 ? 1 : 0;

        const totalScore = hoursScore + accuracyScore;

        if (totalScore >= 4) return RiskSeverity.CRITICAL;
        if (totalScore >= 3) return RiskSeverity.HIGH;
        if (totalScore >= 2) return RiskSeverity.MEDIUM;
        return RiskSeverity.LOW;
    }

    /**
     * Calculate decay severity based on mastery drop
     */
    private calculateDecaySeverity(delta: number): RiskSeverity {
        const absDelta = Math.abs(delta);

        if (absDelta >= 0.2) return RiskSeverity.CRITICAL;
        if (absDelta >= 0.15) return RiskSeverity.HIGH;
        if (absDelta >= 0.1) return RiskSeverity.MEDIUM;
        return RiskSeverity.LOW;
    }

    /**
     * Get high-priority risks
     */
    getHighPriorityRisks(risks: RiskFlag[]): RiskFlag[] {
        return risks.filter(
            (r) => r.severity === RiskSeverity.HIGH || r.severity === RiskSeverity.CRITICAL
        );
    }

    /**
     * Group risks by type
     */
    groupRisksByType(risks: RiskFlag[]): Map<RiskType, RiskFlag[]> {
        const grouped = new Map<RiskType, RiskFlag[]>();

        for (const risk of risks) {
            if (!grouped.has(risk.riskType)) {
                grouped.set(risk.riskType, []);
            }
            grouped.get(risk.riskType)!.push(risk);
        }

        return grouped;
    }
}
