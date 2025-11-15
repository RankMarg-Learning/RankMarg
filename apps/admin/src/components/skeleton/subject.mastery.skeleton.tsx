import React from 'react'
import { Skeleton } from '@repo/common-ui'

const MasterySubjectSkeleton = () => {
    return (
        <div className="space-y-6">
            {/* Subject Header Skeleton */}
            <Skeleton className="rounded-lg  p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="flex flex-col items-end">
                        <Skeleton className="h-6 w-32 rounded-full" />
                        <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex justify-between mb-1">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                </div>
            </Skeleton>

            {/* Topics Accordion Skeleton */}
            <div className="space-y-3">
                {[1, 2, 3,4,5].map((_, index) => (
                    <Skeleton key={index} className="m-2 rounded-lg shadow-sm overflow-hidden">
                        <div className="px-4 py-4">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                        </div>

                    </Skeleton>
                ))}
            </div>

            {/* Study Tips Skeleton */}
            <Skeleton className="rounded-lg  p-4">
                <Skeleton className="h-5 w-24 mb-2" />
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <Skeleton className="h-4 w-4 mt-0.5" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="flex items-start gap-2">
                        <Skeleton className="h-4 w-4 mt-0.5" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="flex items-start gap-2">
                        <Skeleton className="h-4 w-4 mt-0.5" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
            </Skeleton>
        </div>
    )
}

export default MasterySubjectSkeleton