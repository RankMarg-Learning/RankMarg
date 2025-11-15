import React from 'react';
import { Skeleton } from '@repo/common-ui';



const AnalyticsDashboardSkeleton = () => {
    return (
        <div className="p-6  space-y-6">
            {/* Header skeleton */}
            <div className="space-y-3">
                <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Cards grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Skeleton className="space-y-3 p-4  rounded-lg">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                </Skeleton>
                <Skeleton className="space-y-3 p-4  rounded-lg">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                </Skeleton>
                <Skeleton className="space-y-3 p-4  rounded-lg">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                </Skeleton>
                <Skeleton className="space-y-3 p-4  rounded-lg">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                </Skeleton>
            </div>

            {/* Main content area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Chart area */}
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="p-4  rounded-lg">
                        <Skeleton className="h-6 w-1/3 mb-4" />
                        <Skeleton className="h-48 w-full" />
                        <div className="mt-4 p-3 bg-blue-50 rounded">
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </Skeleton>
                </div>

                {/* Right column - Stats */}
                <div className="space-y-4">
                    {/* Stats cards */}
                    <div className="p-4  rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-red-50 rounded-lg p-4 text-center">
                                <Skeleton className="h-6 w-8 mx-auto mb-2" />
                                <Skeleton className="h-3 w-16 mx-auto" />
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                <Skeleton className="h-6 w-8 mx-auto mb-2" />
                                <Skeleton className="h-3 w-16 mx-auto" />
                            </div>
                        </div>
                    </div>

                    {/* Difficulty breakdown */}
                    <div className="p-4  rounded-lg">
                        <Skeleton className="h-5 w-1/2 mb-4" />
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-green-50 rounded-lg p-3 text-center">
                                <Skeleton className="h-6 w-6 mx-auto mb-2" />
                                <Skeleton className="h-3 w-8 mx-auto" />
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-3 text-center">
                                <Skeleton className="h-6 w-6 mx-auto mb-2" />
                                <Skeleton className="h-3 w-12 mx-auto" />
                            </div>
                            <div className="bg-orange-50 rounded-lg p-3 text-center">
                                <Skeleton className="h-6 w-6 mx-auto mb-2" />
                                <Skeleton className="h-3 w-8 mx-auto" />
                            </div>
                            <div className="bg-red-50 rounded-lg p-3 text-center">
                                <Skeleton className="h-6 w-6 mx-auto mb-2" />
                                <Skeleton className="h-3 w-16 mx-auto" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-full mt-3" />
                    </div>

                    {/* Time distribution */}
                    <div className="p-4  rounded-lg">
                        <Skeleton className="h-5 w-3/4 mb-4" />
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                <Skeleton className="h-6 w-12 mx-auto mb-2" />
                                <Skeleton className="h-3 w-20 mx-auto" />
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                                <Skeleton className="h-6 w-12 mx-auto mb-2" />
                                <Skeleton className="h-3 w-24 mx-auto" />
                            </div>
                            <div className="bg-amber-50 rounded-lg p-4 text-center">
                                <Skeleton className="h-6 w-12 mx-auto mb-2" />
                                <Skeleton className="h-3 w-20 mx-auto" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-full mt-3" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsDashboardSkeleton;