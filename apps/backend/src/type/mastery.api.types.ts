import {
  AttemptType,
  SubmitStatus,
  MistakeType,
  GradeEnum,
} from "@repo/db/enums";

export interface MasteryAttempt {
  userId: string;
  timing: number | null;
  reactionTime: number | null;
  type?: AttemptType;
  status: SubmitStatus;
  hintsUsed: boolean;
  solvedAt?: Date;
  mistake?: MistakeType;

  question: {
    id: string;
    difficulty: number;
    questionTime: number | null;
    subjectId: string | null;
    topicId: string | null;
    subtopicId: string | null;
    categories?: string[];
  };
}

export interface UserProfileData {
  id: string;
  // stream removed in flexible exam model
  targetYear: number | null;
  studyHoursPerDay: number | null;
  questionsPerDay: number | null;
  grade: GradeEnum;
  xp: number;
  coins: number;
  isActive: boolean;
}

export interface PerformanceTrend {
  recentAccuracy: number;
  accuracyTrend: number; // positive = improving, negative = declining
  speedTrend: number;
  consistencyScore: number;
  improvementRate: number;
  lastWeekPerformance: number;
  lastMonthPerformance: number;
}

export interface EnhancedMasteryData {
  totalAttempts: number;
  correctAttempts: number;
  avgTime: number;
  totalTime: number;
  streak: number;
  lastCorrectDate: Date | null;
  avgDifficulty: number;
  recentAccuracy: number;
  oneDayRepetitions: number;
  threeDayRepetitions: number;

  // Enhanced metrics
  mistakeAnalysis: {
    conceptual: number;
    calculation: number;
    reading: number;
    overconfidence: number;
    other: number;
  };
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  timeDistribution: {
    fast: number; // < 50% of ideal time
    normal: number; // 50-150% of ideal time
    slow: number; // > 150% of ideal time
  };
  spacedRepetitionScore: number;
  forgettingCurveFactor: number;
  adaptiveLearningScore: number;
}

export interface MasteryCalculationContext {
  userProfile: UserProfileData;
  performanceTrend: PerformanceTrend;
  streamConfig: any;
  timeWindow: number;
  referenceDate: Date;
}

export interface HierarchicalMasteryData {
  subtopic: {
    id: string;
    name: string;
    masteryLevel: number;
    strengthIndex: number;
    totalAttempts: number;
    correctAttempts: number;
    lastPracticed: Date | null;
    confidenceLevel: number;
  };
  topic: {
    id: string;
    name: string;
    masteryLevel: number;
    strengthIndex: number;
    totalAttempts: number;
    correctAttempts: number;
    subtopicCount: number;
    masteredSubtopicCount: number;
    weightage: number;
  };
  subject: {
    id: string;
    name: string;
    masteryLevel: number;
    totalAttempts: number;
    correctAttempts: number;
    topicCount: number;
    masteredTopicCount: number;
    overallConfidence: number;
  };
}

export type SubjectMasteryResponseProps = {
  subject: {
    id: string;
    name: string;
    examCode: string;
  };
  overallMastery: number;
  topics: {
    id: string;
    name: string;
    mastery: number;
    weightage: number;
    lastPracticed: string | null;
    subtopics: {
      id: string;
      name: string;
      mastery: number;
      totalAttempts: number;
      masteredCount: number;
      lastPracticed: string | null;
    }[];
  }[];
};
