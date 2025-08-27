import { AttemptType, SubmitStatus } from "@repo/db/enums";

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
    examCode: string;
  };
  overallMastery: number;
  topics: {
    id: string;
    name: string;
    slug?: string;
    mastery: number;
    weightage: number;
    orderIndex: number;
    estimatedMinutes?: number;
    totalAttempts: number;
    masteredCount: number;
    strengthIndex: number;
    lastPracticed: string | null;
    subtopics: {
      id: string;
      name: string;
      slug?: string;
      mastery: number;
      totalAttempts: number;
      masteredCount: number;
      orderIndex: number;
      estimatedMinutes?: number;
      strengthIndex: number;
      lastPracticed: string | null;
    }[];
  }[];
  sortBy?: string;
  userExamCode?: string;
};
