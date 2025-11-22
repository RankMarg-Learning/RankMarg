import { Skeleton } from "@repo/common-ui";

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Profile Header Skeleton */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="text-center md:text-left">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-6 w-32 mb-2" />
              <div className="flex flex-wrap items-center justify-center md:justify-start mt-3 gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Main Content Skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg hidden" />
          </div>

          {/* Middle Column */}
          <div className="space-y-6 md:col-span-2">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>

        {/* Contribution Section */}
        <div className="mt-8 relative">
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
