"use client"
import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"

function ProfileSkeleton() {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-1">
                    {/* Profile Card */}
                    <div className="bg-white rounded-lg  overflow-hidden border border-neutral-200/30">
                        <Skeleton className="p-5">
                            <div className="flex flex-col items-center">
                                {/* Avatar */}
                                <Skeleton className="w-32 h-32 rounded-full mb-4" />
                                {/* Name */}
                                <Skeleton className="h-6 w-40 mb-2" />
                                {/* Username */}
                                <Skeleton className="h-4 w-32 mb-4" />
                                {/* Tags */}
                                <div className="flex items-center mb-4 gap-2">
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                    <Skeleton className="h-6 w-28 rounded-full" />
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <Skeleton className="h-20 rounded-lg" />
                                    <Skeleton className="h-20 rounded-lg" />
                                </div>
                            </div>
                        </Skeleton>

                        <Skeleton className="border-t border-neutral-200/20 p-5">
                            <Skeleton className="h-5 w-40 mb-3" />
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <Skeleton className="h-5 w-5 mr-3 rounded-full" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                                <div className="flex items-center">
                                    <Skeleton className="h-5 w-5 mr-3 rounded-full" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                                <div className="flex items-center">
                                    <Skeleton className="h-5 w-5 mr-3 rounded-full" />
                                    <Skeleton className="h-4 w-56" />
                                </div>
                            </div>

                            <div className="mt-6">
                                <Skeleton className="h-10 w-full rounded-md" />
                            </div>
                        </Skeleton>
                    </div>

                    {/* Study Streak Card */}
                    <Skeleton className="bg-white rounded-lg  overflow-hidden border border-neutral-200/30 mt-6">
                        <div className="px-5 py-4">
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-10 w-20" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>

                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {[...Array(7)].map((_, index) => (
                                    <Skeleton key={index} className="h-10 rounded-md" />
                                ))}
                            </div>

                            <div className="text-center">
                                <Skeleton className="h-4 w-48 mx-auto" />
                            </div>
                        </div>
                    </Skeleton>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2">
                    {/* Academic Performance Card */}
                    <Skeleton className="bg-white rounded-lg  overflow-hidden border border-neutral-200/30 mb-6">
                        <div className="px-5 py-4 border-b border-neutral-200/20">
                            <Skeleton className="h-6 w-48" />
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                    <Skeleton className="h-2.5 w-full rounded-full" />
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                    <Skeleton className="h-2.5 w-full rounded-full" />
                                </div>
                            </div>

                            <Skeleton className="mt-6">
                                <Skeleton className="h-5 w-48 mb-3" />
                                <div className="space-y-4">
                                    {[...Array(4)].map((_, index) => (
                                        <div key={index}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-4 w-4 rounded" />
                                                    <Skeleton className="h-4 w-24" />
                                                </div>
                                                <Skeleton className="h-4 w-12" />
                                            </div>
                                            <Skeleton className="h-2.5 w-full rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            </Skeleton>
                        </div>
                    </Skeleton>

                    {/* Current Study Progress Card */}
                    <Skeleton className="bg-white rounded-lg  overflow-hidden border border-neutral-200/30">
                        <div className="px-5 py-4 border-b border-neutral-200/20">
                            <Skeleton className="h-6 w-48" />
                        </div>
                        <div className="p-5 space-y-5">
                            {/* Current Study */}
                            <div className="space-y-6">
                                {[...Array(2)].map((_, index) => (
                                    <Skeleton key={index} className="mb-6">
                                        <div className="flex items-center mb-3">
                                            <Skeleton className="h-10 w-10 rounded-full mr-3" />
                                            <div>
                                                <Skeleton className="h-5 w-32 mb-1" />
                                                <Skeleton className="h-4 w-48" />
                                            </div>
                                        </div>
                                        <div className="ml-13 pl-5 border-l-2 border-dashed border-blue-200">
                                            <Skeleton className="h-4 w-32 mb-1" />
                                        </div>
                                    </Skeleton>
                                ))}
                            </div>

                            {/* Recent Activity */}
                            <Skeleton className="h-5 w-32 mb-3" />
                            <div className="space-y-4">
                                {[...Array(3)].map((_, index) => (
                                    <Skeleton className="flex" key={index}>
                                        <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
                                        <div className="ml-4">
                                            <Skeleton className="h-4 w-32 mb-1" />
                                            <Skeleton className="h-3 w-24 mb-1" />
                                            <Skeleton className="h-4 w-48 mt-1" />
                                        </div>
                                    </Skeleton>
                                ))}
                            </div>

                            <div className="mt-6 text-center">
                                <Skeleton className="h-4 w-40 mx-auto" />
                            </div>
                        </div>
                    </Skeleton>
                </div>
            </div>
        </div>
    )
}

export default ProfileSkeleton