"use client"
import React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { SubjectBackgroundColor, SubjectIcons, SubjectTextColor } from '@/constant/SubjectColorCode'

interface StudyItem {
    id: string
    isCurrent: boolean
    isCompleted: boolean
    startedAt: string
    subjectName: string
    topicName: string
    subjectId?: string
}

interface CurrentStudiesProps {
    userCurrentStudies: StudyItem[]
}

export function CurrentStudies({ userCurrentStudies }: CurrentStudiesProps) {
    const currentStudies = userCurrentStudies.filter((item) => item.isCurrent && !item.isCompleted)

    return (
        <div className="overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-200/60">
                <h3 className="text-sm font-semibold">Current Study Progress</h3>
                <Link 
                    href="/my-curriculum" 
                    className="text-xs text-primary-600 hover:text-primary-700"
                >
                    Manage
                </Link>
            </div>
            <div className="p-5 space-y-5">
                <div className="space-y-6">
                    {currentStudies.length > 0 ? (
                        currentStudies.map((study) => {
                            const subjectKey = study.subjectName.toLowerCase();
                            const Icon = SubjectIcons[subjectKey] || SubjectIcons.default;
                            const iconBg = SubjectBackgroundColor[subjectKey] || SubjectBackgroundColor.default;
                            const textColor = SubjectTextColor[subjectKey] || SubjectTextColor.default;
                            const formattedStartDate = format(new Date(study.startedAt), "MMM d, yyyy");

                            return (
                                <div key={study.id} className="mb-6">
                                    <div className="flex items-center mb-3">
                                        <div className={`h-10 w-10 rounded-full ${iconBg} bg-opacity-20 flex items-center justify-center mr-3`}>
                                            <Icon className={`h-6 w-6 ${textColor}`} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm text-gray-800">Currently Studying</h4>
                                            <p className="text-xs text-muted-foreground">
                                                <Link
                                                    href={`/my-curriculum${study.subjectId ? `?subjectId=${study.subjectId}` : ''}`}
                                                    className="hover:underline"
                                                >
                                                    {study.subjectName}: {study.topicName}
                                                </Link>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ml-13 pl-5">
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Started: {formattedStartDate}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-muted-foreground text-center py-4">
                            No current studies found. Start studying to see your progress here.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
