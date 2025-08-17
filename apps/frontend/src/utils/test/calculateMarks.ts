import { SubmitStatus } from "@repo/db/enums";

export interface SubmissionProps {
    questionId: string;
    status: SubmitStatus;
    timing: number;
  }
  
  export interface testSection {
    correctMarks: number;
    negativeMarks: number;
    isOptional: boolean;
    maxQuestions: number | null;
  }
  
  export const calculateMarks = (
    submissions: SubmissionProps[],
    testSections: Record<string, testSection>
  ): number => {
    let totalMarks = 0;
  
    Object.entries(testSections).forEach(([sectionKey, sectionDetails]) => {
      const { correctMarks, negativeMarks, isOptional, maxQuestions } = sectionDetails;
  
      // Extract the range from the section key (e.g., "Physics_1-3")
      const range = sectionKey.split("_")[1];
      const [start, end] = range ? range.split("-").map(Number) : [0, 0];
  
      if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
        console.error(`Invalid range in section key: ${sectionKey}`);
        return;
      }
  
      // Determine the relevant submissions for this section based on the index range
      const sectionSubmissions = submissions.slice(start - 1, end);
  
      // Count correct and incorrect answers
      const correctAnswers = sectionSubmissions.filter((s) => s.status === "CORRECT").length;
      const incorrectAnswers = sectionSubmissions.filter((s) => s.status === "INCORRECT").length;
  
      // Apply maxQuestions rule if the section is optional
      const effectiveCorrectAnswers = isOptional
        ? Math.min(correctAnswers, maxQuestions ?? correctAnswers)
        : correctAnswers;
  
      // Calculate marks for the section
      const marks =
        effectiveCorrectAnswers * correctMarks - incorrectAnswers * negativeMarks;
  
      // Update total marks
      totalMarks += marks;
    });
  
    return totalMarks;
  };
  