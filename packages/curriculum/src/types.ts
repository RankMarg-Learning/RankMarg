export type DifficultyBand = "foundation" | "moderate" | "advanced";

export interface TopicResource {
  type: "notes" | "video" | "question-bank" | "pyq" | "lab";
  title: string;
  url?: string;
  description?: string;
}

export interface CurriculumTopic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  difficulty: DifficultyBand;
  tags: string[];
  prerequisites: string[];
  recommendedHours: number;
  weightagePercent: number;
  competencies: string[];
  blueprintNotes?: string;
  resources?: TopicResource[];
}

export interface CurriculumUnit {
  id: string;
  name: string;
  slug: string;
  focus: string;
  topics: CurriculumTopic[];
}

export interface DifficultySplit {
  foundation: number;
  moderate: number;
  advanced: number;
}

export interface SubjectBlueprint {
  marks: number;
  questions: number;
  durationMinutes?: number;
  difficultySplit: DifficultySplit;
  weightageByUnit: Record<string, number>;
}

export interface CurriculumSubject {
  id: string;
  code: string;
  name: string;
  slug: string;
  shortName?: string;
  competencies: string[];
  blueprint: SubjectBlueprint;
  units: CurriculumUnit[];
}

export interface ExamSection {
  id: string;
  name: string;
  questions: number;
  marks: number;
  negativeMarking?: string;
}

export interface ExamCurriculum {
  id: string;
  code: string;
  name: string;
  version: string;
  board: string;
  streams: string[];
  targetGrades: string[];
  description: string;
  metadata: {
    attemptsPerYear: number;
    defaultDurationMinutes: number;
    totalMarks: number;
    markingScheme: string;
    release: string;
  };
  sections: ExamSection[];
  subjects: CurriculumSubject[];
}

export interface ExamCurriculumSummary {
  id: string;
  code: string;
  name: string;
  version: string;
  subjects: number;
  streams: string[];
  totalMarks: number;
  defaultDurationMinutes: number;
}

export interface SubjectSummary {
  code: string;
  name: string;
  units: number;
  questions: number;
  marks: number;
}

export interface TopicSearchParams {
  examCode?: string;
  subjectCode?: string;
  query?: string;
  tags?: string[];
  difficulty?: DifficultyBand[];
  limit?: number;
}

export interface TopicSearchResult {
  examCode: string;
  examName: string;
  subjectCode: string;
  subjectName: string;
  unitName: string;
  topic: CurriculumTopic;
}

