"use client"
import React from 'react'
import { Progress } from '@repo/common-ui'
import { SubjectBackgroundColor, SubjectIcons, SubjectTextColor } from '@/constant/SubjectColorCode'

interface UserPerformance {
    accuracy: number | null
    avgScore: number | null
    subjectWiseAccuracy: Record<string, { accuracy: number }> | null
}

interface AcademicPerformanceProps {
    userPerformance: UserPerformance | null
}

export function AcademicPerformance({ userPerformance }: AcademicPerformanceProps) {
    return (
        <div className="mb-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-200/60">
                <h3 className="text-sm font-semibold">Academic Performance</h3>
            </div>
            <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="rounded-md bg-gray-50 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-muted-foreground">Accuracy</p>
                            <span className="text-sm font-medium text-primary-600">
                                {userPerformance?.accuracy?.toFixed(2) || 0.0}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <Progress 
                                indicatorColor='bg-primary-600' 
                                value={userPerformance?.accuracy || 0} 
                                className="h-2.5 rounded-full" 
                            />
                        </div>
                    </div>
                    
                    <div className="rounded-md bg-gray-50 p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-muted-foreground">Average Score</p>
                            <span className="text-sm font-medium text-primary-600">
                                {userPerformance?.avgScore || 0}/100
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <Progress 
                                indicatorColor='bg-primary-600' 
                                value={userPerformance?.avgScore || 0} 
                                className="h-2.5 rounded-full" 
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Subject-wise Performance</h4>
                    <div className="space-y-4">
                        {userPerformance?.subjectWiseAccuracy &&
                        Object.entries(userPerformance.subjectWiseAccuracy).length > 0 ? (
                            Object.entries(userPerformance.subjectWiseAccuracy).map(([subjectKey, stats]) => {
                                const subject = subjectKey.toLowerCase();
                                const Icon = SubjectIcons[subject] || SubjectIcons.default;
                                const accuracy = parseFloat(((stats as { accuracy: number }).accuracy ?? 0).toFixed(2));
                                const textColor = SubjectTextColor[subject] || SubjectTextColor.default;
                                const barColor = SubjectBackgroundColor[subject] || SubjectBackgroundColor.default;

                                return (
                                    <div key={subjectKey}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <Icon className={`w-4 h-4 ${textColor}`} />
                                                <span className={`text-xs font-medium ${textColor}`}>
                                                    {subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1)}
                                                </span>
                                            </div>
                                            <span className={`text-xs font-medium ${textColor}`}>
                                                {accuracy}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className={`${barColor} h-2.5 rounded-full transition-all duration-500`}
                                                style={{ width: `${accuracy}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-muted-foreground text-center py-4">
                                No subject-wise performance data available.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
