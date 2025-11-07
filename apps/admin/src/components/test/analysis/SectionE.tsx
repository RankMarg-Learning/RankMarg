import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  BookOpen, 
  Target,
  Award,
  Users
} from 'lucide-react'
import React from 'react'

interface SectionEAnalysis {
  subjectWiseAnalysis: Record<string, {
    total: number;
    correct: number;
    incorrect: number;
    unattempted: number;
    totalTime: number;
    avgTime: number;
    accuracy: number;
  }>;
  strongestSubject: string | null;
  weakestSubject: string | null;
  subjectRecommendations: Array<{
    subject: string;
    priority: string;
    recommendation: string;
  }>;
}

const SectionE = ({ analysis }: { analysis: SectionEAnalysis }) => {
  if (!analysis) return null

  const { subjectWiseAnalysis, strongestSubject, weakestSubject, subjectRecommendations } = analysis

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600'
    if (accuracy >= 60) return 'text-yellow-600'
    if (accuracy >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getAccuracyBgColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-50 border-green-200'
    if (accuracy >= 60) return 'bg-yellow-50 border-yellow-200'
    if (accuracy >= 40) return 'bg-orange-50 border-orange-200'
    return 'bg-red-50 border-red-200'
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(0)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`
  }

  const subjects = Object.keys(subjectWiseAnalysis)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Subject-wise Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subject Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => {
            const data = subjectWiseAnalysis[subject]
            return (
              <div
                key={subject}
                className={`p-4 border rounded-lg ${getAccuracyBgColor(data.accuracy)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{subject}</h4>
                  <Badge variant="outline" className={getAccuracyColor(data.accuracy)}>
                    {data.accuracy.toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Correct: {data.correct}</span>
                    <span>Total: {data.total}</span>
                  </div>
                  <Progress value={data.accuracy} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Avg Time: {formatTime(data.avgTime)}</span>
                    <span>Total: {formatTime(data.totalTime)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Strongest and Weakest Subjects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strongestSubject && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-green-600" />
                <h4 className="font-semibold text-green-800">Strongest Subject</h4>
              </div>
              <p className="text-green-700">{strongestSubject}</p>
              <p className="text-sm text-green-600 mt-1">
                Accuracy: {subjectWiseAnalysis[strongestSubject]?.accuracy.toFixed(1)}%
              </p>
            </div>
          )}

          {weakestSubject && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-red-600" />
                <h4 className="font-semibold text-red-800">Needs Improvement</h4>
              </div>
              <p className="text-red-700">{weakestSubject}</p>
              <p className="text-sm text-red-600 mt-1">
                Accuracy: {subjectWiseAnalysis[weakestSubject]?.accuracy.toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        {/* Subject Recommendations */}
        {subjectRecommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Subject Recommendations
            </h4>
            <div className="space-y-2">
              {subjectRecommendations.map((rec, index) => (
                <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-orange-800">{rec.subject}</span>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      {rec.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-orange-700">{rec.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Study Tips */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Study Tips
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Focus more time on subjects with lower accuracy</li>
            <li>• Practice time management for each subject</li>
            <li>• Review concepts from your weakest subjects</li>
            <li>• Maintain consistency across all subjects</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default SectionE