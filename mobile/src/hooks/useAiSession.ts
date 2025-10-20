import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { addAttempt, getAiPracticeSession } from '@/src/services/session.service';

export interface AttemptData {
  questionId: string;
  isCorrect?: boolean;
  answer?: string | number | null;
  timing?: number;
  reactionTime?: number;
  isHintUsed?: boolean;
}

export function useAiSession(sessionId: string) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [attemptedQuestions, setAttemptedQuestions] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasInitialized = useRef(false);
  const userHasNavigated = useRef(false);

  const queryClient = useQueryClient();

  const { data: session, isLoading, isError } = useQuery({
    queryKey: ['mobile', 'ai-session', sessionId],
    queryFn: () => getAiPracticeSession(sessionId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const questions = useMemo(() => session?.data?.questions || [], [session?.data?.questions]);
  const attempts = useMemo(() => session?.data?.attempts || [], [session?.data?.attempts]);

  const attemptedIds = useMemo<Set<string>>(
    () => new Set<string>(attempts.map((a: any) => a.questionId)),
    [attempts]
  );

  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex]?.question,
    [questions, currentQuestionIndex]
  );

  const currentQuestionAttempt = useMemo(
    () => attempts.find((a: any) => a.questionId === currentQuestion?.id),
    [attempts, currentQuestion?.id]
  );

  const progressPercentage = useMemo(
    () => (questions.length > 0 ? (attemptedQuestions.size / questions.length) * 100 : 0),
    [attemptedQuestions.size, questions.length]
  );

  const canGoPrev = currentQuestionIndex > 0;
  const canGoNext = currentQuestionIndex < questions.length - 1;

  const hasNextUnattempted = useMemo(
    () =>
      questions.some(
        (q: any, index: number) =>
          index > currentQuestionIndex && !attemptedQuestions.has(q.question.id)
      ),
    [questions, currentQuestionIndex, attemptedQuestions]
  );

  // Initialize attempted map and first unattempted question
  useEffect(() => {
    if (session?.data?.attempts && !hasInitialized.current) {
      setAttemptedQuestions(attemptedIds);
      
      if (!userHasNavigated.current) {
        const firstUnattemptedIndex = questions.findIndex((q: any) => !attemptedIds.has(q.question.id));
        if (firstUnattemptedIndex !== -1) {
          setCurrentQuestionIndex(firstUnattemptedIndex);
        }
      }
      
      hasInitialized.current = true;
    }
  }, [session?.data?.attempts, questions, attemptedIds]);

  // Sync attemptedQuestions with attemptedIds after initialization
  useEffect(() => {
    if (hasInitialized.current) {
      setAttemptedQuestions(attemptedIds);
    }
  }, [attemptedIds]);

  const handlePrev = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
      userHasNavigated.current = true;
    }
  }, [currentQuestionIndex]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      userHasNavigated.current = true;
    }
  }, [currentQuestionIndex, questions.length]);

  const goToNextUnattempted = useCallback(() => {
    const nextUnattemptedIndex = questions.findIndex(
      (q: any, index: number) => index > currentQuestionIndex && !attemptedQuestions.has(q.question.id)
    );
    if (nextUnattemptedIndex !== -1) {
      setCurrentQuestionIndex(nextUnattemptedIndex);
      userHasNavigated.current = true;
    }
  }, [questions, currentQuestionIndex, attemptedQuestions]);

  const submitAttempt = useCallback(
    async (attemptData: AttemptData) => {
      if (isSubmitting || !currentQuestion) return;
      setIsSubmitting(true);

      const optimisticAttemptId = `temp_${Date.now()}_${currentQuestion.id}`;
      const optimisticAttempt = {
        id: optimisticAttemptId,
        questionId: currentQuestion.id,
        answer: attemptData.answer,
        isOptimistic: true,
      };

      try {
        setAttemptedQuestions((prev) => new Set([...Array.from(prev), currentQuestion.id]));

        queryClient.setQueryData(['mobile', 'ai-session', sessionId], (oldData: any) => {
          if (!oldData?.data) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              attempts: [...(oldData.data.attempts || []), optimisticAttempt],
            },
          };
        });

        const response = await addAttempt({
          attemptData,
          attemptType: 'SESSION',
          id: sessionId,
        });

        if (response?.success) {
          queryClient.setQueryData(['mobile', 'ai-session', sessionId], (oldData: any) => {
            if (!oldData?.data) return oldData;
            return {
              ...oldData,
              data: {
                ...oldData.data,
                attempts: oldData.data.attempts.map((a: any) =>
                  a.id === optimisticAttemptId ? response.data : a
                ),
              },
            };
          });
        } else {
          // rollback
          queryClient.setQueryData(['mobile', 'ai-session', sessionId], (oldData: any) => {
            if (!oldData?.data) return oldData;
            return {
              ...oldData,
              data: {
                ...oldData.data,
                attempts: oldData.data.attempts.filter((a: any) => a.id !== optimisticAttemptId),
              },
            };
          });
          setAttemptedQuestions((prev) => {
            const s = new Set(prev);
            s.delete(currentQuestion.id);
            return s;
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentQuestion, isSubmitting, queryClient, sessionId]
  );

  return {
    session,
    isLoading,
    isError,
    questions,
    attempts,
    currentQuestion,
    currentQuestionAttempt,
    currentQuestionIndex,
    progressPercentage,
    canGoPrev,
    canGoNext,
    attemptedQuestions,
    hasNextUnattempted,
    handlePrev,
    handleNext,
    goToNextUnattempted,
    submitAttempt,
    isSubmitting,
  };
}


