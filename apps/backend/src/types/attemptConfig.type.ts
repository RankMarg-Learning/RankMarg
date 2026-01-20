import {
  AttemptType,
  GradeEnum,
  MistakeType,
  SubmitStatus,
} from "@repo/db/enums";


export interface AttemptsDayData {
  id: string;
  questionId: string;
  type: AttemptType;
  answer: string;
  mistake: string;
  timing: number;
  reactionTime: number;
  status: SubmitStatus;
  hintsUsed: boolean;
  solvedAt: Date;
  subject: {
    id: string;
    name: string;
  };
  topic: {
    id: string;
    name: string;
  };
  subtopic: {
    id: string;
    name: string;
  }[];
  difficulty: number;
  category: string[];
}

export interface AttemptsConfigOptions {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  isPaidUser?: boolean;
  examCode?: string;
  grade?: GradeEnum;
}

export interface attemptsData {
  metrics: metrics;
  difficultyDistribution: difficultyDistribution;
  mistakes_distribution: mistakes_distribution[];
  attempts: Attempts[];
}

export interface metrics {
  no_attempts: number;
  no_correct: number;
  no_incorrect: number;
  no_hints_used: number;
  avg_timing: number;
  avg_reaction_time: number;
  accuracy: number;
  avg_speed: number;
  avg_consistency: number;
  avg_improvement: number;
  max_streak_questions: number;
}

export interface difficultyDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
}
export interface mistakes_distribution {
  type: MistakeType;
  count: number;
}

export interface Attempts {
  id: string;
  questionId: string;
  type: AttemptType;
  answer: string;
  mistake: string;
  timing: number;
  reactionTime: number;
  status: SubmitStatus;
  hintsUsed: boolean;
  solvedAt: Date;
  question: {
    id: string;
    difficulty: number;
    questionTime: number;
    subjectId: string;
    topicId: string;
    subtopicId: string;
  };
}
