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
import { useHomeConfig } from '@/hooks/useHomeConfig'
import HomeCarousel from './HomeCarousel'
import HomePoll from './HomePoll'
import HomeInputForm from './HomeInputForm'
import ImportantBlogs from './ImportantBlogs'


function isTargetMatch(target: string[], examCode?: string): boolean {
    if (!target || target.length === 0) return true;
    if (!examCode) return false;
    return target.map((t) => t.toUpperCase()).includes(examCode.toUpperCase());
}

function isNotExpired(end: string): boolean {
    if (!end) return true;
    return new Date() < new Date(end);
}
function matchesItem(target: string[], end: string, examCode?: string): boolean {
    return isTargetMatch(target, examCode) && isNotExpired(end);
}

const DashboardPage = () => {
    const { dashboardBasic, currentStudies, session, isLoading: isHomeLoading, isError: isHomeError } = useHome()
    const { user } = useUserData()
    const { config, isLoading: isConfigLoading, isError: isConfigError } = useHomeConfig();

    const isLoading = isHomeLoading || isConfigLoading;
    const isError = isHomeError || isConfigError;

    if (isLoading) return <DashboardSkeleton />
    if (isError) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-red-500">Error loading data</p>
            </div>
        )
    }

    const { carousel, poll, input, important_blogs } = config?.section || {};
    const examCode = user?.examCode ?? undefined;

    const carouselItems = (carousel?.items ?? [])
        .filter((item) => matchesItem(item.target, item.end, examCode))
        .sort((a, b) => a.priority - b.priority);

    const pollItem = (poll?.items ?? []).find((item) =>
        matchesItem(item.target, item.end, examCode)
    );

    const inputItem = (input?.items ?? []).find((item) =>
        matchesItem(item.target, item.end, examCode)
    );

    const blogItems = (important_blogs?.items ?? [])
        .filter((item) => matchesItem(item.target, item.end ?? "", examCode))
        .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
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
                <div className="px-3 space-y-2" >
                    {carousel?.enabled && carouselItems.length > 0 && (
                        <HomeCarousel items={carouselItems} autoplay={carousel.autoplay} />
                    )}
                    {poll?.enabled && pollItem && (
                        <HomePoll poll={pollItem} submitApi={poll.api} />
                    )}
                    {input?.enabled && inputItem && (
                        <HomeInputForm
                            inputItem={inputItem}
                            submitApi={input.api || undefined}
                        />
                    )}
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

                <div className="px-3 space-y-4 ">
                    <HowItWorks />
                    {important_blogs?.enabled && blogItems.length > 0 && (
                        <ImportantBlogs title={important_blogs.title} blogs={blogItems} />
                    )}
                </div>
            </div >
        </>
    )
}

export default DashboardPage