"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, History } from 'lucide-react';
import QuestionUI from './QuestionUI';
import Loading from './Loading';
import { addAttempt } from '@/services';
import { attempDataProps } from '@/types';
import { useUserData } from '@/context/ClientContextProvider';
import { cn } from '@/lib/utils';
import { aiQuestionService } from '@/services/aiQuestion.service';
import { Button } from './ui/button';
import {
    PERFORMANCE_WINDOW,
    DIFFICULTY_JUMP_THRESHOLD,
    DIFFICULTY_DROP_THRESHOLD,
    SELECTION_WEIGHTS,
    ADAPTIVE_RULES,
    CORRECT_ANSWER_POINTS,
    WRONG_ANSWER_POINTS,
    STREAK_BONUS,
    STREAK_PENALTY,
    MAX_PERFORMANCE_SCORE,
    MIN_PERFORMANCE_SCORE,
    LOG_LEVELS,
} from '@/constant/adaptiveLearning';

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

    // ===== ADAPTIVE LEARNING LOGIC =====
    
    /**
     * Calculate user's recent performance score (-1 to 1)
     * Positive = doing well, Negative = struggling
     * 
     * Uses constants from adaptiveLearning.ts rule book
     */
    const calculatePerformanceScore = useCallback((): number => {
        const recentAttempts = questions
            .slice(0, currentQuestionIndex + 1)
            .filter(q => q.attempt || localAttempts.has(q.question.id))
            .slice(-PERFORMANCE_WINDOW);

        if (recentAttempts.length === 0) return 0;

        let score = 0;
        let consecutiveCorrect = 0;
        let consecutiveWrong = 0;

        recentAttempts.forEach((q) => {
            const attempt = localAttempts.get(q.question.id) || q.attempt;
            const isCorrect = attempt?.status === 'CORRECT';
            
            if (isCorrect) {
                score += CORRECT_ANSWER_POINTS;
                consecutiveCorrect++;
                consecutiveWrong = 0;
            } else {
                score += WRONG_ANSWER_POINTS;
                consecutiveWrong++;
                consecutiveCorrect = 0;
            }
        });

        // Bonus/penalty for streaks
        if (consecutiveCorrect >= DIFFICULTY_JUMP_THRESHOLD) {
            score += STREAK_BONUS;
        }
        if (consecutiveWrong >= DIFFICULTY_DROP_THRESHOLD) {
            score += STREAK_PENALTY;
        }

        // Normalize to -1 to 1 range
        const normalizedScore = score / PERFORMANCE_WINDOW;
        
        if (LOG_LEVELS.PERFORMANCE) {
            console.log('[Adaptive Learning] Performance:', {
                score: normalizedScore,
                consecutiveCorrect,
                consecutiveWrong,
                recentAttempts: recentAttempts.length,
            });
        }

        return Math.max(MIN_PERFORMANCE_SCORE, Math.min(MAX_PERFORMANCE_SCORE, normalizedScore));
    }, [questions, currentQuestionIndex, localAttempts]);

    /**
     * Get target difficulty based on current performance
     * Uses adaptive rules from the rule book
     */
    const getTargetDifficulty = useCallback((): number => {
        const performanceScore = calculatePerformanceScore();
        
        // Get current average difficulty from recent attempts
        const recentAttempts = questions
            .slice(0, currentQuestionIndex + 1)
            .filter(q => q.attempt || localAttempts.has(q.question.id))
            .slice(-PERFORMANCE_WINDOW);

        let avgDifficulty = 2; // Default to medium
        if (recentAttempts.length > 0) {
            avgDifficulty = recentAttempts.reduce(
                (sum, q) => sum + (q.question.difficulty || 2), 
                0
            ) / recentAttempts.length;
        }

        // Adjust difficulty based on performance
        let targetDifficulty = avgDifficulty + performanceScore;
        
        // Apply maximum jump limit
        const maxJump = ADAPTIVE_RULES.MAX_DIFFICULTY_JUMP;
        if (Math.abs(targetDifficulty - avgDifficulty) > maxJump) {
            targetDifficulty = avgDifficulty + (Math.sign(performanceScore) * maxJump);
        }
        
        // Clamp to valid range
        const clampedDifficulty = Math.max(
            ADAPTIVE_RULES.MIN_DIFFICULTY,
            Math.min(ADAPTIVE_RULES.MAX_DIFFICULTY, Math.round(targetDifficulty))
        );

        if (LOG_LEVELS.SELECTION) {
            console.log('[Adaptive Learning] Target Difficulty:', {
                avgDifficulty,
                performanceScore,
                targetDifficulty: clampedDifficulty,
            });
        }

        return clampedDifficulty;
    }, [calculatePerformanceScore, questions, currentQuestionIndex, localAttempts]);

    /**
     * Intelligent next question selection
     * Returns the index of the best next question
     * Uses multi-factor weighted scoring from rule book
     */
    const getAdaptiveNextQuestion = useCallback((): number | null => {
        const targetDifficulty = getTargetDifficulty();
        const performanceScore = calculatePerformanceScore();

        // Get all unattempted questions after current index
        const unattemptedQuestions = questions
            .map((q, index) => ({ question: q, index }))
            .filter(({ question, index }) => 
                index > currentQuestionIndex && 
                !question.attempt && 
                !localAttempts.has(question.question.id)
            );

        if (unattemptedQuestions.length === 0) {
            return null;
        }

        // Check if user is stuck (low performance, multiple failures)
        const isStuck = performanceScore <= ADAPTIVE_RULES.STUCK_THRESHOLD * -0.1;

        // Score each question based on multiple factors
        const scoredQuestions = unattemptedQuestions.map(({ question, index }) => {
            const questionDifficulty = question.question.difficulty || 2;
            
            // Factor 1: Difficulty match (0-1, higher is better)
            const difficultyMatch = 1 - (Math.abs(questionDifficulty - targetDifficulty) / 3);
            
            // Factor 2: Progressive learning (slight preference for nearby questions)
            const proximityScore = 1 - ((index - currentQuestionIndex) / questions.length);
            
            // Factor 3: Variety (prefer different difficulty if stuck)
            const lastQuestionDiff = currentQuestion?.difficulty || 2;
            let varietyScore = questionDifficulty !== lastQuestionDiff ? 0.2 : 0;
            
            // Boost variety if user is stuck
            if (isStuck) {
                varietyScore *= ADAPTIVE_RULES.VARIETY_BOOST_WHEN_STUCK;
            }

            // Calculate weighted score using constants from rule book
            const totalScore = 
                (difficultyMatch * SELECTION_WEIGHTS.DIFFICULTY_MATCH) +
                (proximityScore * SELECTION_WEIGHTS.PROXIMITY) +
                (varietyScore * SELECTION_WEIGHTS.VARIETY);

            return {
                index,
                score: totalScore,
                difficulty: questionDifficulty
            };
        });

        // Sort by score (descending) and return the best match
        scoredQuestions.sort((a, b) => b.score - a.score);
        
        const selectedQuestion = scoredQuestions[0];
        
        if (LOG_LEVELS.SCORING && selectedQuestion) {
            console.log('[Adaptive Learning] Question Selection:', {
                targetDifficulty,
                selectedDifficulty: selectedQuestion.difficulty,
                score: selectedQuestion.score,
                isStuck,
                totalCandidates: scoredQuestions.length,
            });
        }

        return selectedQuestion?.index ?? null;
    }, [
        getTargetDifficulty, 
        calculatePerformanceScore, 
        questions, 
        currentQuestionIndex, 
        localAttempts,
        currentQuestion
    ]);

    // ===== NAVIGATION STATE =====
    
    /**
     * Check if there are any attempted questions before current index
     */
    const canGoPrev = useMemo(() => {
        for (let i = currentQuestionIndex - 1; i >= 0; i--) {
            const question = questions[i];
            const hasAttempt = question?.attempt || localAttempts.has(question?.question?.id);
            if (hasAttempt) {
                return true;
            }
        }
        return false;
    }, [currentQuestionIndex, questions, localAttempts]);
    
    /**
     * Check if there are any questions to navigate to
     * Uses adaptive selection or sequential fallback
     */
    const hasMoreQuestions = useMemo(() => {
        const hasAdaptive = getAdaptiveNextQuestion() !== null;
        const hasSequential = currentQuestionIndex < questions.length - 1;
        return hasAdaptive || hasSequential;
    }, [getAdaptiveNextQuestion, currentQuestionIndex, questions.length]);
    
    const canGoNext = hasMoreQuestions;

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

    // Auto-navigate to next adaptive question after successful attempt (optional)
    // Uncomment if you want automatic navigation after each attempt
    /*
    useEffect(() => {
        if (currentAttempt && !isSubmitting) {
            const timer = setTimeout(() => {
                const nextIndex = getAdaptiveNextQuestion();
                if (nextIndex !== null) {
                    setCurrentQuestionIndex(nextIndex);
                }
            }, 2000); // Wait 2 seconds before auto-navigating

            return () => clearTimeout(timer);
        }
    }, [currentAttempt, isSubmitting, getAdaptiveNextQuestion]);
    */

    // ===== EVENT HANDLERS =====
    /**
     * Navigate to previous attempted question only
     * Skips unattempted questions
     */
    const handlePrevQuestion = useCallback(() => {
        // Find the previous attempted question
        let prevAttemptedIndex = -1;
        
        for (let i = currentQuestionIndex - 1; i >= 0; i--) {
            const question = questions[i];
            const hasAttempt = question.attempt || localAttempts.has(question.question.id);
            
            if (hasAttempt) {
                prevAttemptedIndex = i;
                break;
            }
        }
        
        if (prevAttemptedIndex !== -1) {
            setCurrentQuestionIndex(prevAttemptedIndex);
            userHasNavigated.current = true;
            
            if (LOG_LEVELS.NAVIGATION) {
                console.log('[Adaptive Learning] Navigate to previous attempted question:', prevAttemptedIndex);
            }
        }
    }, [currentQuestionIndex, questions, localAttempts]);

    /**
     * Smart next question - uses adaptive selection when available,
     * falls back to sequential if no adaptive match found
     */
    const handleNextQuestion = useCallback(() => {
        // Try adaptive selection first
        const adaptiveNextIndex = getAdaptiveNextQuestion();
        
        if (adaptiveNextIndex !== null) {
            // Use smart selection
            setCurrentQuestionIndex(adaptiveNextIndex);
            userHasNavigated.current = true;
            
            if (LOG_LEVELS.NAVIGATION) {
                console.log('[Adaptive Learning] Smart navigation to index:', adaptiveNextIndex);
            }
        } else if (currentQuestionIndex < questions.length - 1) {
            // Fallback to sequential navigation
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            userHasNavigated.current = true;
            
            if (LOG_LEVELS.NAVIGATION) {
                console.log('[Adaptive Learning] Sequential navigation (no adaptive match)');
            }
        }
    }, [currentQuestionIndex, questions.length, getAdaptiveNextQuestion]);


    const handleAttempt = useCallback(async (attemptData: attempDataProps) => {
        if (isSubmitting || !currentQuestion) return;

        setIsSubmitting(true);


        const optimisticAttempt = {
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
                
                // Update the cache directly instead of invalidating to avoid auto-navigation
                // Remove invalidateQueries to prevent automatic navigation issues
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
    }, [currentQuestion, isSubmitting]);

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
                <div className="flex items-center justify-end h-14">
                    {/* Navigation Buttons - Now with Smart Selection */}
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

