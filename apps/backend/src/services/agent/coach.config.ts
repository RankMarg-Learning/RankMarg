/**
 * RankMarg Coach Agent Configuration
 * Following blueprint specifications and FAANG-grade engineering principles
 */

import { CoachConfig, StudyPhase } from "../../types/coach.types";

export const coachConfig: CoachConfig = {
    // 14-day performance window (hard rule from blueprint)
    windowDays: 14,

    // Mastery delta thresholds (from blueprint)
    masteryDeltaThresholds: {
        improvement: 0.05, // +5% is improvement
        regression: -0.05, // -5% is regression
    },

    // Risk detection thresholds
    riskThresholds: {
        // Avoidance: Student avoiding difficult topics
        avoidance: {
            minDaysSinceLastPractice: 7, // No practice in 7 days = avoidance
        },

        // Burnout: Excessive study with declining performance
        burnout: {
            maxStudyHoursPerDay: 10, // More than 10 hours/day
            minAccuracyThreshold: 0.6, // Accuracy below 60% despite high hours
        },

        // False Confidence: High accuracy only on easy questions
        falseConfidence: {
            minEasyQuestionPercentage: 0.7, // 70%+ questions are easy
            minAccuracyOnEasy: 0.85, // 85%+ accuracy on easy
            maxAccuracyOnHard: 0.5, // <50% accuracy on hard
        },

        // Knowledge Decay: Mastery declining over time
        decay: {
            maxMasteryDrop: -0.1, // 10% drop in mastery
            minDaysSinceLastPractice: 14, // No practice in 14 days
        },
    },

    // Roadmap generation constraints (from blueprint)
    roadmapConstraints: {
        maxSubjectsPerDay: 2, // Max 2 weak subjects per day
        maxQuestionsPerDay: 50, // Reasonable daily limit
        maxStudyHoursPerDay: 8, // Sustainable study hours
        noNewTopicsInRevision: true, // No new topics in revision phase
    },

    // LLM configuration (GPT-4o as per user request)
    llm: {
        provider: "openai",
        model: "gpt-4o",
        temperature: 0.7, // Balanced creativity and consistency
        maxTokens: 2000, // Sufficient for detailed insights
        timeout: 30000, // 30 seconds timeout
    },

    // Redis TTL configuration
    redis: {
        snapshotTTL: 90 * 24 * 60 * 60, // 90 days in seconds
        reportTTL: 30 * 24 * 60 * 60, // 30 days in seconds
        riskFlagTTL: 60 * 24 * 60 * 60, // 60 days in seconds
    },
};

/**
 * Study phase determination based on days to exam
 */
export function determineStudyPhase(daysToExam: number): StudyPhase {
    if (daysToExam > 180) {
        return StudyPhase.FOUNDATION;
    } else if (daysToExam > 90) {
        return StudyPhase.BUILDING;
    } else if (daysToExam > 30) {
        return StudyPhase.REVISION;
    } else {
        return StudyPhase.EXAM_READY;
    }
}

/**
 * Calculate days to exam from target year
 */
export function calculateDaysToExam(targetYear: number, examCode: string): number {
    // Typical exam dates for NEET and JEE
    const examDates: Record<string, { month: number; day: number }> = {
        NEET: { month: 4, day: 5 }, // May 5th
        JEE: { month: 3, day: 15 }, // April 15th
    };

    const examDate = examDates[examCode] || { month: 4, day: 1 };
    const targetExamDate = new Date(targetYear, examDate.month, examDate.day);
    const today = new Date();

    const diffTime = targetExamDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
}

/**
 * Redis key generators for coach data
 */
export const CoachRedisKeys = {
    snapshot: (userId: string, timestamp: number) =>
        `coach:snapshot:${userId}:${timestamp}`,

    latestSnapshot: (userId: string) => `coach:snapshot:${userId}:latest`,

    report: (userId: string, reportId: string) =>
        `coach:report:${userId}:${reportId}`,

    latestReport: (userId: string) => `coach:report:${userId}:latest`,

    riskFlags: (userId: string) => `coach:risks:${userId}`,

    studyPhase: (userId: string) => `coach:phase:${userId}`,

    performanceWindow: (userId: string, windowStart: number) =>
        `coach:performance:${userId}:${windowStart}`,
};

/**
 * Error types for coach agent
 */
export class CoachError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: any
    ) {
        super(message);
        this.name = "CoachError";
    }
}

export class InsufficientDataError extends CoachError {
    constructor(message: string, details?: any) {
        super(message, "INSUFFICIENT_DATA", details);
        this.name = "InsufficientDataError";
    }
}

export class LLMError extends CoachError {
    constructor(message: string, details?: any) {
        super(message, "LLM_ERROR", details);
        this.name = "LLMError";
    }
}

export class ValidationError extends CoachError {
    constructor(message: string, details?: any) {
        super(message, "VALIDATION_ERROR", details);
        this.name = "ValidationError";
    }
}
