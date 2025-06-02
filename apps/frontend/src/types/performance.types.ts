export type RecentTestScoresProps = {
    date: string;
    score: number;
    timing: number;
    accuracy: number;
};

export type Metric = {
    value: string;
    delta: string;
    suggestion: string;
};

export type AnalyticsMetricsProps = {
    CORRECT_ATTEMPTS: Metric;
    MASTERY_LEVEL: Metric;
    TEST_SCORE: Metric;
    TOTAL_QUESTIONS: Metric;
};

export type DifficultyDistribution = {
    easy: number;
    medium: number;
    hard: number;
    veryHard: number;
};

export type DifficultyMetricsProps = {
    distribution: DifficultyDistribution;
    recommendation: string;
};

export type TimingByDifficulty = {
    easy: number;
    medium: number;
    hard: number;
    veryHard: number;
};

export type TimingMetricsProps = {
    byDifficulty: TimingByDifficulty;
    recommendation: string;
};

