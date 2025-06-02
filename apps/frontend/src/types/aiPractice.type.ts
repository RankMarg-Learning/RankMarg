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