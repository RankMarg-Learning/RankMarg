/**
 * RankMarg Coach Agent Type Definitions
 * Following FAANG-grade engineering principles
 */

// ============================================
// CORE DOMAIN TYPES
// ============================================

export enum StudyPhase {
    FOUNDATION = "FOUNDATION", // > 6 months to exam
    BUILDING = "BUILDING", // 3-6 months to exam
    REVISION = "REVISION", // 1-3 months to exam
    EXAM_READY = "EXAM_READY", // < 1 month to exam
}

export enum RiskType {
    AVOIDANCE = "AVOIDANCE", // Avoiding difficult topics
    BURNOUT = "BURNOUT", // Excessive study hours with declining performance
    FALSE_CONFIDENCE = "FALSE_CONFIDENCE", // High accuracy on easy questions only
    KNOWLEDGE_DECAY = "KNOWLEDGE_DECAY", // Mastery declining over time
}

export enum RiskSeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL",
}

export enum ReportType {
    PERIODIC = "PERIODIC", // Scheduled 14-day reports
    ON_DEMAND = "ON_DEMAND", // User-requested reports
}

// ============================================
// ATTEMPT TELEMETRY
// ============================================

export interface AttemptTelemetry {
    userId: string;
    questionId: string;
    subjectId: string;
    topicId: string;
    subtopicId?: string;
    difficulty: number;
    isCorrect: boolean;
    timeSpent: number; // in seconds
    errorType?: string;
    attemptedAt: Date;
    hintsUsed: boolean;
}

// ============================================
// MASTERY SNAPSHOTS
// ============================================

export interface SubtopicMasterySnapshot {
    subtopicId: string;
    subtopicName: string;
    masteryLevel: number;
    strengthIndex: number;
    totalAttempts: number;
    correctAttempts: number;
    lastPracticed: Date | null;
}

export interface TopicMasterySnapshot {
    topicId: string;
    topicName: string;
    masteryLevel: number;
    strengthIndex: number;
    totalAttempts: number;
    correctAttempts: number;
    subtopics: SubtopicMasterySnapshot[];
    lastPracticed: Date | null;
}

export interface SubjectMasterySnapshot {
    subjectId: string;
    subjectName: string;
    masteryLevel: number;
    totalAttempts: number;
    correctAttempts: number;
    topics: TopicMasterySnapshot[];
    lastPracticed: Date | null;
}

export interface MasterySnapshot {
    userId: string;
    examCode: string;
    snapshotDate: Date;
    subjects: SubjectMasterySnapshot[];
    metadata: {
        totalAttempts: number;
        overallAccuracy: number;
        studyStreak: number;
    };
}

// ============================================
// PERFORMANCE WINDOW (14 DAYS)
// ============================================

export interface TopicPerformance {
    topicId: string;
    topicName: string;
    accuracy: number;
    avgTime: number; // average time per question in seconds
    speedIndex: number; // relative to expected time
    totalAttempts: number;
    correctAttempts: number;
    errorBreakdown: {
        conceptual: number;
        calculation: number;
        careless: number;
    };
}

export interface SubjectPerformance {
    subjectId: string;
    subjectName: string;
    accuracy: number;
    avgTime: number;
    speedIndex: number;
    totalAttempts: number;
    correctAttempts: number;
    topics: TopicPerformance[];
    errorBreakdown: {
        conceptual: number;
        calculation: number;
        careless: number;
    };
}

export interface PerformanceWindow {
    userId: string;
    windowStart: Date;
    windowEnd: Date;
    subjects: SubjectPerformance[];
    overallMetrics: {
        totalAttempts: number;
        overallAccuracy: number;
        avgDailyQuestions: number;
        studyDays: number;
        avgStudyHoursPerDay: number;
    };
}

// ============================================
// MASTERY DELTAS
// ============================================

export interface MasteryDelta {
    entityId: string; // subject/topic/subtopic ID
    entityType: "subject" | "topic" | "subtopic";
    entityName: string;
    currentMastery: number;
    previousMastery: number;
    delta: number;
    deltaPercentage: number;
    classification: "improvement" | "regression" | "stable";
    confidence: number;
}

export interface MasteryComparison {
    userId: string;
    currentSnapshot: MasterySnapshot;
    previousSnapshot: MasterySnapshot;
    deltas: MasteryDelta[];
    summary: {
        totalImprovements: number;
        totalRegressions: number;
        totalStable: number;
        avgDelta: number;
    };
}

