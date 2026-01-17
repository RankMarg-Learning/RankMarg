import { Card, CardContent, CardHeader, CardTitle } from '@repo/common-ui'
import { Badge } from '@repo/common-ui'
import { Button } from '@repo/common-ui'
import {
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Eye,
  Target
} from 'lucide-react'
import React, { useState } from 'react'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/common-ui'

interface SectionFAnalysis {
  questionAnalysis: Array<{
    questionNumber: number;
    slug: string;
    title: string;
    subject: string;
    topic: string;
    subTopic: string;
    difficulty: number;
    status: 'correct' | 'incorrect' | 'unattempted';
    timeTaken: number;
    isCorrect: boolean;
    needsReview: boolean;
  }>;
  correctQuestions: any[];
  incorrectQuestions: any[];
  unattemptedQuestions: any[];
  reviewRecommendations: Array<{
    questionNumber: number;
    subject: string;
    topic: string;
    reason: string;
  }>;
}

const SectionF = ({ analysis }: { analysis: SectionFAnalysis }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all')
  const [filterSubject, setFilterSubject] = useState<string>('all')

  if (!analysis) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'incorrect':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'unattempted':
        return <Clock className="w-4 h-4 text-gray-400" />
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct':
        return 'bg-green-100 text-green-800'
      case 'incorrect':
        return 'bg-red-100 text-red-800'
      case 'unattempted':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'bg-green-100 text-green-800'
      case 2: return 'bg-yellow-100 text-yellow-800'
      case 3: return 'bg-orange-100 text-orange-800'
      case 4: return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Easy'
      case 2: return 'Medium'
      case 3: return 'Hard'
      case 4: return 'Very Hard'
      default: return 'Unknown'
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const subjects = Array.from(new Set(analysis.questionAnalysis.map((q: any) => q.subject)))

  const filteredQuestions = analysis.questionAnalysis.filter(question => {
    const statusMatch = activeTab === 'all' ||
      (activeTab === 'correct' && question.status === 'correct') ||
      (activeTab === 'incorrect' && question.status === 'incorrect') ||
      (activeTab === 'unattempted' && question.status === 'unattempted')

    const subjectMatch = filterSubject === 'all' || question.subject === filterSubject

    return statusMatch && subjectMatch
  })

  const stats = {
    total: analysis.questionAnalysis.length,
    correct: analysis.correctQuestions.length,
    incorrect: analysis.incorrectQuestions.length,
    unattempted: analysis.unattemptedQuestions.length,
    accuracy: analysis.questionAnalysis.length > 0
      ? (analysis.correctQuestions.length / analysis.questionAnalysis.length) * 100
      : 0
  }

  return (
    <Card className="w-full border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookOpen className="w-5 h-5" />
          Question-wise Analysis
        </CardTitle>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Correct: {stats.correct}</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <span>Incorrect: {stats.incorrect}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>Unattempted: {stats.unattempted}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Accuracy: {stats.accuracy.toFixed(1)}%</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All Questions' },
              { key: 'correct', label: 'Correct' },
              { key: 'incorrect', label: 'Incorrect' },
              { key: 'unattempted', label: 'Unattempted' }
            ].map(tab => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.key as any)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            {
              subjects.length > 1 && (
                <Select
                  value={filterSubject}
                  onValueChange={(value) => setFilterSubject(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            }

          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredQuestions.map((question, index) => (
            <div
              key={question.questionNumber}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(question.status)}
                  <span className="font-medium">Q{question.questionNumber}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {question.subject}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {question.topic}
                    </Badge>
                    <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                      {getDifficultyText(question.difficulty)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 truncate max-w-md">
                    {question.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(question.timeTaken)}</span>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(question.status)}`}>
                    {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                  </Badge>
                </div>

                {question.needsReview && (
                  <Link href={`/question/${question.slug}?solution=true`}>
                    <Button size="sm" variant="outline" className="text-orange-600 border-orange-200">
                      <Eye className="w-3 h-3 mr-1" />
                      Review
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Review Recommendations */}
        {analysis.reviewRecommendations.length > 0 && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Questions to Review
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {analysis.reviewRecommendations.slice(0, 6).map((rec, index) => (
                <div key={index} className="text-sm p-2 bg-white rounded border">
                  <span className="font-medium">Q{rec.questionNumber}</span> - {rec.subject} ({rec.topic})
                  <div className="text-xs text-gray-600">{rec.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SectionF
