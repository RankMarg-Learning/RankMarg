"use client"
import { PerformanceOverview } from '@/components/analytics/PerformanceOverview'
import { TestPerformance } from '@/components/analytics/TestPerformance'
import React from 'react'
import DifficultySection from './DifficultySection'
import TimeDistribution from './TimeDistribution'
import StatsSection from './StatsSection'
import { useAnalyticsDashboard } from '@/hooks/useAnalyticsDashboard'
import AnalyticsDashboardSkeleton from '../skeleton/analytics.dashboard.skeleton'
import Calender from '../profile/Calender'

const AnalyticsDashboard = () => {
    const { analytics, attempts, isLoading, isError } = useAnalyticsDashboard({ id: '0aad2b65-5334-4ab2-b6c8-1e37d97dc3f5' })
    if (isLoading) return (<AnalyticsDashboardSkeleton />)
    if (isError) return <div>Error loading data</div>


    return (
        <div>
            <PerformanceOverview metrics={analytics?.data?.overview?.metrics} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8" id="el-z33dzxua">
                <div className="col-span-2 ">
                    <TestPerformance txScore={analytics?.data?.overview?.performance?.recentTestScores} recommendation={analytics?.data?.overview?.performance?.recommendation} />
                    <Calender attempts={attempts?.data} />
                    {/* <SubjectPerformance /> */}
                </div>
                <div className="col-span-1">
                    <StatsSection lowest={analytics?.data?.overview?.performance?.lowestScore} highest={analytics?.data?.overview?.performance?.highestScore} />
                    <DifficultySection diff={analytics?.data?.difficulty} />
                    <TimeDistribution time={analytics?.data?.timing} />
                </div>
            </div>

        </div>
    )
}

export default AnalyticsDashboard


//  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//                         <div className="lg:col-span-1 border border-gray-100 rounded-lg">
//                             <AttemptDistributionChart />
//                         </div>
//                         <div className="lg:col-span-2 border border-gray-100 rounded-md">
//                             <TestPerformance txScore={analytics?.data?.overview?.performance?.recentTestScores} recommendation={analytics?.data?.overview?.performance?.recommendation} />
//                         </div>
//                     </div>


{/* <div className="border-t border-gray-200 pt-4" id="el-y5zijbiw">
                        <h5 className="text-sm font-medium text-gray-700 mb-2" id="el-utilfz8x">Top Recommendations</h5>
                        <ul className="space-y-2" id="el-b8etmbj2">
                            <li className="text-sm text-gray-600 flex items-start" id="el-1rcdpkw8">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" id="el-toqrq4lm">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" id="el-vuc1h7ji"></path>
                                </svg>
                                Focus on Organic Chemistry reactions - accuracy dropped by 40%
                            </li>
                            <li className="text-sm text-gray-600 flex items-start" id="el-b6x3gh9q">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" id="el-efmkpngz">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" id="el-yxroa2k1"></path>
                                </svg>
                                Schedule morning study sessions for Mathematics - 23% better performance
                            </li>
                            <li className="text-sm text-gray-600 flex items-start" id="el-9ikiptnv">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" id="el-7uicv1fh">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" id="el-bi4xl2if"></path>
                                </svg>
                                Complete missed Calculus reviews to prevent further retention drop
                            </li>
                        </ul>
                    </div> */}