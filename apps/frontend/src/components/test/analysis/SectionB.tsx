import { Card, CardContent, CardHeader, CardTitle } from '@repo/common-ui'
import { Progress } from '@repo/common-ui'
import { Badge } from '@repo/common-ui'
import {
  TrendingUp,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  AlertTriangle
} from 'lucide-react'
import React from 'react'

interface SectionBAnalysis {
  statistics: {
    totalQuestions: number;
    correct: number;
    incorrect: number;
    unattempted: number;
    percentage: string;
    performanceLevel: string;
  };
  difficultyAnalysis: {
    easy: { total: number; correct: number; incorrect: number; unattempted: number };
    medium: { total: number; correct: number; incorrect: number; unattempted: number };
    hard: { total: number; correct: number; incorrect: number; unattempted: number };
    very_hard: { total: number; correct: number; incorrect: number; unattempted: number };
  };
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

const SectionB = ({ analysis }: { analysis: SectionBAnalysis }) => {
  if (!analysis) return null

  const { statistics, difficultyAnalysis, feedback, strengths, weaknesses } = analysis

  const getPerformanceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'very good':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'good':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'average':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'needs improvement':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'hard':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'very_hard':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'medium':
        return <Target className="w-4 h-4 text-yellow-600" />
      case 'hard':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case 'very_hard':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <Card className='border-none'>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="w-5 h-5" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-2xl">
            <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{statistics.correct}</div>
            <div className="text-sm text-green-700">Correct</div>
          </div>

          <div className="text-center p-4 bg-red-50 border border-red-200 rounded-2xl">
            <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{statistics.incorrect}</div>
            <div className="text-sm text-red-700">Incorrect</div>
          </div>

          <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-2xl">
            <Clock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-600">{statistics.unattempted}</div>
            <div className="text-sm text-gray-700">Unattempted</div>
          </div>

          <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <Award className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{statistics.percentage}%</div>
            <div className="text-sm text-blue-700">Percentage</div>
          </div>
        </div>

        {/* Performance Level */}
        <div className={`p-4 border rounded-lg ${getPerformanceColor(statistics.performanceLevel)}`}>
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4" />
            <h4 className="font-semibold">Performance Level: {statistics.performanceLevel}</h4>
          </div>
          <p className="text-sm">{feedback}</p>
        </div>

        {/* Difficulty-wise Analysis */}
        <div className="space-y-4 hidden">
          <h4 className="font-semibold">Difficulty-wise Performance</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(difficultyAnalysis).map(([difficulty, data]) => {
              const accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0
              return (
                <div key={difficulty} className={`p-4 border rounded-lg ${getDifficultyColor(difficulty)}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {getDifficultyIcon(difficulty)}
                    <h5 className="font-semibold capitalize">{difficulty.replace('_', ' ')}</h5>
                  </div>

                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{accuracy.toFixed(1)}%</div>
                    <div className="text-sm">
                      {data.correct}/{data.total} correct
                    </div>
                    <Progress value={accuracy} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span>Correct: {data.correct}</span>
                      <span>Total: {data.total}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Strengths and Weaknesses */}
        <div className=" grid-cols-1 md:grid-cols-2 gap-4 hidden">
          {strengths.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Strengths
              </h4>
              <div className="space-y-1">
                {strengths.map((strength, index) => (
                  <Badge key={index} variant="outline" className="text-green-600 border-green-200 mr-2">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {weaknesses.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg hidden">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Areas for Improvement
              </h4>
              <div className="space-y-1">
                {weaknesses.map((weakness, index) => (
                  <Badge key={index} variant="outline" className="text-red-600 border-red-200 mr-2">
                    {weakness}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SectionB