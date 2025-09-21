'use client'

import React, { useState, useMemo } from 'react'
import { TrendingUp, Calendar, BookOpen, BarChart3 } from 'lucide-react'
import RecommendedTest from './RecommendedTest'
import ScheduledTests from './ScheduledTests'
import AvailableTests from './AvailableTests'
import RecentTestResults from './RecentTestResults'
import { useTestDashboardData } from '@/hooks/useTestDashboardData'
import { useRouter } from 'next/navigation'
import TestDashboardSkeleton from '../skeleton/test.dashboard.skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Error from '../error'
import BannerUpgrade from '../upgrade/bannerUpgrade'

interface DashboardStats {
  totalTests: number
  completedTests: number
  averageScore: number
  upcomingTests: number
}

const TestDashboard = () => {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('FULL_LENGTH')

  const {
    available,
    recommended,
    results,
    schedule,
    isLoading,
    isError,
  } = useTestDashboardData({
    availableLimit: 6,
    availableType: activeFilter,
    resultsLimit: 5
  })

  const dashboardStats: DashboardStats = useMemo(() => {
    const totalTests = available?.data?.length || 0
    const completedTests = results?.data?.length || 0
    const upcomingTests = schedule?.data?.length || 0

    const averageScore = results?.data?.length > 0
      ? results.data.reduce((sum: number, result: any) => sum + (result.score / result.test.totalMarks * 100), 0) / results.data.length
      : 0

    return {
      totalTests,
      completedTests,
      averageScore: Math.round(averageScore),
      upcomingTests
    }
  }, [available, results, schedule])

  const handleStartTest = (testId: string) => {
    router.push(`/test/${testId}/instructions`)
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
  }



  // Enhanced loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TestDashboardSkeleton />
      </div>
    )
  }

  // Enhanced error state
  if (isError) <Error message={'Something went wrong while loading your test dashboard.'} />

  // Data validation
  const hasValidData = available?.success && recommended?.success && results?.success && schedule?.success

  if (!hasValidData) <Error message={'Something went wrong while loading your test dashboard.'} />

  return (
    <div className="min-h-screen ">
      <main className="max-w-7xl mx-auto   space-y-8">
        {/* Dashboard Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Test Dashboard</h1>
              <p className="text-gray-600 mt-1 text-sm">Track your progress and discover new tests</p>
            </div>
            <div className="md:flex items-center gap-2 hidden">
              <Badge variant="outline" className="text-xs ">
                <TrendingUp className="h-3 w-3 mr-1" />
                {dashboardStats.averageScore}% Avg Score
              </Badge>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gray-50  border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{dashboardStats.totalTests}</p>
                    <p className="text-sm text-gray-600">Available Tests</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{dashboardStats.completedTests}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{dashboardStats.averageScore}%</p>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{dashboardStats.upcomingTests}</p>
                    <p className="text-sm text-gray-600">Scheduled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommended Test Section */}
        {recommended?.data && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 bg-primary-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
            </div>
            <RecommendedTest
              testId={recommended.data.testId}
              testName={recommended.data.title}
              examType={recommended.data.examType}
              totalQuestions={recommended.data.totalQuestions}
              totalMarks={recommended.data.totalMarks}
              examCode={recommended.data.examCode}
              duration={recommended.data.duration}
              difficulty={recommended.data.difficulty}
              onStartTest={handleStartTest}
            />
          </section>
        )}

        {/* Scheduled Tests Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 bg-orange-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tests</h2>
          </div>
          {schedule?.data && schedule.data.length > 0 ? (
            <ScheduledTests
              tests={schedule.data}
              onStartTest={handleStartTest}
            />
          ) : (
            <Card className="bg-gray-50 border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base font-medium text-gray-900 mb-2">No Scheduled Tests</h3>
                <p className="text-gray-600 text-sm">You don't have any upcoming tests scheduled. Check out available tests below!</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Available Tests Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900">Available Tests (Limit: {available?.data?.userTestCount}/{available?.data?.monthlyLimit})</h2>
          </div>

          {available?.data && available.data.isLimitExceeded && (
              <BannerUpgrade title="Unlock Unlimited Tests" description="Upgrade to Premium to access all tests" reference ="test_dashboard" />
            )}

          <AvailableTests
            tests={available?.data?.tests || []}
            isLimitExceeded={available?.data?.isLimitExceeded}
            onStartTest={handleStartTest}
            onFilterChange={handleFilterChange}
            activeFilter={activeFilter}
          />
        </section>

        {/* Recent Results Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 bg-green-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Performance</h2>
          </div>
          <RecentTestResults results={results?.data} />
        </section>
      </main>
    </div>
  )
}

export default TestDashboard


