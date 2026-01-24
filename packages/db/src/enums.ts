export const Role = {
  USER: "USER",
  INSTRUCTOR: "INSTRUCTOR",
  ADMIN: "ADMIN",
} as const;

export const Provider = {
  GOOGLE: "google",
  CREDENTIALS: "credentials",
} as const;

export const StandardEnum = {
  CLASS_9: "CLASS_9",
  CLASS_10: "CLASS_10",
  CLASS_11: "CLASS_11",
  CLASS_12: "CLASS_12",
  CLASS_13: "CLASS_13",
  CLASS_14: "CLASS_14",
} as const;

export const GradeEnum = {
  A_PLUS: "A_PLUS",
  A: "A",
  B: "B",
  C: "C",
  D: "D",
} as const;

export const QuestionType = {
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  INTEGER: "INTEGER",
  SUBJECTIVE: "SUBJECTIVE",
} as const;

export const QuestionFormat = {
  SINGLE_SELECT: "SINGLE_SELECT",
  MULTIPLE_SELECT: "MULTIPLE_SELECT",
  TRUE_FALSE: "TRUE_FALSE",
  MATCHING: "MATCHING",
  ASSERTION_REASON: "ASSERTION_REASON",
  COMPREHENSION: "COMPREHENSION",
  MATRIX_MATCH: "MATRIX_MATCH",
} as const;

export const QCategory = {
  CALCULATION: "CALCULATION",
  APPLICATION: "APPLICATION",
  THEORETICAL: "THEORETICAL",
  TRICKY: "TRICKY",
  FACTUAL: "FACTUAL",
  TRAP: "TRAP",
  GUESS_BASED: "GUESS_BASED",
  MULTI_STEP: "MULTI_STEP",
  OUT_OF_THE_BOX: "OUT_OF_THE_BOX",
  ELIMINATION_BASED: "ELIMINATION_BASED",
  MEMORY_BASED: "MEMORY_BASED",
  CONFIDENCE_BASED: "CONFIDENCE_BASED",
  HIGH_WEIGHTAGE: "HIGH_WEIGHTAGE",
  CONCEPTUAL: "CONCEPTUAL",
  FORMULA_BASED: "FORMULA_BASED",
} as const;

export const AttemptType = {
  NONE: "NONE",
  SESSION: "SESSION",
  TEST: "TEST",
} as const;

export const SubmitStatus = {
  CORRECT: "CORRECT",
  INCORRECT: "INCORRECT",
  MARK_FOR_REVIEW: "MARK_FOR_REVIEW",
  ANSWERED_MARK: "ANSWERED_MARK",
  NOT_ANSWERED: "NOT_ANSWERED",
} as const;

export const MistakeType = {
  NONE: "NONE",
  CONCEPTUAL: "CONCEPTUAL",
  CALCULATION: "CALCULATION",
  READING: "READING",
  OVERCONFIDENCE: "OVERCONFIDENCE",
  OTHER: "OTHER",
} as const;

export const TestStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
} as const;

export const Visibility = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
  RESTRICTED: "RESTRICTED",
} as const;

export const ExamType = {
  FULL_LENGTH: "FULL_LENGTH",
  SUBJECT_WISE: "SUBJECT_WISE",
  CHAPTER_WISE: "CHAPTER_WISE",
  ONBOARDING: "ONBOARDING",
  CUSTOM: "CUSTOM",
  PYQ: "PYQ",
  SPEED_TEST: "SPEED_TEST",
  WEAKNESS_BASED: "WEAKNESS_BASED",
  ADAPTIVE: "ADAPTIVE",
  DAILY_CHALLENGE: "DAILY_CHALLENGE",
  SIMULATION: "SIMULATION",
} as const;

export const TestParticipationStatus = {
  JOIN: "JOIN",
  STARTED: "STARTED",
  COMPLETED: "COMPLETED",
} as const;

export const MetricType = {
  TOTAL_QUESTIONS: "TOTAL_QUESTIONS",
  CORRECT_ATTEMPTS: "CORRECT_ATTEMPTS",
  MASTERY_LEVEL: "MASTERY_LEVEL",
  TEST_SCORE: "TEST_SCORE",
} as const;

