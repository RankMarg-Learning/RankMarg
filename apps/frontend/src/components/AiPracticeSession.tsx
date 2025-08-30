"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import QuestionUI from './QuestionUI';
import { Progress } from './ui/progress';
import Loading from './Loading';
import { addAttempt, getAiPracticeSession } from '@/services';
import { attempDataProps } from '@/types';

// Constants
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 10 * 60 * 1000; // 10 minutes

interface AiPracticeSessionProps {
    sessionId: string;
}

const AiPracticeSession: React.FC<AiPracticeSessionProps> = ({ sessionId }) => {
    // ===== HOOKS & STATE =====
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
    const renderLoadingState = () => <Loading />;

    const renderErrorState = () => (
        <div className="flex justify-center items-center min-h-screen px-4">
            <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-bold text-red-500 mb-2">
                    Session Error
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    {session?.message || "Failed to load session"}
                </p>
            </div>
        </div>
    );

    const renderEmptyState = () => (
        <div className="flex justify-center items-center min-h-screen px-4">
            <div className="text-center">
                <h1 className="text-lg sm:text-xl text-gray-600">
                    No questions available in this session
                </h1>
            </div>
        </div>
    );

    const renderProgressSection = () => (
        <div className="flex items-center gap-4">
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
                <div className="w-20 sm:w-28 md:w-36">
                    <Progress 
                        value={progressPercentage} 
                        className="h-1.5 bg-gray-100"
                        indicatorColor="bg-primary-500"
                    />
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-600 tabular-nums">
                    {attemptedQuestions.size}/{questions.length}
                </span>
            </div>

            {/* Next Unattempted Button */}
            {(hasNextUnattempted && !session?.data?.isCompleted) && (
                <button
                    onClick={goToNextUnattempted}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SkipForward className="h-4 w-4" />
                    <span className="hidden sm:inline">Next Unattempted</span>
                </button>
            )}
        </div>
    );

    const renderNavigationButtons = () => (
        <div className="flex items-center gap-3">
            <button
                onClick={handlePrevQuestion}
                disabled={!canGoPrev || isSubmitting}
                className="inline-flex items-center justify-center w-10 h-10 text-primary-600 hover:text-primary-700 hover:bg-primary-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <ArrowLeft className="h-4 w-4" />
            </button>
            
            <button
                onClick={handleNextQuestion}
                disabled={!canGoNext || isSubmitting}
                className="inline-flex items-center justify-center w-10 h-10 text-primary-600 hover:text-primary-700 hover:bg-primary-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    );

    const renderTopNavigation = () => (
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-14">
                    {/* Left Side - Progress and Controls */}
                    <div className="flex-1 min-w-0">
                        {renderProgressSection()}
                    </div>

                    {/* Right Side - Navigation Buttons */}
                    <div className="flex-shrink-0">
                        {renderNavigationButtons()}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMainContent = () => (
        <>
            {currentQuestion && (
                <QuestionUI
                    key={`${currentQuestion.id}-${currentQuestionIndex}`}
                    question={currentQuestion}
                    handleAttempt={handleAttempt}
                    answer={currentQuestionAttempt?.answer || null}
                    attemptId={currentQuestionAttempt?.id || null}
                    isSolutionShow={(session?.data?.isCompleted || isReviewMode ) ?? false}
                />
            )}
        </>
    );

    // ===== MAIN RENDER =====
    if (isLoading) {
        return renderLoadingState();
    }

    if (!session?.success) {
        return renderErrorState();
    }

    if (questions.length === 0) {
        return renderEmptyState();
    }

    return (
        <div className="min-h-screen bg-white">
            {renderTopNavigation()}
            {renderMainContent()}
        </div>
    );
};

export default AiPracticeSession;