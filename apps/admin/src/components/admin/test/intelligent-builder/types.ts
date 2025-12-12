export interface DifficultyRange {
  min: number;
  max: number;
}

export interface WeightageItem {
  id: string;
  weightage?: number; // 1-100, optional
}

export interface SectionFilter {
  name: string;
  isOptional: boolean;
  maxQuestions?: number;
  correctMarks: number;
  negativeMarks: number;
  questionCount: number;
  subjectId: string;
  topicIds: string[];
  topicWeightages?: Record<string, number>; // topicId -> weightage (1-100)
  difficultyRange: DifficultyRange;
  questionTypes: string[];
  questionTypeWeightages?: Record<string, number>; // type -> weightage (1-100)
  questionFormats: string[];
  questionFormatWeightages?: Record<string, number>; // format -> weightage (1-100)
  questionCategories: string[];
  questionCategoryWeightages?: Record<string, number>; // category -> weightage (1-100)
}
