import { GradeEnum, QCategory, Stream, Question } from "@prisma/client";

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
  stream: Stream;
  totalQuestions: number;
  grade: GradeEnum;
  questionCategoriesDistribution: Record<string, QCategory[]>;

  difficultyDistribution: {
    difficulty: number[];
  };

  preferences: TopicSelectionPreferences;
}

export type SelectedQuestion = Question;
