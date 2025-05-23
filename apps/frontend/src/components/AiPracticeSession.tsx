"use client"
import { addAttempt, getAiPracticeSession } from '@/services';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react'
import QuestionUI from './QuestionUI';
import { attempDataProps } from '@/types';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import Loading from './Loading';

const AiPracticeSession = ({ sessionId }: { sessionId: string }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [attemptedQuestions, setAttemptedQuestions] = useState<string[]>([]);

    const { data: session, isLoading, refetch } = useQuery({
        queryKey: ["question", sessionId],
        queryFn: () => getAiPracticeSession(sessionId),
    });

    useEffect(() => {
        if (session?.data?.attempts) {
            const attemptedIds = session.data.attempts.map(attempt => attempt.questionId);
            setAttemptedQuestions(attemptedIds);
            
            const questions = session.data.questions || [];
            const firstUnattemptedIndex = questions.findIndex(
                q => !attemptedIds.includes(q.question.id)
            );
            
            if (firstUnattemptedIndex !== -1) {
                setCurrentQuestionIndex(firstUnattemptedIndex);
            }
        }
    }, [session]);

    const questions = session?.data?.questions || [];
    const currentQuestion = questions[currentQuestionIndex]?.question;

    const currentQuestionAttempt = session?.data?.attempts?.find(
        attempt => attempt.questionId === currentQuestion?.id
    );

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prevIndex => prevIndex - 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        }
    };

    const handleAttempt = async (attemptData: attempDataProps) => {
        try {
            const response = await addAttempt({
                attemptData,
                attemptType: "SESSION",
                id: sessionId
            });

            if (response.success) {
                if (!attemptedQuestions.includes(currentQuestion.id)) {
                    setAttemptedQuestions(prev => [...prev, currentQuestion.id]);
                }
                await refetch();

            } else {
                console.error("Failed to submit attempt");
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return <Loading/>
    }

    if (!session?.success) {
        return (
            <div className="flex justify-center items-center h-screen">
                <h1 className="text-2xl font-bold text-red-500">{session?.message}</h1>
            </div>
        )
    }

    return (
        <div className="container mx-auto ">
            <div className="flex items-center justify-between mb-2 px-2 relative">
                <Button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    variant="ghost"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Previous
                </Button>

                <div className="absolute left-1/2 transform -translate-x-1/2 text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {questions.length}
                </div>

                <Button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    variant="ghost"
                >
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
            </div>

            {currentQuestion && (
                <QuestionUI
                    key={currentQuestion.id}
                    question={currentQuestion}
                    handleAttempt={handleAttempt}
                    answer={currentQuestionAttempt?.answer || null}
                />
            )}
        </div>

    );
};

export default AiPracticeSession;