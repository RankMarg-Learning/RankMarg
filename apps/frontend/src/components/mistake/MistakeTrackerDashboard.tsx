"use client"

import React from 'react'
import MistakeOverview from './MistakeOverview'
import MistakeDistrubution from './MistakeDistrubution'
import MistakeInsights from './MistakeInsights'
import { useMistakeDashboard } from '@/hooks/useMistakeDashboard'
import MistakePageBanner from './MistakePageBanner'

const MistakeTrackerDashboard = () => {
    const { distribution, overview ,isLoading, isError} = useMistakeDashboard({ id: '0aad2b65-5334-4ab2-b6c8-1e37d97dc3f5' })

    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>Error loading data</div>
    return (
        <div>
            <div className="mb-8 md:space-y-6 space-y-3">
                <MistakeOverview overview={overview?.data} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8" id="el-z33dzxua">
                    <div className='col-span-2'>
                        <MistakeDistrubution dist={distribution?.data} />
                    </div>
                        <MistakeInsights />
                </div>
                        {/* <MistakeRecent/> */}
                        <MistakePageBanner/>

            </div>
        </div>
    )
}

export default MistakeTrackerDashboard