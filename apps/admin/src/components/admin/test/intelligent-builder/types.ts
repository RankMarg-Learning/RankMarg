export interface DifficultyRange {
  min: number;
  max: number;
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
  difficultyRange: DifficultyRange;
  questionTypes: string[];
  questionFormats: string[];
  questionCategories: string[];
}
