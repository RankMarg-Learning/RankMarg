import { AnalysisSectionE,  TestWithIncludes } from "@/types/typeTest"
import {  SubmitStatus } from "@repo/db/enums"



export const SectionE = (test: TestWithIncludes):AnalysisSectionE[] => {
    const allQuestions = test.test.testSection.flatMap(section => 
        section.testQuestion.map(q => q.question)
    )

    // Create a map of question submissions
    const submissionMap = new Map(
        test.attempt.map(submission => [
            submission.question.id,
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
        subject: {
            name:string;
            id:string;
        };
        topic: {
            id:string;
            name:string;
            subjectId: string;
            weightage: number;
        };
        difficulty: number;
    }) => {
        const submission = submissionMap.get(question.id)
        let status: 'correct' | 'incorrect' | 'unattempted' = 'unattempted'
        if (submission) {
            status = submission.isCorrect === SubmitStatus.CORRECT ? 'correct' : 
                     submission.isCorrect === SubmitStatus.INCORRECT ? 'incorrect' : 
                     'unattempted'
        }

        return {
            slug: question.slug,
            subject: question.subject.name,
            topic: question.topic.name,
            difficulty: question.difficulty,
            status: status,
            timeTaken: submission?.timing || 0
        }
    })

    return questionAnalysis
}
