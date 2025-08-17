import { TriggerType } from "@repo/db/enums";

export interface UserActivity {
  userId: string;
  date: Date;
  studyTime?: number; // For DAILY_ANALYSIS, General
  questionsSolved?: number; // For DAILY_ANALYSIS, STREAK_MILESTONE
  accuracy?: number; // For DAILY_ANALYSIS, POST_EXAM, Mastery
  subjectAccuracy?: { [subject: string]: number }; // For POST_EXAM, Mastery
  testScore?: number; // For POST_EXAM, Test
  currentStreak?: number; // For STREAK_MILESTONE, Streak
  lastActiveDate?: Date; // For INACTIVITY, Wellness
  upcomingExams?: { subject: string; date: Date }[]; // For EXAM_PROXIMITY, Test
}

export interface SuggestionContext {
  userId: string;
  triggerType: TriggerType;
  currentDate: Date;
}

export interface SuggestionHandler {
  generate(userId: string): Promise<void>;
}

export interface GeneratedSuggestion {
  suggestion: string;
  type: SuggestionType;
  category: string;
  priority: number;
  actionName?: string;
  actionUrl?: string;
  triggerType: TriggerType;
  badgeId?: string;
  displayUntil?: Date;
}

export enum SuggestionType {
  MOTIVATION = "MOTIVATION",
  CELEBRATION = "CELEBRATION",
  REMINDER = "REMINDER",
  WARNING = "WARNING",
  GUIDANCE = "GUIDANCE",
}

export type Condition =
  | {
      type:
        | "test_score"
        | "accuracy"
        | "study_time"
        | "questions_solved"
        | "streak"
        | "inactivity"
        | "exam_proximity"
        | "correct_answers_ratio"
        | "isCompleted"
        | "duration";
      operator: "lt" | "gte" | "eq";
      value: number | boolean;
    }
  | { type: "always" };

export interface Rule {
  priority: number;
  condition: Condition;
  suggestion: string;
  type:
    | "GUIDANCE"
    | "CELEBRATION"
    | "WARNING"
    | "REMINDER"
    | "MOTIVATION"
    | "ENCOURAGEMENT"
    | "WELLNESS";
  duration: number;

  metadata?: {
    actionName?: string;
    actionUrl?: string;
    resourceLink?: string;
  };
  badgeId?: string;

  category?: string;
}

interface RuleSet {
  category: string;
  rules: Rule[];
}

export type RuleBook = Record<string, RuleSet>;
