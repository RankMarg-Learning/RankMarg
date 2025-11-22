"use client"

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/common-ui';
import { Skeleton } from '@repo/common-ui';
import { Badge } from '@repo/common-ui';
import { ArrowLeft, CheckCircle2, XCircle, Clock, BookOpen, Share2, Check } from 'lucide-react';
import { Button } from '@repo/common-ui';
import { aiQuestionService } from '@/services/aiQuestion.service';
import { useToast } from '@/hooks/use-toast';

interface AiQuestionHistoryProps {
    topicSlug: string;
    onBack: () => void;
}

const AiQuestionHistory: React.FC<AiQuestionHistoryProps> = ({ topicSlug, onBack }) => {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const { data: historyData, isLoading } = useQuery({
        queryKey: ["ai-question-history", topicSlug],
        queryFn: () => aiQuestionService.getRecentAttemptsByTopic(topicSlug, 10),
        staleTime: 1 * 60 * 1000, // 1 minute
    });

    const attempts = historyData?.attempts || [];
    const metadata = historyData?.metadata || null;

    const handleShareHistory = () => {
        const url = `${window.location.origin}${window.location.pathname}?view=history`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            toast({
                title: "Link Copied!",
                description: "History link has been copied to clipboard",
                duration: 2000,
            });
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
            toast({
                title: "Failed to copy",
                description: "Please copy the URL manually",
                variant: "destructive",
            });
        });
    };

    const getStatusBadge = (isCorrect: boolean) => {
        if (isCorrect) {
            return (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Correct
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                <XCircle className="w-3 h-3 mr-1" />
                Incorrect
            </Badge>
        );
    };

    const getDifficultyBadge = (difficulty: number) => {
        const difficultyInfo = {
            1: { label: "Easy", color: "bg-green-100 text-green-800 border-green-300" },
            2: { label: "Medium", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
            3: { label: "Hard", color: "bg-orange-100 text-orange-800 border-orange-300" },
            4: { label: "Very Hard", color: "bg-red-100 text-red-800 border-red-300" },
        }[difficulty] || { label: "Unknown", color: "bg-gray-100 text-gray-800 border-gray-300" };

        return (
            <Badge variant="outline" className={difficultyInfo.color}>
                {difficultyInfo.label}
            </Badge>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Questions
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        onClick={handleShareHistory}
                        className="gap-2"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Share2 className="w-4 h-4" />
                                Share History
                            </>
                        )}
                    </Button>
                </div>

                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Recent Attempts
                        </h1>
                        <p className="text-gray-600 text-lg">
                            {metadata?.topicName} • {metadata?.subjectName}
                        </p>
                    </div>
                </div>

                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Attempts</p>
                                <p className="text-xl font-bold text-blue-600">
                                    {metadata?.totalAttempts || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Attempts List */}
            {isLoading ? (
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : attempts.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No Attempts Yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                            You haven't attempted any questions for this topic yet.
                        </p>
                        <Button onClick={onBack}>
                            Start Solving
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {attempts.map((attempt: any, index: number) => {
                        const question = attempt.question;
                        return (
                            <Card
                                key={attempt.id}
                                className="hover:shadow-lg transition-shadow"
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">
                                                    {question.title}
                                                </CardTitle>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                            {getStatusBadge(attempt.status === "CORRECT")}
                                            {getDifficultyBadge(question.difficulty)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 ml-13">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{attempt.timing ? `${attempt.timing}s` : 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="w-4 h-4" />
                                            <span>{question.type.replace("_", " ")}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className="prose prose-sm max-w-none mb-4 line-clamp-3"
                                        dangerouslySetInnerHTML={{ __html: question.content }}
                                    />
                                    {attempt.mistake && (
                                        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                            <p className="text-sm font-medium text-amber-900 mb-1">
                                                Mistake Category:
                                            </p>
                                            <p className="text-sm text-amber-800">
                                                {attempt.mistake.replace("_", " ")}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AiQuestionHistory;

