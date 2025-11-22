import { Card, CardContent, CardHeader, CardTitle } from '@repo/common-ui'
import { Progress } from '@repo/common-ui'
import { Badge } from '@repo/common-ui'
import { 
  TrendingUp, 
  AlertTriangle, 
  Target,
  Award,
  Clock
} from 'lucide-react'
import React from 'react'

interface SectionDAnalysis {
  difficultyWiseAnalysis: {
    easy: { total: number; correct: number; incorrect: number; unattempted: number; avgTime: number };
    medium: { total: number; correct: number; incorrect: number; unattempted: number; avgTime: number };
    hard: { total: number; correct: number; incorrect: number; unattempted: number; avgTime: number };
    very_hard: { total: number; correct: number; incorrect: number; unattempted: number; avgTime: number };
  };
  totalQuestions: number;
  difficultyInsights: Array<{
    difficulty: string;
    accuracy: number;
    insight: string;
  }>;
}

const SectionD = ({ analysis }: { analysis: SectionDAnalysis }) => {
  if (!analysis) return null

  const { difficultyWiseAnalysis, totalQuestions, difficultyInsights } = analysis

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
        return <Award className="w-4 h-4 text-green-600" />
      case 'medium':
        return <Target className="w-4 h-4 text-yellow-600" />
      case 'hard':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case 'very_hard':
        return <TrendingUp className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(0)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Difficulty Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Difficulty-wise Performance */}
        <div className="space-y-4">
          <h4 className="font-semibold">Performance by Difficulty Level</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(difficultyWiseAnalysis).map(([difficulty, data]) => {
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
                    <div className="text-xs text-gray-600">
                      Avg Time: {formatTime(data.avgTime)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Difficulty Insights */}
        {difficultyInsights && difficultyInsights.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Difficulty Insights</h4>
            <div className="space-y-2">
              {difficultyInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-blue-800 capitalize">{insight.difficulty}</span>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      {insight.accuracy.toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700">{insight.insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Questions:</span>
              <div className="font-semibold">{totalQuestions}</div>
            </div>
            <div>
              <span className="text-gray-600">Easy Questions:</span>
              <div className="font-semibold">{difficultyWiseAnalysis.easy.total}</div>
            </div>
            <div>
              <span className="text-gray-600">Medium Questions:</span>
              <div className="font-semibold">{difficultyWiseAnalysis.medium.total}</div>
            </div>
            <div>
              <span className="text-gray-600">Hard Questions:</span>
              <div className="font-semibold">{difficultyWiseAnalysis.hard.total + difficultyWiseAnalysis.very_hard.total}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SectionD;
