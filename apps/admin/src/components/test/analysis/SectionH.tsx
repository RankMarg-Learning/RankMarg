import { Card, CardContent, CardHeader, CardTitle } from '@repo/common-ui'
import { Badge } from '@repo/common-ui'
import { Progress } from '@repo/common-ui'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target,
  Award,
  Clock,
  Zap
} from 'lucide-react'
import React from 'react'

interface SectionHAnalysis {
  percentile: number | null;
  rank: number | null;
  comparisonWithAverage: {
    accuracy: number;
    averageAccuracy: number;
    performance: 'above' | 'below';
  };
  historicalComparison: any | null;
}

const SectionH = ({ analysis }: { analysis: SectionHAnalysis }) => {
  if (!analysis) return null

  const { comparisonWithAverage } = analysis
  
  const performanceDiff = comparisonWithAverage.accuracy - comparisonWithAverage.averageAccuracy
  const performancePercentage = Math.abs(performanceDiff)
  
  const getPerformanceColor = (performance: string) => {
    return performance === 'above' ? 'text-green-600' : 'text-red-600'
  }

  const getPerformanceIcon = (performance: string) => {
    return performance === 'above' ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />
  }

  return (
    <div className="space-y-6">
      {/* Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Your Performance vs Average */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Accuracy</span>
              <span className="font-semibold">{comparisonWithAverage.accuracy.toFixed(1)}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Accuracy</span>
              <span className="text-gray-600">{comparisonWithAverage.averageAccuracy.toFixed(1)}%</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Your Performance</span>
                <span className={getPerformanceColor(comparisonWithAverage.performance)}>
                  {performanceDiff > 0 ? '+' : ''}{performanceDiff.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={comparisonWithAverage.accuracy} 
                className="h-2"
              />
            </div>
            
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              comparisonWithAverage.performance === 'above' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {getPerformanceIcon(comparisonWithAverage.performance)}
              <span className={`text-sm font-medium ${
                comparisonWithAverage.performance === 'above' ? 'text-green-800' : 'text-red-800'
              }`}>
                {comparisonWithAverage.performance === 'above' 
                  ? `You're performing ${performancePercentage.toFixed(1)}% above average!`
                  : `You're ${performancePercentage.toFixed(1)}% below average. Keep practicing!`
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranking Information */}
      {(analysis.percentile || analysis.rank) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Ranking Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.percentile && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Percentile</span>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  {analysis.percentile}th
                </Badge>
              </div>
            )}
            
            {analysis.rank && (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Rank</span>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  #{analysis.rank}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Study Tips Based on Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {comparisonWithAverage.performance === 'above' ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Great Job! 🎉</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• You're performing above average - keep up the good work!</li>
                  <li>• Focus on maintaining consistency in your preparation</li>
                  <li>• Challenge yourself with more difficult questions</li>
                  <li>• Help others by sharing your study techniques</li>
                </ul>
              </div>
            ) : (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">Room for Improvement 📈</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Don't worry - everyone learns at their own pace</li>
                  <li>• Focus on understanding concepts rather than memorizing</li>
                  <li>• Practice more questions from your weak areas</li>
                  <li>• Consider joining study groups for peer learning</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historical Comparison Placeholder */}
      {analysis.historicalComparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Progress Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p>Historical comparison data will be available after taking more tests.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SectionH