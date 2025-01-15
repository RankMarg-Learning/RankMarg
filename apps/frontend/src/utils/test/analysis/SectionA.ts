import { AnalysisSectionA, TestWithIncludes } from "@/types/typeTest";



export const SectionA = (test: TestWithIncludes): AnalysisSectionA => {

  // Filter out submissions that are not attempted
  const attemptedSubmissions = test.TestSubmission.filter((sub) => sub.isCorrect !== 'NOT_ANSWERED');

  // Calculate accuracy
  const correctSubmissions = attemptedSubmissions.filter((sub) => sub.isCorrect === 'TRUE').length;
  const accuracy = (correctSubmissions / attemptedSubmissions.length)*100 || 0.0;

  // Calculate section-wise performance
  const sectionPerformance = test.test.TestSection.map((section) => {
    // Get questions in this section
    const sectionQuestionIds = section.TestQuestion.map((q) => q.questionId);
    
    // Calculate score for this section 
    const sectionSubmissions = test.TestSubmission.filter((sub) => 
      sectionQuestionIds.includes(sub.questionId)
    );

    

    
    const sectionScore = sectionSubmissions.reduce((acc: number, sub) => 
      acc + (sub.isCorrect === 'TRUE' ? (section.correctMarks || 0) : 
             sub.isCorrect === 'FALSE' ? -(section.negativeMarks || 0) : 0), 0);

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
    stream: test.test.stream,
    participantScore: test.score || 0,
    totalMarks: test.test.totalMarks,
    timeTaken: test.timing,
    testDuration: test.test.duration,
    sectionPerformance
  };
};

