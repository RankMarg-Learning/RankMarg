export interface DashboardBasicData {
    revisionSubtopics: string[];
    todaysProgress: {
        goalMinutes: number;
        minutesStudied: number;
        percentComplete: number;
    };
    userStats: {
        accuracy: number;
        level: number;
        streak: number;
        totalQuestionsSolved: number;
    };
}

export interface CurrentStudies {
    id: string;
    isCompleted: boolean;
    isCurrent: boolean;
    startedAt: string;
    subjectName: string;
    topicName: string;
}

export interface SmartStudyHubProps {
    dashboardData: DashboardBasicData;
    currentStudies: CurrentStudies[];
}

export interface PracticeSession {
    id: string;
    title: string; 
    date: string; 
    difficultyLevel: number;
    isCompleted: boolean;
    duration: number; 
    timeRequired: number; 
    startTime: string | null;
    lastAttempt: string | null;
    accuracy: number; 
    score: string;
    questionsAttempted: number;
    totalQuestions: number;
    keySubtopics: string[];
}

export interface AttemptsDashaboadProps {
    timing: number
}

export interface PerformanceDashboardProps {
    accuracy: number;
    avgScore: number;
    totalAttempts: number;
    streak: number;
}