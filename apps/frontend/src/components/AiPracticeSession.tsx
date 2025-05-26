"use client"
import { addAttempt, getAiPracticeSession } from '@/services';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import QuestionUI from './QuestionUI';
import { attempDataProps } from '@/types';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import Loading from './Loading';
import { useSearchParams } from 'next/navigation';

const AiPracticeSession = ({ sessionId }: { sessionId: string }) => {

    const searchParams = useSearchParams()
    const isReviewMode = searchParams.get('review') === 'true'
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [attemptedQuestions, setAttemptedQuestions] = useState<Set<string>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasInitialized = useRef(false);
    const userHasNavigated = useRef(false);

    const { data: session, isLoading, refetch } = useQuery({
        queryKey: ["session", sessionId],
        queryFn: () => getAiPracticeSession(sessionId),
        staleTime: 5 * 60 * 1000, 
        gcTime: 10 * 60 * 1000, 
    });

    const questions = useMemo(() => session?.data?.questions || [], [session?.data?.questions]);
    const attempts = useMemo(() => session?.data?.attempts || [], [session?.data?.attempts]);

    const attemptedIds = useMemo<Set<string>>(() =>
        new Set<string>(attempts.map(attempt => attempt.questionId)),
        [attempts]
    );

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

    const currentQuestion = useMemo(() =>
        questions[currentQuestionIndex]?.question,
        [questions, currentQuestionIndex]
    );

    const currentQuestionAttempt = useMemo(() =>
        attempts.find(attempt => attempt.questionId === currentQuestion?.id),
        [attempts, currentQuestion?.id]
    );

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

    const handleAttempt = useCallback(async (attemptData: attempDataProps) => {
        if (isSubmitting || !currentQuestion) return;

        setIsSubmitting(true);

        try {
            const response = await addAttempt({
                attemptData,
                attemptType: "SESSION",
                id: sessionId
            });

            if (response.success) {
                setAttemptedQuestions(prev => new Set([...Array.from(prev), currentQuestion.id]));

                await refetch(); //! Find Alternative for reftech and showing attempted question details
            } else {
                console.error("Failed to submit attempt:", response.message);
            }
        } catch (error) {
            console.error("Error submitting attempt:", error);
        } finally {
            setIsSubmitting(false);
        }
    }, [currentQuestion, sessionId, refetch, isSubmitting]);

    const canGoPrev = currentQuestionIndex > 0;
    const canGoNext = currentQuestionIndex < questions.length - 1;

    const goToNextUnattempted = useCallback(() => {
        const nextUnattemptedIndex = questions.findIndex((q, index) =>
            index > currentQuestionIndex && !attemptedQuestions.has(q.question.id)
        );

        if (nextUnattemptedIndex !== -1) {
            setCurrentQuestionIndex(nextUnattemptedIndex);
            userHasNavigated.current = true;
        }
    }, [questions, currentQuestionIndex, attemptedQuestions]);

    const hasNextUnattempted = useMemo(() =>
        questions.some((q, index) =>
            index > currentQuestionIndex && !attemptedQuestions.has(q.question.id)
        ),
        [questions, currentQuestionIndex, attemptedQuestions]
    );

    if (isLoading) {
        return <Loading />
    }

    if (!session?.success) {
        return (
            <div className="flex justify-center items-center h-screen">
                <h1 className="text-2xl font-bold text-red-500">
                    {session?.message || "Failed to load session"}
                </h1>
            </div>
        )
    }

    if (questions.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <h1 className="text-xl text-gray-600">No questions available in this session</h1>
            </div>
        )
    }

    return (
        <div className="container mx-auto">
            <div className="flex flex-wrap items-center justify-between w-full gap-4 ">
                <div className="flex items-center">
                    <Button
                        onClick={handlePrevQuestion}
                        disabled={!canGoPrev || isSubmitting}
                        variant="ghost"
                        size="sm"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>
                </div>
                <div className="flex flex-col md:flex-row items-center md:gap-2 text-center sm:text-left">
                    <div className="text-sm font-medium text-gray-700">
                        Attempted: {attemptedQuestions.size}/{questions.length}
                    </div>
                    {(hasNextUnattempted && !session?.data?.isCompleted) && (
                        <Button
                            onClick={goToNextUnattempted}
                            disabled={isSubmitting}
                            variant="outline"
                            className="my-2 p-1 text-primary-600 border-primary-200 hover:bg-primary-50 text-xs"
                        >
                            Next Unattempted
                        </Button>
                    )}
                </div>
                <div className="flex items-center">
                    <Button
                        onClick={handleNextQuestion}
                        disabled={!canGoNext || isSubmitting}
                        variant="ghost"
                        size="sm"
                    >
                        Next
                        <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>

            {currentQuestion && (
                <QuestionUI
                    key={`${currentQuestion.id}-${currentQuestionIndex}`}
                    question={currentQuestion}
                    handleAttempt={handleAttempt}
                    answer={currentQuestionAttempt?.answer || null}
                    isSolutionShow={(session?.data?.isCompleted || isReviewMode ) ?? false}
                />
            )}
        </div>
    );
};

export default AiPracticeSession;