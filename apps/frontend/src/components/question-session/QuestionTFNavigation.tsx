"use client"

import React from 'react';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { Progress } from '@repo/common-ui';
import { cn } from '@/lib/utils';

interface QuestionTFNavigationProps {
    canGoPrev: boolean;
    canGoNext: boolean;
    isSubmitting?: boolean;
    onPrev: () => void;
    onNext: () => void;
    mobileMenuOpen?: boolean;
    showProgress?: boolean;
    progressPercentage?: number;
    attemptedCount?: number;
    totalCount?: number;
    showNextUnattempted?: boolean;
    onNextUnattempted?: () => void;
    variant?: 'session' | 'review';
}

export const QuestionTFNavigation: React.FC<QuestionTFNavigationProps> = ({
    canGoPrev,
    canGoNext,
    isSubmitting = false,
    onPrev,
    onNext,
    mobileMenuOpen = false,
    showProgress = false,
    progressPercentage = 0,
    attemptedCount = 0,
    totalCount = 0,
    showNextUnattempted = false,
    onNextUnattempted,
    variant = 'session',
}) => {
    const renderProgressSection = () => {
        if (!showProgress) return null;

        return (
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
                        {attemptedCount}/{totalCount}
                    </span>
                </div>

                {/* Next Unattempted Button */}
                {showNextUnattempted && onNextUnattempted && (
                    <button
                        onClick={onNextUnattempted}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <SkipForward className="h-4 w-4" />
                        <span className="hidden sm:inline">Next Unattempted</span>
                    </button>
                )}
            </div>
        );
    };

    const renderNavigationButtons = () => {
        return (
            <div className="flex items-center gap-3">
                <button
                    onClick={onPrev}
                    disabled={!canGoPrev || isSubmitting}
                    className="inline-flex items-center justify-center w-10 h-10 text-primary-600 hover:text-primary-700 hover:bg-primary-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                    onClick={onNext}
                    disabled={!canGoNext || isSubmitting}
                    className="inline-flex items-center justify-center w-10 h-10 text-primary-600 hover:text-primary-700 hover:bg-primary-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        );
    };




    return (
        <div className={cn(
            "sticky bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-gray-100",
            mobileMenuOpen && "hidden lg:block"
        )}>
            <div className="max-w-8xl mx-auto px-4 sm:px-6">
                <div className={cn(
                    "flex items-center h-14",
                    showProgress ? "justify-between" : variant === 'review' ? "justify-center" : "justify-end"
                )}>
                    {/* Left Side - Progress and Controls */}
                    {showProgress && (
                        <div className="flex-1 min-w-0">
                            {renderProgressSection()}
                        </div>
                    )}
                    {/* Right Side - Navigation Buttons */}
                    <div className={cn(
                        "flex-shrink-0",
                        variant === 'review' && showProgress && "ml-4"
                    )}>
                        {renderNavigationButtons()}
                    </div>
                </div>
            </div>
        </div>
    );
};

