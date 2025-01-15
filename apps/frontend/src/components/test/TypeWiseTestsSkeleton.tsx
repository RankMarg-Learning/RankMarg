import { Skeleton } from "@/components/ui/skeleton";

const TypeWiseTestsSkeleton = () => (
  <div className="min-h-screen mx-auto p-6 max-w-7xl">
    {/* Header Skeleton */}
    <Skeleton className="h-10 w-1/3 mb-8" />

    {/* Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Repeatable Skeleton Boxes for Subjects */}
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className=" rounded-lg p-6">
          {/* Big Box Skeleton */}
          <Skeleton className="h-screen  md:w-96 w-60 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

export default TypeWiseTestsSkeleton;
