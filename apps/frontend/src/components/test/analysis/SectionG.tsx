import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Lightbulb, 
  Target, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Award
} from 'lucide-react'
import React from 'react'

interface SectionGAnalysis {
  recommendations: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionItems: string[];
  }>;
  studyPlan: {
    daily: string;
    weekly: string;
    monthly: string;
  };
  nextSteps: string[];
}

const SectionG = ({ analysis }: { analysis: SectionGAnalysis }) => {
  if (!analysis) return null

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'medium':
        return <Target className="w-4 h-4 text-yellow-600" />
      case 'low':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      default:
        return <Target className="w-4 h-4 text-gray-600" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fundamentals':
        return <BookOpen className="w-4 h-4 text-blue-600" />
      case 'practice':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'advanced':
        return <Award className="w-4 h-4 text-purple-600" />
      default:
        return <Lightbulb className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Improvement Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Improvement Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(rec.priority)}
                  {getTypeIcon(rec.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{rec.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {rec.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm mb-3">{rec.description}</p>
                  <div className="space-y-1">
                    <h5 className="text-sm font-medium">Action Items:</h5>
                    <ul className="text-sm space-y-1">
                      {rec.actionItems.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Study Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recommended Study Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">Daily</h4>
                <p className="text-sm text-blue-700">{analysis.studyPlan.daily}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Calendar className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800">Weekly</h4>
                <p className="text-sm text-green-700">{analysis.studyPlan.weekly}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-purple-800">Monthly</h4>
                <p className="text-sm text-purple-700">{analysis.studyPlan.monthly}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.nextSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm">{step}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button className="w-full" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Join Study Group
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SectionG
