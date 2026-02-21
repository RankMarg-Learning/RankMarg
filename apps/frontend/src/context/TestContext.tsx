"use client"
import { QuestionWithOptions } from '@/types';
import { QuestionStatus } from '@/utils';
import { calculateMarks } from '@/utils/test/calculateMarks';
import { SubmitStatus } from '@repo/db/enums';
import api from '@/utils/api';
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
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  testInfo: TestInfo | null;
  setTestInfo: React.Dispatch<React.SetStateAction<TestInfo | null>>;
  setIsTestComplete: React.Dispatch<React.SetStateAction<boolean>>;
  setQuestions: (question: QuestionWithOptions[]) => void;
  questions: QuestionWithOptions[] | undefined;
  currentQuestion: number;
  setCurrentQuestion: (questionNumber: number) => void;
  totalQuestions: number;
  setQuestionsData: React.Dispatch<React.SetStateAction<Record<number, QuestionData>>>;
  questionsData: Record<number, QuestionData>;
  testSection: Record<string, SectionConfig>;
  setTestSection: React.Dispatch<React.SetStateAction<Record<string, SectionConfig>>>;
  isTestComplete: boolean;
  isLoaded: boolean;
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  setTestStatus: React.Dispatch<React.SetStateAction<TestStatus>>;
  testStatus: TestStatus;
  setMinimizeCount: React.Dispatch<React.SetStateAction<number>>;
}

export const TestContext = createContext<TestContextType | undefined>(undefined);

export const TestProvider = ({ children }: { children: ReactNode }) => {

  const router = useRouter();

  const [testId, setTestId] = useState<string>("");
  const [token, setToken] = useState<string>("");
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
        router.push(`/test/${testId}/instructions${token ? `?token=${token}` : ''}`);
      } else {
        router.push(`/tests`);
      }
    }
  }, [testInfo, questions, testId, testSection, router]);

  useEffect(() => {
    if (!testInfo?.testId) return;

    const storedData = sessionStorage.getItem(`questionsData-${testInfo.testId}`);
    const storedToken = sessionStorage.getItem(`testToken-${testInfo.testId}`);

    if (storedData) {
      try {
        setQuestionsData(JSON.parse(storedData));
      } catch (error) {
        console.error("Error parsing stored questions data:", error);
      }
    }
    if (storedToken && !token) {
      setToken(storedToken);
    }
  }, [testInfo?.testId, token]);

  useEffect(() => {
    if (!testInfo?.testId) return;
    try {
      if (Object.keys(questionsData).length > 0) {
        sessionStorage.setItem(`questionsData-${testInfo.testId}`, JSON.stringify(questionsData));
      }
      if (token) {
        sessionStorage.setItem(`testToken-${testInfo.testId}`, token);
      }
    } catch (error) {
      console.error("Error saving data to sessionStorage:", error);

    }
  }, [questionsData, testInfo?.testId, token]);


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

          if (questionData.status === QuestionStatus.Answered) {
            counts.cntAnswered++;

            let isCorrect = false;
            if (question.type === "INTEGER") {
              isCorrect = question.isNumerical === questionData.selectedOptions?.[0];
            } else {
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

        const response = await api.post(`/test/${testInfo.testId}/submit`, {
          submissions,
          marks,
          timing: remainingTimer,
          counts,
          minimizeCount
        },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          });

        if (response.status === 200) {
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
            router.push(`/t/${testId}/analysis`);
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
        token,
        setToken,
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
