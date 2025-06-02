"use client"

import React from 'react'
import MistakeOverview from './MistakeOverview'
import MistakeDistrubution from './MistakeDistrubution'
import MistakeInsights from './MistakeInsights'
import { useMistakeDashboard } from '@/hooks/useMistakeDashboard'
import MistakePageBanner from './MistakePageBanner'
import MistakeTrackerDashboardSkeleton from '../skeleton/mistake.dashboard.skeleton'

const MistakeTrackerDashboard = () => {
    const { distribution, overview, insight, isLoading, isError } = useMistakeDashboard()


    if (isLoading) return <MistakeTrackerDashboardSkeleton/>
    if (isError) return <div>Error loading data</div>
    return (
        <div>
            <div className="mb-8 md:space-y-6 space-y-3">
                <MistakeOverview overview={overview?.data} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8" id="el-z33dzxua">
                    <div className='col-span-2'>
                        <MistakeDistrubution dist={distribution?.data} />
                    </div>
                    <MistakeInsights insights={insight?.data} />
                </div>
                <MistakePageBanner />

            </div>
        </div>
    )
}

export default MistakeTrackerDashboard