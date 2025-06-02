import { AnalysisSectionD, TestWithIncludes } from "@/types/typeTest";

export const SectionD = (test: TestWithIncludes): AnalysisSectionD => {
    const difficultyAnalysis = {
        easy: { total: 0, correct: 0, incorrect: 0 },
        medium: { total: 0, correct: 0, incorrect: 0 },
        hard: { total: 0, correct: 0, incorrect: 0 },
        very_hard: { total: 0, correct: 0, incorrect: 0 }
    };

    const difficultyMap: Record<number, keyof typeof difficultyAnalysis> = {
        1: "easy",
        2: "medium",
        3: "hard",
        4: "very_hard"
    };

    test.attempt.forEach(submission => {
        const difficultyNumber = submission.question.difficulty;
        const difficulty = difficultyMap[difficultyNumber];
        if (difficulty) {
            difficultyAnalysis[difficulty].total++;

            if (submission.status === 'CORRECT') {
                difficultyAnalysis[difficulty].correct++;
            } else if (submission.status === 'INCORRECT') {
                difficultyAnalysis[difficulty].incorrect++;
            }
        }
    });

    return {
        difficultyWiseAnalysis: difficultyAnalysis,
        totalQuestions: test.attempt.length
    };
}
