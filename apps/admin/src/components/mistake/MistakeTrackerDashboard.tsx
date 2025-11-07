"use client"

import React from 'react'
import MistakeOverview from './MistakeOverview'
import MistakeDistrubution from './MistakeDistrubution'
import MistakeInsights from './MistakeInsights'
import { useMistakeDashboard } from '@/hooks/useMistakeDashboard'
import MistakePageBanner from './MistakePageBanner'
import MistakeTrackerDashboardSkeleton from '../skeleton/mistake.dashboard.skeleton'
import ErrorCTA from '../error'

const MistakeTrackerDashboard = () => {
    const { distribution, overview, insight, isLoading, isError } = useMistakeDashboard()

    if (isLoading) return <MistakeTrackerDashboardSkeleton/>
    if (isError) return <ErrorCTA message={ 'Something went wrong while loading your mistake data.'} />

    return (
        <div className="space-y-3">
            <MistakeOverview overview={overview?.data} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3" id="el-z33dzxua">
                <div className='col-span-2'>
                    <MistakeDistrubution dist={distribution?.data} />
                </div>
                <MistakeInsights insights={insight?.data?.insights} />
            </div>
            <MistakePageBanner />
        </div>
    )
}

export default MistakeTrackerDashboard