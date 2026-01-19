import { SessionPriority } from "@repo/db/enums";

// ============================================
// CURRICULUM TRACKING TYPES
// ============================================

export interface CurriculumAlignment {
    currentTopics: CurrentTopic[];
    nextRecommendedTopics: RecommendedTopic[];
    completionPercentage: number;
    examCoverage: number;
}

export interface CurrentTopic {
    topicId: string;
    topicName: string;
    subjectId: string;
    subjectName: string;
    startedAt: Date;
    questionsAttempted: number;
    masteryLevel: number;
}

export interface RecommendedTopic {
    topicId: string;
    topicName: string;
    subjectId: string;
    subjectName: string;
    weightage: number;
    priority: SessionPriority;
    reason: string;
}

// ============================================
// SESSION METADATA TYPES
// ============================================

export interface SessionMetadata {
    subjectId: string;
    subjectName: string;
    topics: SessionTopicInfo[];
    questionCount: number;
    estimatedDuration: number;
    difficulty: string;
    priority: SessionPriority;
}

export interface SessionTopicInfo {
    topicId: string;
    topicName: string;
    subtopicId?: string;
    subtopicName?: string;
    questionCount: number;
}

// ============================================
// ACTION BUTTON TYPES
// ============================================

export interface ActionButton {
    text: string;
    url: string;
    type: ActionType;
    customLabel?: string;
}

export type ActionType =
    | "START_PRACTICE"
    | "PRACTICE_MORE"
    | "SEE_MASTERY"
    | "MOCK_TEST"
    | "TEST_ANALYSIS"
    | "CHANGE_CURRICULUM"
    | "VIEW_RESULTS";

export interface ActionContext {
    subjectId?: string;
    subjectName?: string;
    topicId?: string;
    topicName?: string;
    topicSlug?: string;
    sessionId?: string;
    testId?: string;
    questionCount?: number;
    streak?: number;
}

// ============================================
// COACHING MOOD & TONE TYPES
// ============================================

export type CoachMood = "encouraging" | "celebratory" | "corrective" | "motivating";
export type ToneStyle = "friendly" | "professional" | "energetic" | "calm";

// ============================================
// ENHANCED ANALYSIS TYPES (Extended)
// ============================================

// Re-export from coach.types for convenience
export interface TopicROI {
    topicId: string;
    topicName: string;
    subjectId: string;
    subjectName: string;
    examWeightage: number;
    masteryLevel: number;
    errorFrequency: number;
    lastPracticed: Date | null;
    roi: number;
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
    missedDays: number;
    incompleteSessions: number;
    avgDailyQuestions: number;
}

export interface MistakeClassification {
    sillyMistakes: number;
    conceptualMistakes: number;
    speedMistakes: number;
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
