import { AnalysisSectionB, TestWithIncludes } from "@/types/typeTest"

export const SectionB = (test: TestWithIncludes): AnalysisSectionB => {

    const totalQuestions = test.test.totalQuestions

    const submissions = test.attempt;
    const correct = submissions.filter(sub => sub.status === 'CORRECT').length;
    const incorrect = submissions.filter(sub => sub.status === 'INCORRECT').length;
    const unattempted = totalQuestions - (correct + incorrect);

    const difficultyAnalysis = submissions.reduce((acc: Record<"Easy" | "Medium" | "Hard", { total: number, correct: number }>, sub) => {
        const difficulty = sub.question.difficulty;
        if (!acc[difficulty]) {
            acc[difficulty] = { total: 0, correct: 0 };
        }
        acc[difficulty].total++;
        if (sub.status === 'CORRECT') {
            acc[difficulty].correct++;
        }
        return acc;
    }, {
        Easy:{
            total:0,
            correct:0
        },
        Medium:{
            total:0,
            correct:0
        },
        Hard:{
            total:0,
            correct:0
        }
    });

    // Generate AI feedback
    let feedback = '';
    const accuracy = (correct / totalQuestions) * 100;

    if (accuracy >= 75) {
        feedback = `Excellent performance! You've demonstrated strong understanding across different difficulty levels. Your high accuracy of ${accuracy.toFixed(1)}% shows great preparation.`;
    } else if (accuracy >= 50) {
        feedback = `Good effort! You've shown decent understanding but there's room for improvement. Focus on the ${unattempted} unattempted questions and review the concepts from incorrect answers.`;
    } else {
        feedback = `Keep practicing! Your current accuracy indicates you might need to strengthen your fundamentals. Consider focusing on easier questions first and gradually moving to more challenging ones.`;
    }

    return {
        statistics: {
            totalQuestions,
            correct,
            incorrect,
            unattempted,
            accuracy: accuracy.toFixed(1) + '%'
        },
        difficultyAnalysis,
        feedback
    };
}
