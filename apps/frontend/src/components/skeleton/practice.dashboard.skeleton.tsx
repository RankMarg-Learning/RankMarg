import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"

const PracticeDashboardSkeleton = () => {
    return (
        <div>
            {/* Today's Sessions Section */}
            <div className="mb-8 md:space-y-6 space-y-3">
                <Skeleton className="flex items-center justify-between mb-4">
                    <Skeleton className="h-7 w-64" />
                    <Skeleton className="h-5 w-28 rounded-full" />
                </Skeleton>

                {/* Session Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, index) => (
                        <Skeleton key={index} className="p-4 overflow-hidden">
                            <div className="flex justify-between items-start mb-3">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-32 rounded-full" />
                            </div>

                            <div className="space-y-3 mb-4">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                    <Skeleton className="h-2 w-full" />
                                </div>
                            </div>

                            <div>
                                <Skeleton className="h-5 w-24 mb-2" />
                                <div className="flex flex-wrap gap-1">
                                    {[...Array(3)].map((_, i) => (
                                        <Skeleton key={i} className="h-6 w-16 rounded-full" />
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4">
                                <Skeleton className="h-10 w-full rounded-md" />
                            </div>
                        </Skeleton>
                    ))}
                </div>

                <div className="mt-4 text-center">
                    <Skeleton className="h-10 w-72 mx-auto rounded-md" />
                </div>

                {/* Practice Summary Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <Skeleton className="p-6">
                        <div className="flex items-center mb-6">
                            <div>
                                <Skeleton className="h-6 w-48 mb-2" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="ml-auto">
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <Skeleton className="h-5 w-36" />
                                            <Skeleton className="h-5 w-12" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <Skeleton className="h-5 w-36 mb-3" />
                                <div className="space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between mb-1">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-4 w-28" />
                                            </div>
                                            <Skeleton className="h-3 w-full" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Skeleton>

                    <Skeleton className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-5 w-24 rounded-full" />
                        </div>

                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="p-4 rounded-lg border">
                                    <Skeleton className="h-5 w-full mb-2" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            ))}
                        </div>
                    </Skeleton>
                </div>

                {/* Banner Skeleton */}
                <div className="rounded-xl p-8 bg-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-6 md:mb-0 md:mr-8">
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                            <Skeleton className="h-10 w-40 rounded-md" />
                            <Skeleton className="h-10 w-40 rounded-md" />
                        </div>
                    </div>
                </div>

                {/* Recent Practice Results Skeleton */}
                <Skeleton className="w-full p-4 border-0">
                    <div className="flex justify-between items-center mb-4">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-5 w-16" />
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-w-full">
                            <div className="flex border-b pb-2 mb-2">
                                <Skeleton className="h-5 w-24 mx-2" />
                                <Skeleton className="h-5 w-20 mx-2" />
                                <Skeleton className="h-5 w-16 mx-2" />
                                <Skeleton className="h-5 w-16 mx-2" />
                                <Skeleton className="h-5 w-16 mx-2" />
                                <Skeleton className="h-5 w-16 mx-2" />
                            </div>

                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center py-3 border-b">
                                    <div className="w-1/4 flex items-center gap-2">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div>
                                            <Skeleton className="h-5 w-24 mb-1" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-5 w-16 mx-2" />
                                    <Skeleton className="h-5 w-12 mx-2" />
                                    <Skeleton className="h-5 w-14 mx-2 rounded-full" />
                                    <Skeleton className="h-5 w-12 mx-2" />
                                    <Skeleton className="h-5 w-16 mx-2" />
                                </div>
                            ))}
                        </div>
                    </div>
                </Skeleton>

                {/* Testimonials Skeleton */}
                <Skeleton className="p-6">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-start">
                                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                                <div>
                                    <Skeleton className="h-5 w-32 mb-1" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Skeleton className="h-10 rounded-md" />
                        <Skeleton className="h-10 rounded-md" />
                    </div>
                </Skeleton>
            </div>
        </div>
    )
}

export default PracticeDashboardSkeleton