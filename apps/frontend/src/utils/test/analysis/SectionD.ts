import { AnalysisSectionD, TestWithIncludes } from "@/types/typeTest";

export const SectionD = (test: TestWithIncludes):AnalysisSectionD => {
    const difficultyAnalysis = {
        easy: { total: 0, correct: 0, incorrect: 0 },
        medium: { total: 0, correct: 0, incorrect: 0 },
        hard: { total: 0, correct: 0, incorrect: 0 }
    };

    test.TestSubmission.forEach(submission => {
        const difficulty = submission.Question.difficulty.toLowerCase();
        
        if (difficulty in difficultyAnalysis) {
            difficultyAnalysis[difficulty].total++;
            
            if (submission.status === 'TRUE') {
                difficultyAnalysis[difficulty].correct++;
            } else if (submission.status === 'FALSE') {
                difficultyAnalysis[difficulty].incorrect++;
            }
        }
    });

    return {
        difficultyWiseAnalysis: difficultyAnalysis,
        totalQuestions: test.TestSubmission.length
    };
}

