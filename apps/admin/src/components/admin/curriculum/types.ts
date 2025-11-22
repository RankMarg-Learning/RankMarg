// Shared types for Curriculum components

export interface FilterState {
  stream: string;
  category: string;
  status: string;
  dateRange: string;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface CurriculumStatsData {
  totalSubjects: number;
  totalTopics: number;
  totalSubtopics: number;
  totalExams: number;
  activeExams: number;
  totalSubjectsInExams: number;
}

export interface DeleteItem {
  type: 'subject' | 'topic' | 'subtopic' | 'exam';
  id: string;
  name: string;
}

