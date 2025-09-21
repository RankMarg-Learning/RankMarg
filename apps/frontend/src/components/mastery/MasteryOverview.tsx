import React from 'react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { MasteryOverviewProps } from '@/types/mastery.types'

const MasteryOverview = ({ overview }: { overview: MasteryOverviewProps }) => {
  console.log(overview)
  return (
    <Card className="border border-gray-100 shadow-sm mb-6 overflow-hidden ">
      <div className="border-0 bg-gradient-to-r from-primary-50 to-primary-100 shadow-md animate-fade-in overflow-hidden md:p-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 ">
            <div className="text-sm text-primary-900 uppercase tracking-wider opacity-80">Overall Mastery</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary-900">{overview?.overallMastery}%</span>
              <Badge variant='outline' className='bg-primary-500/10 text-primary-900 hidden'>
                {overview?.improvement}
              </Badge>
            </div>
            <div className="mt-4">
              <Progress
                value={overview?.overallMastery}
                className="h-2 bg-gray-300/30 border border-primary-100"
                indicatorColor="bg-primary-400"
              />
            </div>
            <div className="md:mt-4 mt-2 text-sm flex items-center gap-2 text-primary-800">
              {(() => {
                const improvement = overview?.improvement;

                if (improvement > 0) {
                  return (
                    <div className="flex items-center text-green-600">
                      <ArrowUp className="h-4 w-4" />
                      <span>+{improvement} since last month</span>
                    </div>
                  );
                } else if (improvement < 0) {
                  return (
                    <div className="flex items-center text-red-600">
                      <ArrowDown className="h-4 w-4" />
                      <span>{improvement} since last month</span>
                    </div>
                  );
                } else {
                  return (
                    <div className="flex items-center text-gray-500">
                      <Minus className="h-4 w-4" />
                      <span>No change since last month</span>
                    </div>
                  );
                }
              })()}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Card className=" border border-primary-100 p-4 ">
                <div className="text-sm opacity-80 text-primary-800">Mastery Level</div>
                <div className="mt-2 text-lg font-semibold flex items-center gap-2 ">
                  <span>{overview?.overallMastery}</span>
                  {/* <span>{getMasteryEmoji(totalMastery)}</span> */}
                </div>
                <div className="mt-2 text-sm opacity-80 text-gray-800">
                  {(() => {
                    const mastery = overview?.overallMastery ?? 0;

                    let label = "";

                    if (mastery >= 80) {
                      label = "Top 5% of students";
                    } else if (mastery >= 50) {
                      const topPercent = Math.ceil((100 - mastery) / 2);
                      label = `Top ${topPercent}% of students`;
                    } else {
                      label = "Keep improving to enter the top ranks!";
                    }

                    return <span>{label}</span>;
                  })()}
                </div>
              </Card>

              <Card className=" border border-primary-100 p-4">
                <div className="text-sm opacity-80 text-primary-800 truncate">Concepts Mastered</div>
                <div className="mt-2 text-lg font-semibold">{overview?.conceptsMastered?.mastered} of {overview?.conceptsMastered?.total}</div>
                <div className="mt-2 text-gray-800 text-sm opacity-80">
                  Topics across all subjects
                </div>
              </Card>

              <Card className="border border-primary-100 p-4">
                <div className="text-sm opacity-80 text-primary-800">Study Streak</div>
                <div className="mt-2 text-lg font-semibold">{overview?.studyStreak?.days} days</div>
                <div className="mt-2 text-sm opacity-80 text-gray-800">
                  {overview?.studyStreak?.message}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default MasteryOverview