"use client"
import { QuestionWithOptions } from '@/types';
import { QuestionStatus } from '@/utils';
import { calculateMarks } from '@/utils/test/calculateMarks';
import { SubmitStatus } from '@prisma/client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';

export type QuestionType = 'single' | 'multiple' | 'integer';
export type TestStatus = 'JOIN' | 'STARTED' | 'COMPLETED';

interface SectionConfig {
  correctMarks: number;
  negativeMarks: number;
  isOptional: boolean;
  maxQuestions: number;
}

interface SubmissionProps {
  questionId: string;
  status: SubmitStatus;
  timing: number;
  answer?: string;
  submittedAt?: Date;
}

interface TestInfo {
  testId: string;
  testTitle: string;
  duration: number;
  totalMarks: number;
}
interface QuestionData {
  selectedOptions: number[] | null;
  status: QuestionStatus;
  type: QuestionType;
  submittedAt?: Date;
}


interface TestContextType {
  testId: string;
  setTestId: React.Dispatch<React.SetStateAction<string>>;
  testInfo: TestInfo | null;
  setTestInfo: React.Dispatch<React.SetStateAction<TestInfo | null>>;
  setIsTestComplete: React.Dispatch<React.SetStateAction<boolean>>;
  setQuestions: (question: QuestionWithOptions[]) => void;
  questions: QuestionWithOptions[] | undefined;
  currentQuestion: number;
  setCurrentQuestion: (questionNumber: number) => void;
  totalQuestions: number;
  setQuestionsData: React.Dispatch<React.SetStateAction<Record<number, QuestionData>>>;
  questionsData: Record<number,QuestionData>;
  testSection: Record<string, SectionConfig>;
  setTestSection: React.Dispatch<React.SetStateAction<Record<string, SectionConfig>>>;
  isTestComplete: boolean;
  isLoaded: boolean;
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  setTestStatus: React.Dispatch<React.SetStateAction<TestStatus>>;
  testStatus: TestStatus;
  setMinimizeCount: React.Dispatch<React.SetStateAction<number>>;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export const TestProvider = ({ children }: { children: ReactNode }) => {

  const router = useRouter();

  const [testId, setTestId] = useState<string>("");
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null)
  const [isLoaded, setIsLoaded] = useState(true);
  const [questions, setQuestionsState] = useState<QuestionWithOptions[]>([]);
  const [questionsData, setQuestionsData] = useState<Record<number, QuestionData>>({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [minimizeCount, setMinimizeCount] = useState(0);
  const [testSection, setTestSection] = useState<Record<string, SectionConfig>>({})
  const [testStatus, setTestStatus] = useState<TestStatus>("JOIN")

  const totalQuestions = useMemo(() => questions?.length || 0, [questions]);

  const setQuestions = useCallback((newQuestions: QuestionWithOptions[]) => {
    setQuestionsState(newQuestions);
  }, []);

  useEffect(() => {
    if (!testInfo || !questions.length || !testId || !Object.keys(testSection).length) {
      if (testId) {
        router.push(`/test/${testId}/instructions`);
      } else {
        router.push(`/tests`);
      }
    }
  }, [testInfo, questions, testId, testSection, router]);

  useEffect(() => {
    if (!testInfo?.testId) return;
    
    const storedData = sessionStorage.getItem(`questionsData-${testInfo.testId}`);
    if (storedData) {
      try {
        setQuestionsData(JSON.parse(storedData));
      } catch (error) {
        console.error("Error parsing stored questions data:", error);
      }
    }
  }, [testInfo?.testId]);

  useEffect(() => {
    if (!testInfo?.testId || Object.keys(questionsData).length === 0) return;
    try {
      sessionStorage.setItem(`questionsData-${testInfo.testId}`, JSON.stringify(questionsData));
    } catch (error) {
      console.error("Error saving questions data to sessionStorage:", error);
      
    }
  }, [questionsData, testInfo?.testId]);


  useEffect(() => {
    if (!isTestComplete) return;

    const submitTest = async () => {
      try {
        if (!testInfo || !questions.length) {
          console.error("Missing required data for submission");
          return;
        }

        let timings = {} as Record<number, number>;
        let remainTimer: { leftTime?: number } = {};
        try {
           timings = JSON.parse(sessionStorage.getItem(`question_timer_${testInfo.testId}`) || "{}");
           remainTimer = JSON.parse(sessionStorage.getItem(`test_timer_${testInfo.testId}`) || "{}");
          
        } catch (error) {
          console.error("Error parsing sessionStorage data:", error);
          
        }
        const remainingTimer = testInfo.duration * 60 - (remainTimer?.leftTime || 0);
        
        const counts = {
          cntMarkForReview: 0,
          cntNotAnswered: 0,
          cntAnswered: 0,
          cntAnsweredMark: 0,
        };

        // Create submission data
        const submissions: SubmissionProps[] = questions.map((question, idx) => {
          const questionIndex = idx + 1;
          const questionData = questionsData[questionIndex] || {
            selectedOptions: null,
            status: QuestionStatus.NotAnswered,
            type: question.type,
            submittedAt: new Date(),
          };
          
          const timing = timings[questionIndex] || 0;
          const answer = JSON.stringify(questionData.selectedOptions);
          
          // Track counts and determine submission status
          if (questionData.status === QuestionStatus.Answered) {
            counts.cntAnswered++;
            
            // Determine if answer is correct
            let isCorrect = false;
            if (question.type === "INTEGER") {
              isCorrect = question.isNumerical === questionData.selectedOptions?.[0];
            } else {
              // For single and multiple choice questions
              isCorrect = questionData.selectedOptions?.every(
                (index) => question.options[index]?.isCorrect
              ) || false;
            }
            
            return {
              questionId: question.id,
              status: isCorrect ? SubmitStatus.CORRECT : SubmitStatus.INCORRECT,
              timing,
              answer,
              submittedAt: questionData.submittedAt,
            };
          }
          
          // Handle other question statuses
          let status: SubmitStatus;
          switch (questionData.status) {
            case QuestionStatus.NotAnswered:
              counts.cntNotAnswered++;
              status = SubmitStatus.NOT_ANSWERED;
              break;
            case QuestionStatus.MarkedForReview:
              counts.cntMarkForReview++;
              status = SubmitStatus.MARK_FOR_REVIEW;
              break;
            case QuestionStatus.AnsweredAndMarked:
              counts.cntAnsweredMark++;
              status = SubmitStatus.ANSWERED_MARK;
              break;
            default:
              status = SubmitStatus.NOT_ANSWERED;
          }
          
          return {
            questionId: question.id,
            status,
            timing,
            answer,
            submittedAt: questionData.submittedAt,
          };
        });

        const marks = calculateMarks(submissions, testSection);
        
        const response = await axios.post(`/api/test/${testInfo.testId}/submit`, {
          submissions,
          marks,
          timing: remainingTimer,
          counts,
          minimizeCount
        });

        if (response.status === 200) {
          // Handle test completion
          const testEndTime = new Date(response.data.TestEnd);
          const currentTime = new Date();
          
          if (currentTime < testEndTime) {
            router.push(`/tests/thank-you`);
          } else {
            try {
              await document.exitFullscreen();
            } catch (error) {
              console.log("Could not exit fullscreen:", error);
            }
            router.push(`/analysis/${testId}`);
          }
          
          sessionStorage.clear();
        }
      } catch (error) {
        console.error("Error submitting test:", error);
        if (error.response) {
          console.error("Server error:", error.response.data);
        }
      }
    };

    submitTest();
  }, [isTestComplete, testInfo, questions, questionsData, testSection, testStatus, testId, router]);


  useEffect(() => {
    if (testInfo?.testId) {
      const storedData = sessionStorage.getItem(`questionsData-${testInfo.testId}`);
      if (storedData) {
        setQuestionsData(JSON.parse(storedData));
      }
    }
  }, [testInfo]);

  useEffect(() => {
    if (testInfo?.testId && Object.keys(questionsData).length > 0) {
      sessionStorage.setItem(`questionsData-${testInfo.testId}`, JSON.stringify(questionsData));
    }
  }, [questionsData, testInfo]);




  return (
    <TestContext.Provider
      value={{
        testId,
        isLoaded,
        testStatus,
        setTestStatus,
        setMinimizeCount,
        setIsLoaded,
        setTestId,
        testInfo,
        setTestInfo,
        setIsTestComplete,
        setQuestions,
        questions,
        currentQuestion,
        setCurrentQuestion,
        totalQuestions,
        setQuestionsData,
        questionsData,
        testSection,
        setTestSection,
        isTestComplete,

      }}
    >
      {children}
    </TestContext.Provider>
  );
};

export const useTestContext = (): TestContextType => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTestContext must be used within TestProvider');
  }
  return context;
};
