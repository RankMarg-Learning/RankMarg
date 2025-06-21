import { GradeEnum, QCategory, Stream } from "@prisma/client";

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

  // subjects: Record<string, number>;
}

export interface SelectectedQuestion {
  id: string;
}
