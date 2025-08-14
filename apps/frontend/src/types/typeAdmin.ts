import { QuestionType, Stream } from "@prisma/client";



export enum QuestionFormat {
  SINGLE_SELECT = "SINGLE_SELECT",
  MULTIPLE_SELECT = "MULTIPLE_SELECT",
  TRUE_FALSE = "TRUE_FALSE",
  MATCHING = "MATCHING",
  ASSERTION_REASON = "ASSERTION_REASON",
  COMPREHENSION = "COMPREHENSION",
  MATRIX_MATCH = "MATRIX_MATCH"
}

export enum QCategory {
  CALCULATION = "CALCULATION",
  APPLICATION = "APPLICATION",
  THEORETICAL = "THEORETICAL",
  TRICKY = "TRICKY",
  FACTUAL = "FACTUAL",
  TRAP = "TRAP",
  GUESS_BASED = "GUESS_BASED",
  MULTI_STEP = "MULTI_STEP",
  OUT_OF_THE_BOX = "OUT_OF_THE_BOX",
  ELIMINATION_BASED = "ELIMINATION_BASED",
  MEMORY_BASED = "MEMORY_BASED",
  CONFIDENCE_BASED = "CONFIDENCE_BASED",
  HIGH_WEIGHTAGE = "HIGH_WEIGHTAGE",
  CONCEPTUAL = "CONCEPTUAL",
  FORMULA_BASED = "FORMULA_BASED"
}

export enum FormStep {
  BASIC_INFO = 0,
  SECTIONS = 1,
  REVIEW = 2
}

export enum ExamType {
  FULL_LENGTH = "FULL_LENGTH",
  SUBJECT_WISE = "SUBJECT_WISE",
  CHAPTER_WISE = "CHAPTER_WISE",
  ONBOARDING = "ONBOARDING",
  CUSTOM = "CUSTOM",
  PYQ = "PYQ",
  SPEED_TEST = "SPEED_TEST",
  WEAKNESS_BASED = "WEAKNESS_BASED",
  ADAPTIVE = "ADAPTIVE",
  DAILY_CHALLENGE = "DAILY_CHALLENGE",
  SIMULATION = "SIMULATION"
}

export enum TestStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED"
}

export enum Visibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  RESTRICTED = "RESTRICTED"
}

export interface User {
  id: string;
  name: string;
  email: string;
}


export interface Question {
  id: string;
  title: string;
  slug: string;
  type: QuestionType;
  format: QuestionFormat;
  content: string;
  difficulty: number;
  category?: QCategory[];
  subtopicId?: string;
  topicId?: string;
  subjectId?: string;
  stream?: Stream;
  pyqYear?: string;
  book?: string;
  commonMistake?: string;
  isNumerical?: number;
  solution?: string;
  questionTime?: number;
  hint?: string;
  isPublished?: boolean;
  options: Option[];
  createdBy?: string;
  createdAt: string;
  QusetionInsights?: QuestionInsights;
}

export interface QuestionInsights {
  id: string;
  questionId: string;
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  avgHintsUsed: number;
  accuracy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Option {
  id?: string;
  content: string;
  isCorrect: boolean;
  questionId?: string;
}

export interface test {
  testId: string;
  title: string;
  description?: string;
  stream?: Stream;
  totalMarks?: number;
  totalQuestions?: number;
  status?: TestStatus;
  visibility?: Visibility;
  referenceId?: string;
  testKey?: string;
  difficulty?: string;
  duration: number;
  examType?: ExamType;
  startTime?: Date;
  endTime?: Date;
  createdBy: string;
  testSection?: testSection[];
  updatedAt?: string;
  createdAt: string;
}

export interface testSection {
  id?: string;
  testId?: string;
  name: string;
  isOptional: boolean;
  maxQuestions?: number;
  correctMarks?: number;
  negativeMarks?: number;
  testQuestion?: testQuestion[];
}

export interface testQuestion {
  id: string;
  title?: string;
  testSectionId?: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
  excerpt?: string;
  authorId: string;
  isPublished: boolean;
  publishedAt?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Exam {
  id: string;
  name: string;
  fullName?: string;
  description?: string;
  category?: string;
  minDifficulty: number;
  maxDifficulty: number;
  totalMarks: number;
  duration: number;
  negativeMarking: boolean;
  negativeMarkingRatio?: number;
  isActive: boolean;
  registrationStartAt?: string;
  registrationEndAt?: string;
  examDate?: string;
  examSubjects?: ExamSubject[];
  createdAt: string;
  updatedAt: string;
}

export interface ExamSubject {
  examId: string;
  subjectId: string;
  weightage: number;
  subject?: Subject;
}

export interface Subject {
  id: string;
  name: string;
  shortName?: string;
  stream: Stream;
  topics?: Topic[];
  examSubjects?: ExamSubject[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Topic {
  id: string;
  name: string;
  slug?: string;
  subjectId: string;
  weightage?: number;
  orderIndex: number;
  estimatedMinutes?: number;
  subtopics?: Subtopic[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Subtopic {
  id: string;
  name: string;
  slug?: string;
  topicId: string;
  orderIndex: number;
  estimatedMinutes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionTopic {
  questionId: string;
  topicId: string;
}

export interface QuestionFilter {
  page: number;
  subjectId?: string | null;
  topicId?: string | null;
  subtopicId?: string | null;
  difficulty?: number | null;
  category?: QCategory;
  className?: string;
  pyqYear?: string | null;
  stream?: Stream;
  type?: QuestionType;
  search?: string | null;
  isPublished?: boolean;
  skip: number;
  limit: number;
}