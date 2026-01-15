import { Prisma } from "@prisma/client";

export interface PerformanceMetrics {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  hintsUsed: number;
  subjectWisePerformance: SubjectPerformance[];
  topicWisePerformance: TopicPerformance[];
  mistakeAnalysis: MistakeAnalysis;
  streakData: StreakData;
}

export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  accuracy: number;
  questionsAttempted: number;
  averageTime: number;
}

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  subjectName: string;
  accuracy: number;
  questionsAttempted: number;
  masteryLevel: number;
  strengthIndex: number;
}

export interface MistakeAnalysis {
  conceptual: number;
  calculation: number;
  reading: number;
  overconfidence: number;
  other: number;
}

export interface StreakData {
  currentStreak: number;
  maxCorrectStreak: number;
  maxWrongStreak: number;
}

export interface SuggestionConfig {
  userId: string;
  triggerType: "DAILY_ANALYSIS";
  priority: number;
  category: string;
  suggestions: string[];
  actionName?: string;
  actionUrl?: string;
}

export type AttemptWithQuestionDetails = Prisma.AttemptGetPayload<{
  include: {
    question: {
      include: {
        subject: true;
        topic: true;
        subTopic: true;
      };
    };
  };
}>;

export interface TopicMap {
  topicId: string;
  topicName: string;
  subjectName: string;
  correct: number;
  incorrect?: number;
  total: number;
}

export interface SubjectMap {
  subjectId: string;
  subjectName: string;
  correct: number;
  incorrect?: number;
  total: number;
  totalTime: number;
}

// ============================================
// NEW: Practice Session Analysis Types
// ============================================

export interface PracticeSessionAnalysis {
  userId: string;
  date: Date;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  unsolvedQuestions: number; // Started but not completed
  questionsWithoutMistakeReason: number; // Wrong but no reason marked
  totalTimeSpent: number; // in minutes
  accuracy: number;
  subjectBreakdown: SubjectPracticeBreakdown[];
  todaySessionTopics: TodaySessionTopic[]; // Topics from today's session
}

export interface SubjectPracticeBreakdown {
  subjectId: string;
  subjectName: string;
  questionsAttempted: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  timeSpent: number;
  commonMistakes: MistakeType[];
  topicsWithErrors: TopicError[];
}

export interface TopicError {
  topicId: string;
  topicName: string;
  subtopicId?: string;
  subtopicName?: string;
  errorCount: number;
  mistakeTypes: MistakeType[];
}

export type MistakeType = 'conceptual' | 'calculation' | 'reading' | 'overconfidence' | 'other';

export interface TodaySessionTopic {
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
// NEW: Coaching Guidance Types
// ============================================

export interface CoachingGuidance {
  userId: string;
  date: Date;
  mood: 'encouraging' | 'motivating' | 'corrective' | 'celebratory';
  primaryFocus: string;
  suggestions: CoachingSuggestion[];
}

export interface CoachingSuggestion {
  category: 'mistake_review' | 'time_management' | 'subject_focus' | 'topic_guidance' | 'motivation' | 'strategy';
  message: string;
  reasoning: string; // Why this suggestion is being made
  actionItems: string[];
  subjectTricks?: SubjectTrick[];
  priority: number;
}

export interface SubjectTrick {
  category: string; // e.g., "Problem-Solving", "Time-Saving", "Common Pitfalls"
  trick: string;
  example?: string;
}

