'use client'

import React, { useState } from 'react'
import RecommendedTest from './RecommendedTest'
import ScheduledTests from './ScheduledTests'
import AvailableTests from './AvailableTests'
import RecentTestResults from './RecentTestResults'
import { useTestDashboardData } from '@/hooks/useTestDashboardData'
import { useRouter } from 'next/navigation'
import TestDashboardSkeleton from '../skeleton/test.dashboard.skeleton'

const TestDashboard = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('FULL_LENGTH');

  const {
    available,
    recommended,
    results,
    schedule,
    isLoading,
    isError,
  } = useTestDashboardData({
    availableLimit: 5,
    availableType: activeFilter,
    resultsLimit: 5
  })

  const handleStartTest = (testId: string) => {
    router.push(`/test/${testId}/instructions`);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  if (isLoading) return <TestDashboardSkeleton/>
  if (isError) return <div> Error Happen.</div>;

  if (!available?.success || !recommended?.success || !results?.success || !schedule?.success) {
    return <div>Something Wrong </div>
  }

  return (
    <main className="flex-grow px-4 py-4 md:px-4 md:py-6 max-w-7xl mx-auto w-full">
      <div className="mb-6">
        {
          recommended?.data && (
            <RecommendedTest
              testId={recommended?.data?.testId}
              testName={recommended?.data?.title}
              examType={recommended?.data?.examType}
              totalQuestions={recommended?.data?.totalQuestions}
              totalMarks={recommended?.data?.totalMarks}
              stream={recommended?.data?.stream}
              duration={recommended?.data?.duration}
              difficulty={recommended?.data?.difficulty}
              onStartTest={handleStartTest}
            />
          )
        }

      </div>
      {
        schedule?.data ? (
          <ScheduledTests
            tests={schedule?.data}
            onStartTest={handleStartTest}
          />
        ) : (
          <div className="text-center text-gray-500">No scheduled tests available.</div>
        )
      }

      <AvailableTests
        tests={available?.data || []}
        onStartTest={handleStartTest}
        onFilterChange={handleFilterChange}
        activeFilter={activeFilter}
      />
      <RecentTestResults
        results={results?.data}
      />
    </main>
  )
}

export default TestDashboard


