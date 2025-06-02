import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const TestDashboardSkeleton = () => {
    return (
        <main className="flex-grow px-4 py-4 md:px-4 md:py-6 max-w-7xl mx-auto w-full">
            {/* Recommended Test Skeleton */}
            <div className="mb-6">
                <Skeleton className="bg-gray-50 rounded-lg p-4  border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                            <Skeleton className="h-6 w-full max-w-md mb-3" />
                            <Skeleton className="h-4 w-3/4 mb-3" />
                            <div className="flex flex-wrap gap-2 mt-3">
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-6 w-14 rounded-full" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-40" />
                    </div>
                </Skeleton>
            </div>

            {/* Scheduled Tests Skeleton */}
            <div className="mb-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-3">
                    {[1, 2].map((item) => (
                        <Skeleton key={item} className=" p-4 rounded-lg">
                            <div className="flex flex-wrap gap-2 mb-3">
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-5 w-3/4 mb-4" />
                            <div className="flex flex-col md:flex-row md:justify-between gap-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <Skeleton className="h-9 w-24" />
                            </div>
                        </Skeleton>
                    ))}
                </div>
            </div>

            {/* Available Tests Skeleton */}
            <div className="mb-6">
                <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
                    <Skeleton className="h-6 w-48" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, index) => (
                        <Skeleton key={index} className="p-4">
                            <div className="flex justify-end mb-2">
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </div>
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-4" />

                            <div className="space-y-2 mb-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                            </div>

                            <Skeleton className="h-9 w-full" />
                        </Skeleton>
                    ))}
                </div>
            </div>

            {/* Recent Test Results Skeleton */}
            <div className="mb-6">
                <Skeleton className="h-6 w-48 mb-4" />

                <div className="space-y-4 divide-y divide-gray-100">
                    {Array(3).fill(0).map((_, index) => (
                        <div key={index} className="py-4">
                            <Skeleton className="h-5 w-3/4 mb-3" />
                            <div className="flex flex-col sm:flex-row gap-4 mb-3">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                            <div className="flex justify-end">
                                <Skeleton className="h-9 w-28" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex justify-center">
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
        </main>
    )
}

export default TestDashboardSkeleton