export const SuggestionType = {
  ENCOURAGEMENT: "ENCOURAGEMENT",
  WARNING: "WARNING",
  CELEBRATION: "CELEBRATION",
  GUIDANCE: "GUIDANCE",
  REMINDER: "REMINDER",
  MOTIVATION: "MOTIVATION",
  WELLNESS: "WELLNESS",
} as const;

export const TriggerType = {
  POST_EXAM: "POST_EXAM",
  SESSION_ANALYSIS: "SESSION_ANALYSIS",
  DAILY_ANALYSIS: "DAILY_ANALYSIS",
  WEEKLY_ANALYSIS: "WEEKLY_ANALYSIS",
  MONTHLY_ANALYSIS: "MONTHLY_ANALYSIS",
  STREAK_MILESTONE: "STREAK_MILESTONE",
  INACTIVITY: "INACTIVITY",
  EXAM_PROXIMITY: "EXAM_PROXIMITY",
  ONBOARDING: "ONBOARDING",
} as const;

export const SuggestionCategory = {
  STUDY_PROMPT: "STUDY_PROMPT",
  SUMMARIZATION: "SUMMARIZATION",
  PRACTICE_PROMPT: "PRACTICE_PROMPT",
  OTHER: "OTHER",
} as const;

export const SuggestionStatus = {
  ACTIVE: "ACTIVE",
  VIEWED: "VIEWED",
  DISMISSED: "DISMISSED",
} as const;

export const NotificationStatus = {
  UNREAD: "UNREAD",
  READ: "READ",
  DISMISSED: "DISMISSED",
} as const;

export const PaymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  CANCELLED: "CANCELLED",
} as const;

export const SubscriptionStatus = {
  TRIAL: "TRIAL",
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
  PAST_DUE: "PAST_DUE",
} as const;

export const PaymentProvider = {
  PLATFORM: "PLATFORM",
  SALES_AGENT: "SALES_AGENT",
  NONE: "NONE",
} as const;

// Type exports for TypeScript usage
export type Role = (typeof Role)[keyof typeof Role];
export type Provider = (typeof Provider)[keyof typeof Provider];
export type StandardEnum = (typeof StandardEnum)[keyof typeof StandardEnum];
export type GradeEnum = (typeof GradeEnum)[keyof typeof GradeEnum];
export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];
export type QuestionFormat =
  (typeof QuestionFormat)[keyof typeof QuestionFormat];
export type QCategory = (typeof QCategory)[keyof typeof QCategory];
export type AttemptType = (typeof AttemptType)[keyof typeof AttemptType];
export type SubmitStatus = (typeof SubmitStatus)[keyof typeof SubmitStatus];
export type MistakeType = (typeof MistakeType)[keyof typeof MistakeType];
export type TestStatus = (typeof TestStatus)[keyof typeof TestStatus];
export type Visibility = (typeof Visibility)[keyof typeof Visibility];
export type ExamType = (typeof ExamType)[keyof typeof ExamType];
export type TestParticipationStatus =
  (typeof TestParticipationStatus)[keyof typeof TestParticipationStatus];
export type MetricType = (typeof MetricType)[keyof typeof MetricType];
export type SuggestionType =
  (typeof SuggestionType)[keyof typeof SuggestionType];
export type TriggerType = (typeof TriggerType)[keyof typeof TriggerType];
export type SuggestionStatus =
  (typeof SuggestionStatus)[keyof typeof SuggestionStatus];
export type NotificationStatus =
  (typeof NotificationStatus)[keyof typeof NotificationStatus];
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
export type SubscriptionStatus =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];
export type PaymentProvider =
  (typeof PaymentProvider)[keyof typeof PaymentProvider];

export const ExamPhase = {
  FOUNDATION: "FOUNDATION",
  CONSOLIDATION: "CONSOLIDATION",
  FINAL_PREP: "FINAL_PREP",
} as const;

export const SessionPriority = {
  HIGH_ROI: "HIGH_ROI",
  WEAK_TOPIC: "WEAK_TOPIC",
  REVISION: "REVISION",
  CURRICULUM: "CURRICULUM",
} as const;

export type ExamPhase = (typeof ExamPhase)[keyof typeof ExamPhase];
export type SessionPriority = (typeof SessionPriority)[keyof typeof SessionPriority];
