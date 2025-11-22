import { Skeleton } from "@repo/common-ui"


const MistakeTrackerDashboardSkeleton = () => {
    return (
      <div className="p-4 space-y-6">
        {/* Overview Section Skeleton */}
        <Skeleton className="border border-primary-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Section: Summary */}
              <div className="md:col-span-1 space-y-4">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-baseline gap-2">
                  <Skeleton className="h-12 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-2 w-full" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
  
              {/* Right Section: Breakdown */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Three cards */}
                  {[1, 2, 3].map((item) => (
                    <Skeleton key={item} className=" border-primary-100 p-4">
                      <Skeleton className="h-4 w-20 mb-3" />
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-4 w-16" />
                    </Skeleton>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Skeleton>
  
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Distribution Chart (2 columns) */}
          <div className="col-span-2">
            <Skeleton className="p-4">
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-6 w-48" />
              </div>
              
              {/* Chart Area */}
              <div className="space-y-4">
                <Skeleton className="h-[240px] w-full" />
              </div>
  
              {/* Suggestion Box */}
              <div className="bg-primary-50 rounded-md p-3 flex gap-3 mt-4">
                <Skeleton className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-1" />
                </div>
              </div>
            </Skeleton>
          </div>
  
          {/* Insights Panel (1 column) */}
          <div className="col-span-1">
            <Skeleton className="p-6">
              <Skeleton className="h-6 w-36 mb-4" />
              <div className="space-y-4">
                {/* Three insight items */}
                {[1, 2, 3].map((item) => (
                  <div key={item} className="p-3 bg-primary-50 rounded-lg ">
                    <div className="flex items-center mb-2">
                      <Skeleton className="h-5 w-5 mr-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3 mt-1" />
                  </div>
                ))}
              </div>
            </Skeleton>
          </div>
        </div>
  
        {/* Banner Section */}
        <Skeleton className="bg-gradient-to-r from-primary-400 to-primary-500 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <Skeleton className="h-6 w-64 mb-2 bg-primary-300" />
              <Skeleton className="h-4 w-80 bg-primary-300" />
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Skeleton className="h-10 w-40 bg-primary-300" />
              <Skeleton className="h-10 w-36 bg-primary-300" />
            </div>
          </div>
        </Skeleton>
      </div>
    )
  }
  
  export default MistakeTrackerDashboardSkeleton