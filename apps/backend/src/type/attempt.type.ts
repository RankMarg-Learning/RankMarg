import { AttemptType, MistakeType, SubmitStatus } from "@prisma/client";

export interface AttemptService_ANA {
  userId: string;
  type: AttemptType;
  mistake: MistakeType | "NONE";
  timing: number;
  status: SubmitStatus;
  hintsUsed: boolean;
  difficulty: number;
  subject: string;
  topic: string;
  subTopic: string;
  solvedAt: Date;
}

export interface PerformanceSummary {
  isTestGiven: boolean;
  total_questions: number;
  subtopic: Record<string, SubtopicStats>;
  mistake_recorded: MistakeRecord[];
}

export interface SubtopicStats {
  no_questions: number;
  no_correct: number;
  no_hints_used: number;
  avg_timing: number;
  avg_difficulty: number;
  difficulty: Record<number, DifficultyStats>;
}
export interface DifficultyStats {
  total: number;
  correct: number;
  avg_time: number;
}

export interface MistakeRecord {
  [key: string]: number;
}
