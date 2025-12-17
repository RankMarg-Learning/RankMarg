import React from 'react'
import { Skeleton } from '@repo/common-ui'

const RevisionDashboardSkeleton = () => {
    return (
        <div className="space-y-6">
            {/* Statistics Overview Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 p-4 border border-gray-200" />
                ))}
            </div>

            {/* Filter Tabs Skeleton */}
            <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-9 w-24" />
                ))}
            </div>

            {/* Revision Schedule List Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-40 p-5 border border-gray-200" />
                    ))}
                </div>
            </div>

            {/* Subject Breakdown Skeleton */}
            <Skeleton className="h-64 p-5 border border-gray-200" />
        </div>
    )
}

export default RevisionDashboardSkeleton
