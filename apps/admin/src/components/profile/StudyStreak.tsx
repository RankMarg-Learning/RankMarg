"use client"
import React from 'react'
import { Badge } from '@repo/common-ui'

interface UserPerformance {
    streak: number | null
}

interface StudyStreakProps {
    userPerformance: UserPerformance | null
}

export function StudyStreak({ userPerformance }: StudyStreakProps) {
    const streak = userPerformance?.streak || 0

    return (
        <div className="mt-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200/60">
                <h4 className="text-sm font-semibold">Study Streak</h4>
            </div>
            <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <span className="text-3xl font-bold text-primary-600">
                            {streak}
                        </span>
                        <span className="text-muted-foreground ml-2">days</span>
                    </div>
                    <Badge variant="outline">Current</Badge>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-4">
                    {[...Array(7)].map((_, index) => {
                        const isCompleted = streak >= 7 - index;
                        return (
                            <div
                                key={index}
                                className={`h-8 rounded-md ${
                                    isCompleted ? 'bg-primary-600' : 'bg-gray-200'
                                }`}
                            />
                        );
                    })}
                </div>

                <div className="text-center text-xs text-muted-foreground">
                    <p>
                        Last {streak} days completed successfully!
                    </p>
                </div>
            </div>
        </div>
    )
}
