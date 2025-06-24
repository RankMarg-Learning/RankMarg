import { SuggestionStatus, SuggestionType, TriggerType } from "@prisma/client";

export interface SubjectSummary {
    subject: string;
    totalQuestions: number;
    correctAnswers: number;
    totalAttempts: number;
    accuracyRate: number;
}

export interface OverallSummary {
    accuracyRate: number;
    attempted: number;
    correctAnswers: number;
    timeSpent: number;
    totalQuestions: number;
}

export interface PracticeSummaryProps {
    overallSummary: OverallSummary;
    subjectWiseSummary: SubjectSummary[];
}

export interface StudySuggestionProps {
    id: string;
    userId: string;
    type: SuggestionType;
    triggerType: TriggerType;
    suggestion: string;
    category: string;
    priority: number;
    displayUntil?: string | null; 
    actionName?: string | null;
    actionUrl?: string | null;
    status: SuggestionStatus;
    createdAt: string; 
  }