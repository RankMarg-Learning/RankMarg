import { QCategory } from "@repo/db/enums";

export interface SessionConfig {

    distribution: {
        currentTopic: number;
        weakConcepts: number;
        revisionTopics: number;
        pyq: number;
    };
    totalQuestions: number;
    questionCategoriesDistribution: Record<string, QCategory[]>;

    difficultyDistribution: {
        difficulty: number[];
    };

    // subjects: Record<string, number>;
}