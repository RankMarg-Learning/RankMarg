import { Question } from "@prisma/client";

export * from "./typeAPI";


export type QuestionWithOptions = Question & {
  options: Option[];
};

export interface Userprops {
  id: string;
  username: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  provider: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface QuestionProps {
  id: string;
  slug: string;
  type: "MCQ" | "NUM" ;
  content: string;
  difficulty: string;
  topic: string;
  subject: string;
  class: string;
  tag?: string;
  options: Option[];
  isnumerical?: number;
  attempts: Attempt[];
  solution?:string;
  challenge: ChallengeProps[];
  accuracy?: number;
  questionTime?: number;
  createdAt: string;
  ActiveCooldown:number;
}
export interface Option {
  id: string;
  content: string;
  isCorrect: boolean;
  questionId: string;
}

export interface Attempt {
  userId: string;
  questionId: string;
  isCorrect: boolean;
  solvedAt: string;
}

export interface ChallengeProps {
  challengeId: string;
  player1Id: string;
  player2Id?: string;
  status: string;
  result?: string;
  questions: QuestionProps[];
  player1Score: number;
  player2Score: number;
  startTime: Date;
  endedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContributeFormProps {
  slug: string;
  title: string;
  topicTitle: string;
  questionType: "MCQ" | "NUM" ;
  std: string;
  difficulty: string;
  subject: string;
  tag?: string;
  content: string;
  options?: Option[];
  questionTime?: number;
  numericalAnswer?: number;
  solution?: string;
  stream?: "NEET" | "JEE";
  hint: string;
  subTopic: string;
  category: string;
}


export interface QuestionTableProps {
  id: string,
  slug: string,
  title: string,
  content: string,
  difficulty: string,
  topic: string,
  subject: string,
  class: string,
  questionTime: number,
  tag: string,
  accuracy: string,
  createdAt: string,
  attempts: Attempt[],
}


export interface QuestionSetProps {
  questionSet: QuestionTableProps[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export type PlayerDetails = {
  id: string;
  username: string;
  attempt: number[];
  rank: number;
  avatar: string;
  playerScore: number;
};

export type DetailsProps = {
  result: string;
  questions: Question[];
  player1: PlayerDetails;
  player2: PlayerDetails;
  status: string;
};

import { Prisma } from '@prisma/client';

export type ChallengeWithDetails = Prisma.ChallengeGetPayload<{
  select: {
    challengeId: true;
    player1Id: true;
    player2Id: true;
    status: true;
    result: true;
    ChallengeQuestion: {
      select: {
        question: true,
      }
    },
    player1: {
      select: {
        id: true;
        username: true;
        avatar: true;
        rank: true;
      };
    };
    player2: {
      select: {
        id: true;
        username: true;
        avatar: true;
        rank: true;
      };
    };
    player1Score: true;
    player2Score: true;
    attemptByPlayer1: true;
    attemptByPlayer2: true;
    endedAt: true;
    createdAt: true;
  };
}>;
