export interface AvailableTestProps {
    testId: string;
    title: string;
    description: string;
    totalQuestions: number;
    subjects: string;
    duration: string;
    difficulty: string;
    updatedAt: string;
    featured?: boolean;
    recommended?: boolean;
    isLocked?: boolean;
    userTestCount?: number | null;
    monthlyLimit?: number | null;
}

export interface TestCardProps {
    test: AvailableTestProps;
    onStartTest: (testId: string) => void;
    isLimitExceeded?: boolean;
}

export interface AvailableTestsProps {
    tests?: AvailableTestProps[];
    isLimitExceeded?: boolean;
    onStartTest: (testId: string) => void;
    onFilterChange?: (filter: string) => void;
    activeFilter?: string;
}