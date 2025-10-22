import { AnalysisSectionA, SectionAPerformance, TestWithIncludes } from "@/types/typeTest";



export const SectionA = (test: TestWithIncludes): AnalysisSectionA => {

  // Filter out submissions that are not attempted
  const attemptedSubmissions = test.attempt.filter((sub) => sub.status !== 'NOT_ANSWERED');

  // Calculate accuracy
  const correctSubmissions = attemptedSubmissions.filter((sub) => sub.status === 'CORRECT').length;
  const accuracy = (correctSubmissions / attemptedSubmissions.length)*100 || 0.0;

  // Calculate section-wise performance
  const sectionPerformance = test.test.testSection.map((section) => {
    // Get questions in this section
    const sectionQuestionIds = section.testQuestion.map((q) => q.questionId);
    
    // Calculate score for this section 
    const sectionSubmissions = test.attempt.filter((sub) => 
      sectionQuestionIds.includes(sub.questionId)
    );

    

    
    const sectionScore = sectionSubmissions.reduce((acc: number, sub) => 
      acc + (sub.status === 'CORRECT' ? (section.correctMarks || 0) : 
             sub.status === 'INCORRECT' ? -(section.negativeMarks || 0) : 0), 0);

    return {
      sectionName: section.name,
      participantScore: sectionScore,
      totalMarks: (section.correctMarks || 0) * (section.maxQuestions || sectionQuestionIds.length)
    };
  });

  return {
    testTitle: test.test.title,
    accuracy,
    examType: test.test.examType,
    examCode: test.test.examCode,
    participantScore: test.score || 0,
    totalMarks: test.test.totalMarks,
    timeTaken: test.timing,
    testDuration: test.test.duration,
    sectionPerformance: sectionPerformance as SectionAPerformance[]
  };
};

