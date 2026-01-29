"use client";

import QuestionUI from "@/components/BaseQuestionUI";
import { QuestionNavigation } from "@/components/test/panel/QuestionNavigation";
import { QuestionTFNavigation } from "@/components/question-session/QuestionTFNavigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { useState, useMemo } from "react";
import Loading from "@/components/Loading";
import { Button } from "@repo/common-ui";
import { useRouter } from "next/navigation";
import { QuestionWithOptions } from "@/types";

interface ReviewTestPageProps {
  testId: string;
}

interface TestReviewData {
  questions: QuestionWithOptions[];
  attempts: Array<{
    id: string;
    questionId: string;
    answer: string;
    status: 'CORRECT' | 'INCORRECT' | 'UNATTEMPTED';
    timing: number;
  }>;
  testSection: Record<string, any>;
  testInfo: {
    testId: string;
    testTitle: string;
    duration: number;
    totalMarks: number;
  };
}

export function ReviewTestPage({ testId }: ReviewTestPageProps) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["testReview", testId],
    queryFn: async () => {
      const { data } = await api.get(`/test/${testId}/review`);
      return data.data as TestReviewData;
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const questionsStatus = useMemo(() => {
    if (!data?.attempts) return {};
    const statusMap: Record<number, 'correct' | 'incorrect' | 'unattempted'> = {};

    data.questions.forEach((question, index) => {
      const attempt = data.attempts.find(a => a.questionId === question.id);
      if (attempt) {
        statusMap[index + 1] = attempt.status === 'CORRECT' ? 'correct' :
          attempt.status === 'INCORRECT' ? 'incorrect' : 'unattempted';
      } else {
        statusMap[index + 1] = 'unattempted';
      }
    });

    return statusMap;
  }, [data]);

  const currentQuestionData = useMemo(() => {
    if (!data?.questions) return null;
    return data.questions[currentQuestion - 1];
  }, [data, currentQuestion]);

  const currentAttempt = useMemo(() => {
    if (!data?.attempts || !currentQuestionData) return null;
    return data.attempts.find(a => a.questionId === currentQuestionData.id);
  }, [data, currentQuestionData]);

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < (data?.questions.length || 0)) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading test review. Please try again.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Header */}
      <div className="flex items-center px-4 ">
        <h1 className="text-lg font-semibold">Solution</h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 relative ">
        <main className="flex-1 w-full lg:w-4/5 h-full">
          {currentQuestionData && (
            <QuestionUI
              question={currentQuestionData as any}
              isSolutionShow={true}
              answer={currentAttempt?.answer || null}
              reviewMode={true}
              attemptId={currentAttempt?.id || null}
              questionNumber={currentQuestion}
              status={questionsStatus[currentQuestion] || 'unattempted'}
              timeTaken={currentAttempt?.timing}
              isUnlocked={true}
            />
          )}
        </main>
        <QuestionNavigation
          reviewMode={true}
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          totalQuestions={data.questions.length}
          questionsStatus={questionsStatus}
          testSection={data.testSection}
        />
      </div>

      {/* Navigation Bar */}
      <QuestionTFNavigation
        canGoPrev={currentQuestion > 1}
        canGoNext={currentQuestion < data.questions.length}
        onPrev={handlePrevious}
        onNext={handleNext}
        variant="review"
      />
    </div>
  );
}

