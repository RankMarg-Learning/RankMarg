import { Prisma } from "@prisma/client";

// ============================================
// RANK COACH TYPES
// ============================================

export interface RankCoachGuidance {
    userId: string;
    date: Date;
    phase: ExamPhase;
    suggestions: CoachSuggestion[]; // Max 2-3 per day
}

export interface CoachSuggestion {
    type: string; // From SuggestionType enum
    category: string; // Custom category for internal tracking
    message: string; // User-facing text guidance
    priority: number; // 1 = highest
    actionName?: string; // Button text (e.g., "Start Practice", "View Analytics")
    actionUrl?: string; // Deep link URL
    sequenceOrder?: number;
}

export type ExamPhase = 'foundation' | 'consolidation' | 'final_prep';

// ============================================
// ENHANCED ANALYSIS TYPES
// ============================================

export interface EnhancedAnalysis {
    // Basic metrics from PracticeSessionAnalysis
    userId: string;
    date: Date;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    accuracy: number;
    totalTimeSpent: number;
    unsolvedQuestions: number;
    questionsWithoutMistakeReason: number;

    // Enhanced metrics for Rank Coach
    topicROI: TopicROI[];
    volumeMetrics: VolumeMetrics;
    difficultyMetrics: DifficultyMetrics;
    consistencyMetrics: ConsistencyMetrics;
    mistakeClassification: MistakeClassification;
    examPhase: ExamPhase;
    daysUntilExam: number;

    // Subject and topic breakdown
    subjectBreakdown: SubjectBreakdown[];
}

export interface TopicROI {
    topicId: string;
    topicName: string;
    subjectId: string;
    subjectName: string;
    examWeightage: number; // 0-1 scale
    masteryLevel: number; // 0-100
    errorFrequency: number; // Last 7 days
    lastPracticed: Date | null;
    roi: number; // Calculated: weightage * (1 - mastery/100) * errorFrequency
}

export interface VolumeMetrics {
    yesterdayQuestions: number;
    last7DaysAvg: number;
    last30DaysAvg: number;
    subjectDistribution: { subject: string; count: number }[];
}

export interface DifficultyMetrics {
    avgDifficulty: number;
    easyPercentage: number;
    mediumPercentage: number;
    hardPercentage: number;
    accuracyByDifficulty: { difficulty: number; accuracy: number }[];
}

export interface ConsistencyMetrics {
    currentStreak: number;
    missedDays: number; // Last 7 days
    incompleteSessions: number; // Last 7 days
    avgDailyQuestions: number;
}

export interface MistakeClassification {
    sillyMistakes: number; // Reading, calculation errors
    conceptualMistakes: number; // Understanding gaps
    speedMistakes: number; // Time pressure errors
    totalMistakes: number;
}

export interface SubjectBreakdown {
    subjectId: string;
    subjectName: string;
    questionsAttempted: number;
    correctAnswers: number;
    wrongAnswers: number;
    accuracy: number;
    timeSpent: number;
    commonMistakes: string[];
    topicsWithErrors: TopicError[];
}

export interface TopicError {
    topicId: string;
    topicName: string;
    subtopicId?: string;
    subtopicName?: string;
    errorCount: number;
    mistakeTypes: string[];
}

export interface SessionTopic {
    subjectId: string;
    subjectName: string;
    topicId: string;
    topicName: string;
    subtopicId?: string;
    subtopicName?: string;
    questionsAttempted: number;
    accuracy: number;
}

// ============================================
// ATTEMPT TYPE WITH DETAILS
// ============================================

export type AttemptWithDetails = Prisma.AttemptGetPayload<{
    include: {
        question: {
            select: {
                id: true,
                difficulty: true,
                subjectId: true,
                topicId: true,
                subtopicId: true,
                subject: true,
                topic: true,
                subTopic: true,
            };
        };
    };
}>;
