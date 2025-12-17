"use client"
import React, { useState } from 'react'
import { Card } from '@repo/common-ui'
import { Badge } from '@repo/common-ui'
import { Button } from '@repo/common-ui'
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Target,
  BarChart3
} from 'lucide-react'
import { useRevisionDashboard } from '@/hooks/useRevisionDashboard'
import RevisionDashboardSkeleton from '../skeleton/revision.dashboard.skeleton'
import PageUpgrade from '../upgrade/pageUpgrade'
import ErrorCTA from '../error'
import { toast } from '@/hooks/use-toast'
import { formatDistanceToNow, format } from 'date-fns'

const RevisionDashboard = () => {
  const [filter, setFilter] = useState<string>('all')
  const { 
    revisionSchedule, 
    revisionStatistics, 
    isLoading, 
    isError, 
    isSubscriptionError,
    markAsReviewed,
    isMarkingReviewed
  } = useRevisionDashboard(filter)

  if (isLoading) return <RevisionDashboardSkeleton />
  if (isSubscriptionError) return <PageUpgrade message="Upgrade required to access AI Revision Schedule." reference="revision_dashboard_upgrade" />
  if (isError) return <ErrorCTA message="Something went wrong while loading your revision schedule." />

  const stats = revisionStatistics?.data
  const items = revisionSchedule?.data?.items || []

  const handleMarkAsReviewed = (topicId: string, topicName: string) => {
    markAsReviewed(topicId, {
      onSuccess: () => {
        toast({
          title: "Topic marked as reviewed!",
          description: `${topicName} has been marked as reviewed.`,
          variant: "default",
        })
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to mark topic as reviewed. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  const getStatusBadge = (item: any) => {
    if (item.isOverdue) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Overdue ({item.daysOverdue}d)
        </Badge>
      )
    } else if (item.daysUntilReview <= 0) {
      return (
        <Badge variant="default" className="bg-orange-500 text-white flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Due Today
        </Badge>
      )
    } else if (item.daysUntilReview <= 3) {
      return (
        <Badge variant="outline" className="border-orange-300 text-orange-700 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Due Soon ({item.daysUntilReview}d)
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {item.daysUntilReview}d
        </Badge>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Scheduled</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalScheduled || 0}</p>
            </div>
            <Target className="h-8 w-8 text-primary-500" />
          </div>
        </Card>

        <Card className="p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Due Today</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats?.dueToday || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats?.overdue || 0}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed This Week</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats?.completedThisWeek || 0}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({stats?.totalScheduled || 0})
        </Button>
        <Button
          variant={filter === 'due' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('due')}
          className={filter === 'due' ? 'bg-orange-500 hover:bg-orange-600' : ''}
        >
          Due Today ({stats?.dueToday || 0})
        </Button>
        <Button
          variant={filter === 'overdue' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('overdue')}
          className={filter === 'overdue' ? 'bg-red-500 hover:bg-red-600' : ''}
        >
          Overdue ({stats?.overdue || 0})
        </Button>
        <Button
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('upcoming')}
        >
          Upcoming ({stats?.upcoming || 0})
        </Button>
      </div>

      {/* Revision Schedule List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Revision Schedule
        </h2>

        {items.length === 0 ? (
          <Card className="p-8 text-center border border-gray-200">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No revisions scheduled</h3>
            <p className="text-sm text-gray-500">
              {filter === 'all' 
                ? "You don't have any topics scheduled for revision yet. Keep practicing to build your revision schedule!"
                : `No topics found for "${filter}" filter.`}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {items.map((item: any) => (
              <Card key={item.id} className="p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.topicName}
                        </h3>
                        <p className="text-sm text-gray-600">{item.subjectName}</p>
                      </div>
                      {getStatusBadge(item)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-primary-500" />
                        <span className="text-gray-600">Mastery:</span>
                        <span className="font-semibold">{item.masteryLevel}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-600">Retention:</span>
                        <span className="font-semibold">{Math.round(item.retentionStrength * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600">Reviews:</span>
                        <span className="font-semibold">{item.completedReviews}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Next Review:</span>
                        <span className="font-semibold text-xs">
                          {formatDistanceToNow(new Date(item.nextReviewAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {item.lastReviewedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Last reviewed: {format(new Date(item.lastReviewedAt), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsReviewed(item.topicId, item.topicName)}
                      disabled={isMarkingReviewed}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Reviewed
                    </Button>
                    {item.topicSlug && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => window.location.href = `/ai-questions/${item.subjectId}/${item.topicSlug}`}
                      >
                        Practice
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Subject Breakdown */}
      {stats?.subjects && stats.subjects.length > 0 && (
        <Card className="p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Revision by Subject
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.subjects.map((subject: any) => (
              <div key={subject.subjectId} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">{subject.subjectName}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {subject.dueCount} due of {subject.totalCount} total
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${(subject.dueCount / subject.totalCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default RevisionDashboard