// ============================================
// RISK FLAGS
// ============================================

export interface RiskFlag {
    id: string;
    userId: string;
    riskType: RiskType;
    severity: RiskSeverity;
    subjectId?: string;
    topicId?: string;
    description: string;
    evidence: {
        metric: string;
        value: number;
        threshold: number;
    }[];
    detectedAt: Date;
    resolvedAt?: Date;
}

// ============================================
// ROADMAP
// ============================================

export interface DailySession {
    day: number; // 1-14
    date: Date;
    subjects: {
        subjectId: string;
        subjectName: string;
        topics: {
            topicId: string;
            topicName: string;
            sessionType: "practice" | "revision" | "test";
            targetQuestions: number;
            estimatedMinutes: number;
            difficulty: number[];
            priority: "high" | "medium" | "low";
        }[];
    }[];
    totalEstimatedMinutes: number;
    goals: string[];
}

export interface Roadmap {
    userId: string;
    examCode: string;
    studyPhase: StudyPhase;
    generatedAt: Date;
    validFrom: Date;
    validUntil: Date;
    dailySessions: DailySession[];
    constraints: {
        maxSubjectsPerDay: number;
        maxQuestionsPerDay: number;
        maxStudyHoursPerDay: number;
        noNewTopicsInRevision: boolean;
    };
    summary: {
        totalSessions: number;
        totalQuestions: number;
        totalEstimatedHours: number;
        focusAreas: string[];
    };
}

// ============================================
// COACH REPORT
// ============================================

export interface CoachInsights {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    keyObservations: string[];
}

export interface CoachRecommendations {
    immediate: string[]; // Next 3 days
    shortTerm: string[]; // Next 7 days
    longTerm: string[]; // Next 14 days
    studyHabits: string[];
    examStrategy: string[];
}

export interface CoachReport {
    id: string;
    userId: string;
    examCode: string;
    reportType: ReportType;
    generatedAt: Date;

    // Time window
    windowStart: Date;
    windowEnd: Date;

    // Analytics data
    performanceWindow: PerformanceWindow;
    masteryComparison: MasteryComparison;
    riskFlags: RiskFlag[];

    // LLM-generated content
    insights: CoachInsights;
    recommendations: CoachRecommendations;
    roadmap: Roadmap;

    // Metadata
    studyPhase: StudyPhase;
    daysToExam: number;
    version: string;
    tokenUsage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        estimatedCost: number;
    };
    generationTimeMs?: number; // Time taken to generate report
}

// ============================================
// SERVICE INTERFACES
// ============================================

export interface AnalyticsResult {
    performanceWindow: PerformanceWindow;
    masteryComparison: MasteryComparison;
    riskFlags: RiskFlag[];
}

export interface LLMContext {
    userId: string;
    examCode: string;
    studyPhase: StudyPhase;
    daysToExam: number;
    performanceWindow: PerformanceWindow;
    masteryComparison: MasteryComparison;
    riskFlags: RiskFlag[];
}

export interface LLMResponse {
    insights: CoachInsights;
    recommendations: CoachRecommendations;
    reasoning: string;
    tokenUsage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        estimatedCost: number; // in USD
    };
}

// ============================================
// CONFIGURATION
// ============================================

export interface CoachConfig {
    windowDays: number;
    masteryDeltaThresholds: {
        improvement: number;
        regression: number;
    };
    riskThresholds: {
        avoidance: {
            minDaysSinceLastPractice: number;
        };
        burnout: {
            maxStudyHoursPerDay: number;
            minAccuracyThreshold: number;
        };
        falseConfidence: {
            minEasyQuestionPercentage: number;
            minAccuracyOnEasy: number;
            maxAccuracyOnHard: number;
        };
        decay: {
            maxMasteryDrop: number;
            minDaysSinceLastPractice: number;
        };
    };
    roadmapConstraints: {
        maxSubjectsPerDay: number;
        maxQuestionsPerDay: number;
        maxStudyHoursPerDay: number;
        noNewTopicsInRevision: boolean;
    };
    llm: {
        provider: "openai" | "gemini";
        model: string;
        temperature: number;
        maxTokens: number;
        timeout: number;
    };
    redis: {
        snapshotTTL: number; // 90 days
        reportTTL: number; // 30 days
        riskFlagTTL: number; // 60 days
    };
}
