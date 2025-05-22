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
}

export interface TestCardProps {
    test: AvailableTestProps;
    onStartTest: (testId: string) => void;
}

export interface AvailableTestsProps {
    tests?: AvailableTestProps[];
    onStartTest: (testId: string) => void;
    onFilterChange?: (filter: string) => void;
    activeFilter?: string;
}