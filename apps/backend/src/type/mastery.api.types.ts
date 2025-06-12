import { AttemptType, SubmitStatus } from "@prisma/client";

export interface MasteryAttempt {
  userId: string;
  timing: number | null;
  reactionTime: number | null;
  type?: AttemptType;
  status: SubmitStatus;
  hintsUsed: boolean;
  solvedAt?: Date;

  question: {
    id: string;
    difficulty: number;
    questionTime: number | null;
    subjectId: string | null;
    topicId: string | null;
    subtopicId: string | null;
  };
}

export type SubjectMasteryResponseProps = {
  subject: {
    id: string;
    name: string;
    stream: string;
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
