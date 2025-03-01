import { AnalysisSectionE,  TestWithIncludes } from "@/types/typeTest"
import { SubmitStatus } from "@prisma/client"



export const SectionE = (test: TestWithIncludes):AnalysisSectionE[] => {
    const allQuestions = test.test.TestSection.flatMap(section => 
        section.TestQuestion.map(q => q.question)
    )

    // Create a map of question submissions
    const submissionMap = new Map(
        test.TestSubmission.map(submission => [
            submission.Question.id,
            {
                isCorrect: submission.status,
                timing: submission.timing || 0
            }
        ])
    )

    // Create the analysis for each question
    const questionAnalysis: AnalysisSectionE[] = allQuestions.map((question: {
        id: string;
        slug: string;
        subject: string;
        topic: string;
        difficulty: string;
    }) => {
        const submission = submissionMap.get(question.id)
        let status: 'correct' | 'incorrect' | 'unattempted' = 'unattempted'
        if (submission) {
            status = submission.isCorrect === SubmitStatus.TRUE ? 'correct' : 
                     submission.isCorrect === SubmitStatus.FALSE ? 'incorrect' : 
                     'unattempted'
        }

        return {
            slug: question.slug,
            subject: question.subject,
            topic: question.topic,
            difficulty: question.difficulty,
            status: status,
            timeTaken: submission?.timing || 0
        }
    })

    return questionAnalysis
}
