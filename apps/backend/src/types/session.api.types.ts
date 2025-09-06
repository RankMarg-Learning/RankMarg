import { GradeEnum, QCategory } from "@repo/db/enums";
import { Question } from "@prisma/client";

export interface TopicSelectionPreferences {
  singleTopicPerWeakConcepts: boolean;
  singleTopicPerRevision: boolean;
  weakTopicStrategy: "lowest_mastery" | "lowest_strength" | "mixed";
  revisionTopicStrategy: "due_first" | "oldest_completed" | "mixed";
}

export interface SessionConfig {
  distribution: {
    currentTopic: number;
    weakConcepts: number;
    revisionTopics: number;
  };
  examCode: string;
  totalQuestions: number;
  grade: GradeEnum;
  questionCategoriesDistribution: Record<string, QCategory[]>;

  difficultyDistribution: {
    difficulty: number[];
  };

  preferences: TopicSelectionPreferences;
}

export type SelectedQuestion = Question;
