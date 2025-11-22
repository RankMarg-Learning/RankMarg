"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import BaseQuestionUI from './BaseQuestionUI';
import { addAttempt, getAiPracticeSession } from '@/services';
import { attempDataProps } from '@/types';
import { useUserData } from '@/context/ClientContextProvider';
import {
    QuestionSessionNavigation,
    STALE_TIME,
    GC_TIME,
    renderLoadingState,
    renderErrorState,
    renderEmptyState
} from './question-session';

interface AiPracticeSessionProps {
    sessionId: string;
}

const AiPracticeSession: React.FC<AiPracticeSessionProps> = ({ sessionId }) => {
    // ===== HOOKS & STATE =====
    const { mobileMenuOpen } = useUserData()
    const searchParams = useSearchParams();
    const isReviewMode = searchParams.get('review') === 'true';

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [attemptedQuestions, setAttemptedQuestions] = useState<Set<string>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasInitialized = useRef(false);
    const userHasNavigated = useRef(false);

    // ===== DATA FETCHING =====
    const queryClient = useQueryClient();

    const { data: session, isLoading } = useQuery({
        queryKey: ["session", sessionId],
        queryFn: () => getAiPracticeSession(sessionId),
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    });

    // ===== MEMOIZED VALUES =====
    const questions = useMemo(() =>
        session?.data?.questions || [],
        [session?.data?.questions]
    );

    const attempts = useMemo(() =>
        session?.data?.attempts || [],
        [session?.data?.attempts]
    );

    const attemptedIds = useMemo<Set<string>>(() =>
        new Set<string>(attempts.map(attempt => attempt.questionId)),
        [attempts]
    );

    const currentQuestion = useMemo(() =>
        questions[currentQuestionIndex]?.question,
        [questions, currentQuestionIndex]
    );

    const currentQuestionAttempt = useMemo(() =>
        attempts.find(attempt => attempt.questionId === currentQuestion?.id),
        [attempts, currentQuestion?.id]
    );

    const progressPercentage = useMemo(() =>
        questions.length > 0 ? (attemptedQuestions.size / questions.length) * 100 : 0,
        [attemptedQuestions.size, questions.length]
    );

    const hasNextUnattempted = useMemo(() =>
        questions.some((q, index) =>
            index > currentQuestionIndex && !attemptedQuestions.has(q.question.id)
        ),
        [questions, currentQuestionIndex, attemptedQuestions]
    );

    // ===== NAVIGATION STATE =====
    const canGoPrev = currentQuestionIndex > 0;
    const canGoNext = currentQuestionIndex < questions.length - 1;

    // ===== EFFECTS =====
    useEffect(() => {
        if (session?.data?.attempts && !hasInitialized.current) {
            setAttemptedQuestions(attemptedIds);

            if (!userHasNavigated.current) {
                const firstUnattemptedIndex = questions.findIndex(
                    q => !attemptedIds.has(q.question.id)
                );

                if (firstUnattemptedIndex !== -1) {
                    setCurrentQuestionIndex(firstUnattemptedIndex);
                }
            }

            hasInitialized.current = true;
        }
    }, [session?.data?.attempts, questions, attemptedIds]);

    useEffect(() => {
        if (hasInitialized.current) {
            setAttemptedQuestions(attemptedIds);
        }
    }, [attemptedIds]);

    // ===== EVENT HANDLERS =====
    const handlePrevQuestion = useCallback(() => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prevIndex => prevIndex - 1);
            userHasNavigated.current = true;
        }
    }, [currentQuestionIndex]);

    const handleNextQuestion = useCallback(() => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            userHasNavigated.current = true;
        }
    }, [currentQuestionIndex, questions.length]);

    const goToNextUnattempted = useCallback(() => {
        const nextUnattemptedIndex = questions.findIndex((q, index) =>
            index > currentQuestionIndex && !attemptedQuestions.has(q.question.id)
        );

        if (nextUnattemptedIndex !== -1) {
            setCurrentQuestionIndex(nextUnattemptedIndex);
            userHasNavigated.current = true;
        }
    }, [questions, currentQuestionIndex, attemptedQuestions]);

    const handleAttempt = useCallback(async (attemptData: attempDataProps) => {
        if (isSubmitting || !currentQuestion) return;

        setIsSubmitting(true);

        const optimisticAttemptId = `temp_${Date.now()}_${currentQuestion.id}`;

        const optimisticAttempt = {
            id: optimisticAttemptId,
            questionId: currentQuestion.id,
            answer: attemptData.answer,
            isOptimistic: true
        };

        try {
            setAttemptedQuestions(prev => new Set([...Array.from(prev), currentQuestion.id]));

            queryClient.setQueryData(["session", sessionId], (oldData: any) => {
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
                attemptType: "SESSION",
                id: sessionId
            });

            if (response.success) {
                queryClient.setQueryData(["session", sessionId], (oldData: any) => {
                    if (!oldData?.data) return oldData;
                    return {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            attempts: oldData.data.attempts.map((attempt: any) =>
                                attempt.id === optimisticAttemptId ? response.data : attempt
                            ),
                        },
                    };
                });
            } else {
                queryClient.setQueryData(["session", sessionId], (oldData: any) => {
                    if (!oldData?.data) return oldData;
                    return {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            attempts: oldData.data.attempts.filter((attempt: any) =>
                                attempt.id !== optimisticAttemptId
                            ),
                        },
                    };
                });

                setAttemptedQuestions(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(currentQuestion.id);
                    return newSet;
                });

                console.error("Failed to submit attempt:", response.message);
            }
        } catch (error) {
            queryClient.setQueryData(["session", sessionId], (oldData: any) => {
                if (!oldData?.data) return oldData;
                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        attempts: oldData.data.attempts.filter((attempt: any) =>
                            attempt.id !== optimisticAttemptId
                        ),
                    },
                };
            });

            setAttemptedQuestions(prev => {
                const newSet = new Set(prev);
                newSet.delete(currentQuestion.id);
                return newSet;
            });

            console.error("Error submitting attempt:", error);
        } finally {
            setIsSubmitting(false);
        }
    }, [currentQuestion, sessionId, isSubmitting, queryClient]);

    // ===== RENDER HELPERS =====

    const renderMainContent = () => (
        <>
            {currentQuestion && (
                <BaseQuestionUI
                    key={`${currentQuestion.id}-${currentQuestionIndex}`}
                    question={currentQuestion}
                    handleAttempt={handleAttempt}
                    answer={currentQuestionAttempt?.answer || null}
                    attemptId={currentQuestionAttempt?.id || null}
                    isSolutionShow={(session?.data?.isCompleted || isReviewMode) ?? false}
                    isUnlocked={session?.data?.isUnlocked}
                />
            )}
        </>
    );

    // ===== MAIN RENDER =====
    if (isLoading) {
        return renderLoadingState();
    }

    if (!session?.success) {
        return renderErrorState(session?.message || "Failed to load session");
    }

    if (questions.length === 0) {
        return renderEmptyState("No questions available in this session");
    }

    return (
        <div className="min-h-screen bg-white">
            {renderMainContent()}
            <QuestionSessionNavigation
                canGoPrev={canGoPrev}
                canGoNext={canGoNext}
                isSubmitting={isSubmitting}
                onPrev={handlePrevQuestion}
                onNext={handleNextQuestion}
                mobileMenuOpen={mobileMenuOpen}
                showProgress={true}
                progressPercentage={progressPercentage}
                attemptedCount={attemptedQuestions.size}
                totalCount={questions.length}
                showNextUnattempted={hasNextUnattempted && !session?.data?.isCompleted}
                onNextUnattempted={goToNextUnattempted}
            />
        </div>
    );
};

export default AiPracticeSession;