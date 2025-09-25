import { GradeEnum, QCategory } from "@repo/db/enums";
import { Question } from "@prisma/client";

export interface TopicSelectionPreferences {
  singleTopicPerWeakConcepts: boolean;
  singleTopicPerRevision: boolean;
  weakTopicStrategy: "lowest_mastery" | "lowest_strength" | "mixed";
  revisionTopicStrategy: "due_first" | "oldest_completed" | "mixed";
}
export interface SessionConfig {
  userId: string;
  isPaidUser: boolean;
  examCode: string;
  grade: GradeEnum;
  totalQuestions: number;
  attempts: {
    nDays: number;
    questionIds: string[];
  };
  distribution: {
    currentTopic: number;
    weakConcepts: number;
    revisionTopics: number;
  };
  questionCategoriesDistribution: Record<string, QCategory[]>;

  difficultyDistribution: {
    difficulty: number[];
  };

  preferences: TopicSelectionPreferences;
}

export type SelectedQuestion = Question;
