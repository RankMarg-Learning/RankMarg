import { QCategory } from "@repo/db/enums";

// Base types for the exam configuration
interface MarkingScheme {
  marks_per_correct: number;
  marks_per_wrong: number;
  marks_per_unattempt: number;
}

interface DifficultyDistribution {
  easy_pct: number;
  medium_pct: number;
  hard_pct: number;
  very_hard_pct: number;
}

interface QuestionTypeWeights {
  [QCategory.CALCULATION]: number;
  [QCategory.APPLICATION]: number;
  [QCategory.THEORETICAL]: number;
  [QCategory.TRICKY]: number;
  [QCategory.FACTUAL]: number;
  [QCategory.TRAP]: number;
  [QCategory.GUESS_BASED]?: number;
  [QCategory.MULTI_STEP]: number;
  [QCategory.OUT_OF_THE_BOX]: number;
  [QCategory.ELIMINATION_BASED]: number;
  [QCategory.MEMORY_BASED]: number;
  [QCategory.CONFIDENCE_BASED]: number;
  [QCategory.HIGH_WEIGHTAGE]: number;
  [QCategory.CONCEPTUAL]: number;
  [QCategory.FORMULA_BASED]: number;
}

interface Subject {
  id: string;
  name: string;
  share_percentage: number;
  min_questions?: number;
  max_questions?: number;
  fixed_questions: number;
  avg_time_per_question_in_secs: number;
  difficulty_distribution: DifficultyDistribution;
  question_type_weights: QuestionTypeWeights;
}

interface Constraints {
  min_subject_questions: number;
  max_subject_questions: number;
  min_difficulty_questions_per_subject: number;
}

interface ExamConfig {
  exam_id: string;
  exam_name: string;
  total_questions: number;
  total_marks: number;
  duration_mins: number;
  marking_scheme: MarkingScheme;
  subjects: Subject[];
  global_difficulty_bias: DifficultyDistribution;
  constraints: Constraints;
}

interface ExamConfiguration {
  JEE: ExamConfig;
  NEET: ExamConfig;
}

type Exam = ExamConfiguration;

export type {
  Exam,
  ExamConfig,
  Subject,
  MarkingScheme,
  DifficultyDistribution,
  QuestionTypeWeights,
  Constraints,
};
