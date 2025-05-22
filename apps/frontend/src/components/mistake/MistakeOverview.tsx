import React from 'react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { ArrowUp } from 'lucide-react'

const MistakeOverview = () => {
  return (
    <Card className="border border-gray-100 shadow-sm mb-6 overflow-hidden">
      <div className="border-0 bg-gradient-to-r from-primary-50 to-primary-100 shadow-md animate-fade-in overflow-hidden md:p-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Section: Summary */}
          <div className="md:col-span-1">
            <div className="text-sm text-primary-900 uppercase tracking-wider opacity-80">Weekly Mistakes</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary-900">125</span>
              <Badge variant="outline" className="bg-primary-500/10 text-primary-900">
                Improving
              </Badge>
            </div>

            <div className="mt-4">
              <Progress
                value={78}
                className="h-2 bg-gray-300/30 border border-primary-100"
                indicatorColor="bg-primary-400"
              />
            </div>

            <div className="md:mt-4 mt-2 text-sm flex items-center gap-2 text-primary-800">
              <ArrowUp className="h-4 w-4" />
              <span>+15% better than last week</span>
            </div>

           
          </div>

          {/* Right Section: Breakdown */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Mistake Level */}
              <Card className="border border-primary-100 p-4">
                <div className="text-sm opacity-80 text-primary-800">Mistake Level</div>
                <div className="mt-2 text-xl font-semibold flex items-center gap-2">
                  <span>Improving</span>
                </div>
                <div className="mt-2 text-sm opacity-80 text-gray-800">
                  Better than 78% of students
                </div>
              </Card>

              {/* Mistake Type */}
              <Card className="border border-primary-100 p-4">
                <div className="text-sm opacity-80 text-primary-800">Most Mistake Type</div>
                <div className="mt-2 text-xl font-semibold flex items-center gap-2">
                  Conceptual
                </div>
                <div className="mt-2 text-gray-800 text-sm opacity-80">
                  45% of mistakes
                </div>
              </Card>

              {/* Top Mistake Topic */}
              <Card className="border border-primary-100 p-4">
                <div className="text-sm opacity-80 text-primary-800">Top Mistake Topic</div>
                <div className="mt-2 text-xl font-semibold">Current Electricity</div>
                <div className="mt-2 text-gray-800 text-sm opacity-80">
                  Appeared in 6 mistakes this week
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default MistakeOverview
