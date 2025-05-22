import { AttemptType, SubmitStatus } from "@prisma/client";

export interface MasteryAttempt {
    userId: string;
    timing: number;
    reactionTime?: number;
    status: SubmitStatus;
    type?: AttemptType;
    hintsUsed: boolean;
    solvedAt?: Date;
  
    question: {
      id:string;
      difficulty: number;
      questionTime: number;
      subjectId: string;
      topicId: string;
      subtopicId: string;
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
