"use client"
import React from 'react'
import { SmartStudyHub } from './SmartStudyHub'
import SmartSubjectSession from './SmartSubjectSession'
import { QuickNavigation } from './QuickNavigation'
import { useHome } from '@/hooks/useHome'
import DashboardSkeleton from '../skeleton/dashboard.skeleton'

const DashboardPage = () => {
    const { dashboardBasic, currentStudies, session, isLoading, isError } = useHome({
        id: "0aad2b65-5334-4ab2-b6c8-1e37d97dc3f5",
    })


    if (isLoading) return <DashboardSkeleton/>
    if (isError) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-red-500">Error loading data</p>
            </div>
        )
    }
    return (
        <div className="flex flex-col space-y-6">
            <SmartStudyHub dashboardData={dashboardBasic?.data}
                currentStudies={currentStudies?.data} />
            {session?.data?.length > 0 ? (
                <SmartSubjectSession session={session.data} />
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-10">
                    <h2 className="text-lg font-semibold text-gray-700">
                        There is no practice session for today.
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Please check back tomorrow or explore other learning resources.
                    </p>
                    
                </div>
            )}
            <QuickNavigation />
        </div>
    )
}

export default DashboardPage