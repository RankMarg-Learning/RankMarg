"use client"
import {  CardContent, CardHeader } from "@repo/common-ui"
import { Skeleton } from "@repo/common-ui"

export default function SkeletonAnalysis() {
    return (
        <div className="flex flex-col lg:flex-row">
            {/* Left Sidebar */}
            <aside className="hidden lg:block w-1/12 p-4" />

            {/* Main Content */}
            <main className="flex-1 lg:w-2/3 md:p-4 p-2 space-y-6">
                {/* Section A Skeleton */}
                <Skeleton className="space-y-3 md:p-8 p-3 rounded-md">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-56" />
                            
                        </div>
                    </div>

                    {/* Score Overview Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="rounded-md">
                                <CardContent className="p-6">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-8 w-16" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </CardContent>
                            </Skeleton>
                        ))}
                    </div>

                    {/* Section Performance Skeleton */}
                    <Skeleton className="rounded-md space-y-3  h-60 w-full"/>
                        
                </Skeleton>

                {/* Section B Skeleton */}
                <Skeleton className="space-y-6 p-6 rounded-md">
                    <Skeleton className="h-6 w-48" />
                    <div className="grid gap-3 md:grid-cols-2">
                        <Skeleton className="rounded-md p-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4 mb-4">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 flex-1" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </Skeleton>
                        <Skeleton className="rounded-md p-4">
                            <Skeleton className="h-6 w-full mb-4" />
                            <Skeleton className="h-20 w-full" />
                        </Skeleton>
                    </div>
                </Skeleton>

                {/* Section C Skeleton */}
                <Skeleton className="rounded-md p-3">
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="space-y-2 p-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <Skeleton className="h-2 w-full" />
                                <Skeleton className="h-4 w-32" />
                            </Skeleton>
                        ))}
                    </CardContent>
                </Skeleton>

                {/* Section D Skeleton */}
                <Skeleton>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {['Easy', 'Medium', 'Hard'].map((level, i) => (
                            <div key={i} className="p-4 rounded-lg">
                                <div className="flex justify-between mb-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-2 w-full mt-2" />
                            </div>
                        ))}
                    </CardContent>
                </Skeleton>

                {/* Section E Skeleton */}
                <Skeleton className="rounded-md">
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-8" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Skeleton>
            </main>

            {/* Right Sidebar */}
            <aside className="hidden lg:block w-1/12 p-4" />
        </div>
    )
}
