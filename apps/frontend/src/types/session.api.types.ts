import { QCategory, Stream } from "@prisma/client";

export interface SessionConfig {

    distribution: {
        currentTopic: number;
        weakConcepts: number;
        revisionTopics: number;
        pyq: number;
    };
    stream:Stream;
    totalQuestions: number;
    questionCategoriesDistribution: Record<string, QCategory[]>;

    difficultyDistribution: {
        difficulty: number[];
    };

    // subjects: Record<string, number>;
}