"use client"
import React from 'react'
import { SmartStudyHub } from './SmartStudyHub'
import SmartSubjectSession from './SmartSubjectSession'
import { useHome } from '@/hooks/useHome'
import DashboardSkeleton from '../skeleton/dashboard.skeleton'
import Link from 'next/link'
import { Button } from '@repo/common-ui'
import { Alert, AlertDescription } from '@repo/common-ui'
import { AlertCircle } from 'lucide-react'
import { useUserData } from '@/context/ClientContextProvider'
import HeaderHome from './HeaderHome'
import HowItWorks from './HowItWorks'
import HighlightDialog from './HighlightDialog'

const DashboardPage = () => {
    const { dashboardBasic, currentStudies, session, isLoading, isError } = useHome()
    const { user } = useUserData()

    if (isLoading) return <DashboardSkeleton />
    if (isError) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-red-500">Error loading data</p>
            </div>
        )
    }
    return (
        <>
            <HighlightDialog />
            <div className="flex flex-col space-y-6">

                <div className="bg-gradient-to-r from-primary-50 to-primary-100">
                    {user?.isActive === false && (
                        <Alert variant="destructive" className="border-red-500/50 bg-red-50 dark:bg-red-900/20">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="flex items-center justify-between gap-4">
                                <span className="text-sm text-red-900 dark:text-red-200">
                                    Account inactive due to 14 days of inactivity. Activate now to continue.
                                </span>
                                <Link href="/settings">
                                    <Button variant="outline" size="sm">
                                        Activate Account
                                    </Button>
                                </Link>
                            </AlertDescription>
                        </Alert>
                    )}
                    <HeaderHome isLoading={isLoading} user={user} />
                    <SmartStudyHub dashboardData={dashboardBasic}
                        currentStudies={currentStudies} />
                </div>
                {session?.length > 0 ? (
                    <SmartSubjectSession session={session} />
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
                {/* <QuickNavigation /> */}
                <div className="px-3 sm:px-0">
                    <HowItWorks />
                </div>
            </div>
        </>
    )
}

export default DashboardPage