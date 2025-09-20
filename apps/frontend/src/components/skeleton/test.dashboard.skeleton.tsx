import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const TestDashboardSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
                {/* Dashboard Header Skeleton */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <Skeleton className="h-8 w-64 mb-2" />
                            <Skeleton className="h-4 w-80" />
                        </div>
                        <Skeleton className="h-6 w-32 rounded-full" />
                    </div>

                    {/* Dashboard Stats Skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array(4).fill(0).map((_, index) => (
                            <div key={index} className="bg-white border-0 shadow-sm rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <Skeleton className="h-9 w-9 rounded-lg" />
                                    <div>
                                        <Skeleton className="h-8 w-12 mb-1" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommended Test Skeleton */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-1 w-8 rounded-full" />
                        <Skeleton className="h-6 w-48" />
                    </div>
                    <div className="bg-primary-50 rounded-lg p-4 border border-primary-100 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <div className="flex-1">
                                    <Skeleton className="h-6 w-full max-w-md mb-3" />
                                    <Skeleton className="h-4 w-3/4 mb-3" />
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                        <Skeleton className="h-6 w-14 rounded-full" />
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                    </div>
                                </div>
                            </div>
                            <Skeleton className="h-10 w-40" />
                        </div>
                    </div>
                </div>

                {/* Scheduled Tests Skeleton */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-1 w-8 rounded-full" />
                        <Skeleton className="h-6 w-40" />
                    </div>
                    <div className="space-y-3">
                        {[1, 2].map((item) => (
                            <div key={item} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
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
                            </div>
                        ))}
                    </div>
                </div>

                {/* Available Tests Skeleton */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-1 w-8 rounded-full" />
                        <Skeleton className="h-6 w-40" />
                    </div>
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
                            <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <div className="flex justify-end p-2">
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                </div>
                                <div className="p-4">
                                    <Skeleton className="h-5 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-full mb-4" />

                                    <div className="space-y-2 mb-4">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>

                                    <Skeleton className="h-9 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Test Results Skeleton */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-1 w-8 rounded-full" />
                        <Skeleton className="h-6 w-48" />
                    </div>

                    <div className="bg-white border-0 shadow-sm rounded-lg p-3">
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
                </div>
            </main>
        </div>
    )
}

export default TestDashboardSkeleton