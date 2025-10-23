"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, SkipForward, History } from 'lucide-react';
import QuestionUI from './QuestionUI';
import Loading from './Loading';
import { addAttempt } from '@/services';
import { attempDataProps } from '@/types';
import { useUserData } from '@/context/ClientContextProvider';
import { cn } from '@/lib/utils';
import { aiQuestionService } from '@/services/aiQuestion.service';
import { Button } from './ui/button';

// Constants
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const GC_TIME = 10 * 60 * 1000; // 10 minutes

interface AiTopicQuestionSessionProps {
    topicSlug: string;
    onViewHistory?: () => void;
}

const AiTopicQuestionSession: React.FC<AiTopicQuestionSessionProps> = ({ 
    topicSlug,
    onViewHistory 
}) => {
    // ===== HOOKS & STATE =====
    const { mobileMenuOpen } = useUserData()
    const searchParams = useSearchParams();
    const isReviewMode = searchParams.get('review') === 'true';

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [localAttempts, setLocalAttempts] = useState<Map<string, any>>(new Map());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSolution, setShowSolution] = useState(false);

    const hasInitialized = useRef(false);
    const userHasNavigated = useRef(false);

    // ===== DATA FETCHING =====
    const queryClient = useQueryClient();

    const { data: questionsData, isLoading } = useQuery({
        queryKey: ["ai-questions-session", topicSlug],
        queryFn: () => aiQuestionService.getQuestionsByTopicForSession(topicSlug),
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    });

    // ===== MEMOIZED VALUES =====
    const questions = useMemo(() =>
        questionsData?.questions || [],
        [questionsData?.questions]
    );

    const currentQuestionData = useMemo(() =>
        questions[currentQuestionIndex],
        [questions, currentQuestionIndex]
    );

    const currentQuestion = useMemo(() =>
        currentQuestionData?.question,
        [currentQuestionData]
    );

    const currentAttempt = useMemo(() => {
        if (!currentQuestion) return null;
        // First check if there's a server-provided attempt
        const serverAttempt = currentQuestionData?.attempt;
        // Then check local attempts (for newly submitted)
        const localAttempt = localAttempts.get(currentQuestion.id);
        return localAttempt || serverAttempt || null;
    }, [currentQuestion, currentQuestionData, localAttempts]);

    

    const hasNextUnattempted = useMemo(() =>
        questions.some((q, index) =>
            index > currentQuestionIndex && !q.attempt && !localAttempts.has(q.question.id)
        ),
        [questions, currentQuestionIndex, localAttempts]
    );

    // ===== NAVIGATION STATE =====
    const canGoPrev = currentQuestionIndex > 0;
    const canGoNext = currentQuestionIndex < questions.length - 1;

    // ===== EFFECTS =====
    useEffect(() => {
        if (questionsData && !hasInitialized.current) {
            // If user hasn't navigated, go to first unattempted question
            if (!userHasNavigated.current) {
                const firstUnattemptedIndex = questionsData.questions.findIndex(
                    (q: any) => !q.attempt
                );
                if (firstUnattemptedIndex !== -1) {
                    setCurrentQuestionIndex(firstUnattemptedIndex);
                }
            }

            hasInitialized.current = true;
        }
    }, [questionsData]);

    useEffect(() => {
        // Reset solution view when question changes
        // Show solution if current question has an attempt
        const hasAttempt = currentAttempt !== null;
        setShowSolution(hasAttempt);
    }, [currentQuestionIndex, currentAttempt]);

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
            index > currentQuestionIndex && !q.attempt && !localAttempts.has(q.question.id)
        );

        if (nextUnattemptedIndex !== -1) {
            setCurrentQuestionIndex(nextUnattemptedIndex);
            userHasNavigated.current = true;
        }
    }, [questions, currentQuestionIndex, localAttempts]);

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
            // Store attempt locally
            setLocalAttempts(prev => new Map(prev).set(currentQuestion.id, optimisticAttempt));

            // Show solution immediately after attempt
            setShowSolution(true);

            const response = await addAttempt({
                attemptData,
                attemptType: "NONE",
            });

            if (response.success) {
                // Update with real attempt
                setLocalAttempts(prev => new Map(prev).set(currentQuestion.id, response.data));
                
                // Invalidate the questions cache to refresh the list
                queryClient.invalidateQueries({ queryKey: ["ai-questions-session", topicSlug] });
            } else {
                // Rollback on failure
                setLocalAttempts(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(currentQuestion.id);
                    return newMap;
                });

                setShowSolution(false);
                console.error("Failed to submit attempt:", response.message);
            }
        } catch (error) {
            // Rollback on error
            setLocalAttempts(prev => {
                const newMap = new Map(prev);
                newMap.delete(currentQuestion.id);
                return newMap;
            });

            setShowSolution(false);
            console.error("Error submitting attempt:", error);
        } finally {
            setIsSubmitting(false);
        }
    }, [currentQuestion, isSubmitting, queryClient, topicSlug]);

// ===== RENDER HELPERS =====
    const renderLoadingState = () => <Loading />;

    const renderEmptyState = () => (
        <div className="flex justify-center items-center min-h-screen px-4">
            <div className="text-center">
                <h1 className="text-lg sm:text-xl text-gray-600 mb-4">
                    No questions available for this topic
                </h1>
                <p className="text-sm text-gray-500 mb-4">
                    You've attempted all available questions or there are no questions at your level.
                </p>
                {onViewHistory && (
                    <Button onClick={onViewHistory} variant="outline">
                        <History className="w-4 h-4 mr-2" />
                        View Attempted Questions
                    </Button>
                )}
            </div>
        </div>
    );

    const renderProgressSection = () => (
        <div className="flex items-center gap-4">
            

            {/* View History Button !NOTE: Future Feature */}
            {onViewHistory && false && (
                <button
                    onClick={onViewHistory}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                >
                    <History className="h-4 w-4" />
                    <span className="hidden sm:inline">History</span>
                </button>
            )}

            {/* Next Unattempted Button */}
            {hasNextUnattempted && (
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
        <div className={cn("sticky bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-100", mobileMenuOpen && "hidden lg:block")}>
            <div className="max-w-8xl mx-auto px-4 sm:px-6">
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

    const renderMainContent = () => {
        return (
            <>
                
                {currentQuestion && (
                    <QuestionUI
                        key={`${currentQuestion.id}-${currentQuestionIndex}`}
                        question={currentQuestion}
                        handleAttempt={handleAttempt}
                        answer={currentAttempt?.answer || null}
                        attemptId={currentAttempt?.id || null}
                        isSolutionShow={showSolution || isReviewMode}
                        markAsMistake={currentAttempt?.mistake !== null}
                        isUnlocked={true}
                    />
                )}
            </>
        );
    };

    // ===== MAIN RENDER =====
    if (isLoading) {
        return renderLoadingState();
    }

    if (!questionsData || questions.length === 0) {
        return renderEmptyState();
    }

    return (
        <div className="min-h-screen bg-white">
            {renderMainContent()}
            {renderTopNavigation()}
        </div>
    );
};

export default AiTopicQuestionSession;

