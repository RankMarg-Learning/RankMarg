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
