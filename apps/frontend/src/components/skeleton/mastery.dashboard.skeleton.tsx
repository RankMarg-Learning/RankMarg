import React from 'react'
import { Skeleton } from '@repo/common-ui'

const MasteryDashboardSkeleton = () => {
    return (
        <div>
            <div className="mb-8 space-y-3 md:space-y-6">
                {/* MasteryOverview skeleton */}
                <Skeleton className="border border-gray-100 shadow-sm mb-6 overflow-hidden">
                    <div className="md:p-6 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Overall Mastery section */}
                            <div className="md:col-span-1">
                                <Skeleton className="h-4 w-36 mb-2" />
                                <div className="mt-2 flex items-baseline gap-2">
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                                <div className="mt-4">
                                    <Skeleton className="h-2 w-full" />
                                </div>
                                <div className="md:mt-4 mt-2">
                                    <Skeleton className="h-4 w-40" />
                                </div>
                            </div>

                            {/* Stats cards */}
                            <div className="md:col-span-2">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {/* Mastery Level card */}
                                    <Skeleton className=" p-4">
                                        <Skeleton className="h-4 w-24 mb-2" />
                                        <Skeleton className="h-6 w-20 mb-2" />
                                        <Skeleton className="h-4 w-32" />
                                    </Skeleton>

                                    {/* Concepts Mastered card */}
                                    <Skeleton className=" p-4">
                                        <Skeleton className="h-4 w-32 mb-2" />
                                        <Skeleton className="h-6 w-16 mb-2" />
                                        <Skeleton className="h-4 w-36" />
                                    </Skeleton>

                                    {/* Study Streak card */}
                                    <Skeleton className=" p-4">
                                        <Skeleton className="h-4 w-24 mb-2" />
                                        <Skeleton className="h-6 w-12 mb-2" />
                                        <Skeleton className="h-4 w-28" />
                                    </Skeleton>
                                </div>
                            </div>
                        </div>
                    </div>
                </Skeleton>

                {/* Subject Mastery section */}
                <div className="mb-8">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Subject Mastery Cards - render 3 skeleton cards */}
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="flex flex-col">
                                {/* Subject card header */}
                                <Skeleton className="overflow-hidden animate-pulse">
                                    <div className="p-5">
                                        <div className="flex justify-between items-center mb-4">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-5 w-12" />
                                        </div>
                                        <Skeleton className="h-2 w-full mb-3" />
                                    </div>
                                </Skeleton>

                                {/* Subject card body */}
                                <div className="p-4 bg-white rounded-lg shadow-sm">
                                    <Skeleton className="h-5 w-36 mb-3" />

                                    {/* Improvement Areas */}
                                    <div className="space-y-2 mb-6">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={`imp-${i}`} className="flex justify-between">
                                                <Skeleton className="h-4 w-28" />
                                                <Skeleton className="h-4 w-12" />
                                            </div>
                                        ))}
                                    </div>

                                    <Skeleton className="h-5 w-40 mb-3" />

                                    {/* Top Performing Topics */}
                                    <div className="space-y-2 mb-6">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={`top-${i}`} className="flex justify-between">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-4 w-12" />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Recommendations section */}
                                    <div className="mb-6 border-t pt-3 border-gray-200">
                                        <Skeleton className="h-5 w-48 mb-3" />
                                        {[...Array(2)].map((_, i) => (
                                            <div key={`rec-${i}`} className="bg-gray-50 rounded-md p-2 mb-2">
                                                <div className="flex gap-2">
                                                    <Skeleton className="h-5 w-5" />
                                                    <Skeleton className="h-4 w-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Skeleton className="h-10 w-full rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MasteryDashboardSkeleton