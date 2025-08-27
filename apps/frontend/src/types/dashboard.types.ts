export interface RevisionSubtopicsGrouped {
    subjectId: string;
    subjectName: string;
    subtopics: Array<{
        id: string;
        name: string;
        count: number;
        topicId: string;
        topicName: string;
    }>;
}

export interface SubjectGroup {
    subjectId: string;
    subjectName: string;
    totalCount: number;
    topics: Array<{
        topicId: string;
        topicName: string;
        count: number;
        subtopics: Array<{
            subtopicId: string;
            subtopicName: string;
            count: number;
        }>;
    }>;
}

export interface RevisionSubtopicsData {
    display: string[];
    grouped: RevisionSubtopicsGrouped[];
}

export interface DashboardBasicData {
    revisionSubtopics: RevisionSubtopicsData;
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