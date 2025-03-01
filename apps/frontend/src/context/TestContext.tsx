"use client"
import { QuestionWithOptions } from '@/types';
import { QuestionStatus } from '@/utils';
import { calculateMarks } from '@/utils/test/calculateMarks';
import { SubmitStatus } from '@prisma/client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type QuestionType = 'single' | 'multiple' | 'NUM' ;
export type TestStatus = 'JOIN' | 'STARTED' | 'COMPLETED';

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

type QuestionCounts = {
  cntMarkForReview: number;
  cntNotAnswered: number;
  cntAnswered: number;
  cntAnsweredMark: number;
};

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
  setQuestionsData: React.Dispatch<React.SetStateAction<Record<number, { selectedOptions: number[] | null; status: QuestionStatus; type: QuestionType; }>>>;
  questionsData: Record<number, { selectedOptions: number[] | null; status: QuestionStatus; type: QuestionType; }>;
  testSection: Record<string, {
    correctMarks: number,
    negativeMarks: number,
    isOptional: boolean,
    maxQuestions: number
  }>;
  setTestSection: React.Dispatch<React.SetStateAction<Record<string, {
    correctMarks: number,
    negativeMarks: number,
    isOptional: boolean,
    maxQuestions: number
  }>>>;
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
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [questionsData, setQuestionsData] = useState<
    Record<number, { selectedOptions: number[] | null; status: QuestionStatus; type: QuestionType;submittedAt?:Date }>
  >({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const totalQuestions = questions?.length || 0;
  const [minimizeCount, setMinimizeCount] = useState(0);
  const [testSection, setTestSection] = useState<Record<string, {
    correctMarks: number,
    negativeMarks: number,
    isOptional: boolean,
    maxQuestions: number
  }>>({})
  const [testStatus, setTestStatus] = useState<TestStatus>("JOIN")
  
  console.log("Minimize",minimizeCount)

  useEffect(() => {
    if (!testInfo || !questions || !testId || !testSection) {
      if (testId) {
        router.push(`/test/${testId}/instructions`);
      } else {
        router.push(`/tests`);
      }
    }
  }, [testInfo, questions, testId, testSection, router]);


  useEffect(() => {
    if (!isTestComplete) return;

    const submitTest = async () => {
      try {
        const timings = JSON.parse(sessionStorage.getItem(`question_timer_${testInfo.testId}`) || "{}");
        const remainTimer = JSON.parse(sessionStorage.getItem(`test_timer_${testInfo.testId}`) || "{}");

        const remainingTimer = testInfo.duration * 60 - remainTimer?.leftTime;
        const counts = {
          cntMarkForReview: 0,
          cntNotAnswered: 0,
          cntAnswered: 0,
          cntAnsweredMark: 0,
        };
        const mapQuestionStatusToSubmitStatus = (status: QuestionStatus): SubmitStatus => {
          
          switch (status) {
            case QuestionStatus.NotAnswered:
              counts.cntNotAnswered++;
              return SubmitStatus.NOT_ANSWERED;
            case QuestionStatus.MarkedForReview:
              counts.cntMarkForReview++;
              return SubmitStatus.MARK_FOR_REVIEW;
            case QuestionStatus.AnsweredAndMarked:
              counts.cntAnsweredMark++;
              return SubmitStatus.ANSWERED_MARK;
            default:
              throw new Error(`Invalid status: ${status}`);
          }
        };
        
        const submission: SubmissionProps[] = questions.map((question, idx) => {
          const {
            selectedOptions = [],
            status = QuestionStatus.NotAnswered,
            type = question.type,
            submittedAt
          } = questionsData[idx + 1] || {};
          const timing = timings[idx + 1] || 0;
        
          if (status === QuestionStatus.Answered) {
            counts.cntAnswered++;
            const isCorrectEnum: SubmitStatus = (() => {
              if (type === "single" || type === "multiple") {
                const status = selectedOptions.every(
                  (index) => question.options[index]?.isCorrect
                );
                return status ? SubmitStatus.TRUE : SubmitStatus.FALSE;
              }
              if (type === "NUM") {
                const isCorrect = question.isnumerical === selectedOptions[0];
                return isCorrect ? SubmitStatus.TRUE : SubmitStatus.FALSE;
              }
              return SubmitStatus.FALSE;
            })();
        
            return { questionId: question.id, status: isCorrectEnum, timing ,answer:JSON.stringify(selectedOptions),submittedAt };
          }
        
          return { questionId: question.id, status: mapQuestionStatusToSubmitStatus(status), timing,answer:JSON.stringify(selectedOptions),submittedAt };
        });

        const marks = calculateMarks(submission, testSection);
        
        const response = await axios.post(`/api/test/${testInfo.testId}/submit`, { submission, marks, timing: remainingTimer,counts,minimizeCount });
        if (response.status === 200) {
          const testEndTime = new Date(response.data.TestEnd);
            const currentTime = new Date();
            if (currentTime < testEndTime) {
              router.push(`/tests/thank-you`)
                
            }
            else{
              document.exitFullscreen();
              router.push(`/analysis/${testId}`)
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
