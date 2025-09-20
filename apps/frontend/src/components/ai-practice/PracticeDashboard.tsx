"use client"
import React, { useState } from 'react'
import TodaySession from './TodaySession'
import PracticePageBanner from './PracticePageBanner'
import PracticeSummary from './PracticeSummary'
import PracticeTestimonials from './PracticeTestimonials'
import RecentPracticeResults from './RecentPracticeResults'
import { useAiPractice } from '@/hooks/useAiPractice'
import PracticeDashboardSkeleton from '../skeleton/practice.dashboard.skeleton'
import { toast } from '@/hooks/use-toast'
import Error from '../error'

const PracticeDashboard = () => {
    const [visible, setVisible] = useState(true);
    const { overview, results, sessions,suggestions, isLoading, isError } = useAiPractice()
    if (isLoading) return <PracticeDashboardSkeleton />
    if (isError) return <Error message={ 'Something went wrong while loading your practice results.'} />

    const handleClick = () => {
        setVisible(false);
        toast({
            title: "Thanks for your feedback! We're working on that.",
            variant: "default",
            duration: 3000,
            className: "bg-gray-100 text-gray-800",
          })
      };
    

    return (
        <div>
            <div className="mb-8 md:space-y-6 space-y-3">
                <div className="flex items-center justify-between mb-4" id="el-qg6wxqjk">
                    <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                        Today's AI-Powered Practice Sessions
                    </h2>
                    <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 truncate rounded-full" id="el-cymrcexi">AI-Recommended</span>
                </div>
                {sessions?.data?.length > 0 ? (<TodaySession sessions={sessions?.data} />) : (
                    <div className="flex flex-col items-center justify-center text-center py-10">
                        <h2 className="text-lg font-semibold text-gray-700">
                            There is no practice session for today.
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Please check back tomorrow or explore other learning resources.
                        </p>

                    </div>
                )}
                <div className="mt-4 text-center" id="el-bprvgobi">
                {visible && (
        <button
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          id="el-zmxx98tb"
          onClick={handleClick}
        >
          Not happy with the AI selection? Adjust practice topics!
        </button>
      )}
                </div>
                <PracticeSummary overview={overview?.data} suggestions={suggestions?.data} />
                <PracticePageBanner />
                <RecentPracticeResults results={results?.data} />
                <PracticeTestimonials />

            </div>
        </div>
    )
}

export default PracticeDashboard