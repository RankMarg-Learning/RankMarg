import { Skeleton } from "@repo/common-ui";

export default function PointActivitySkeleton() {
    return (
        <div className="w-full h-screen">
            <div className="flex flex-col md:flex-row">
                {/* Left Ad Space */}
                <div className="hidden md:block md:w-1/5 p-4">
                </div>

                {/* Main Content */}
                <div className="w-full md:w-3/5 p-6 space-y-6">
                    <div className="flex justify-end items-center gap-2 text-sm text-gray-600">
                        <Skeleton className="w-24 h-6 rounded-md" />
                    </div>

                    <div>
                        <Skeleton className="w-48 h-6 mb-6" />
                        <div className="space-y-4">
                            {[...Array(5)].map((_, index) => (
                                <div key={index} className="p-4 bg-white shadow-sm border border-gray-100 shadow-yellow-200 rounded-lg">
                                    <div className="flex items-start gap-4">
                                        <Skeleton className="w-10 h-10 rounded-full bg-yellow-50" />
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <Skeleton className="w-32 h-4" />
                                            <Skeleton className="w-full h-5" />
                                            <Skeleton className="w-20 h-4" />
                                        </div>
                                        <Skeleton className="w-10 h-5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Ad Space */}
                <div className="hidden md:block md:w-1/5 p-4">
                </div>
            </div>
        </div>
    );
}
