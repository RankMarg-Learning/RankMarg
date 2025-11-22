import React from 'react';
import { Skeleton } from "@repo/common-ui";

/**
 * DashboardSkeleton component - A simplified loading state that maintains
 * the overall structure of the dashboard without complex nested components
 */
const DashboardSkeleton = () => {
    return (
        <div className="flex flex-col space-y-6">
            {/* Smart Study Hub skeleton block */}
            <Skeleton className="w-full h-60 md:h-48 rounded-lg" />

            {/* Smart Subject Session skeleton block */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="w-full h-72 rounded-lg" />
                <div className="flex justify-center gap-2 mt-2">
                    {[1, 2, 3].map((_, i) => (
                        <Skeleton key={i} className="w-2 h-2 rounded-full" />
                    ))}
                </div>
            </div>

            {/* Quick Navigation skeleton block */}
            <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    {Array(8).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;