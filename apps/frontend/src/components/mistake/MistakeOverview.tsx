import React from 'react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { MistakeAnalyticsOverview, MistakeBySubject } from '@/types/mistake.type'
import { TextFormator } from '@/utils/textFormator'

const typePhrases = {
  CONCEPTUAL: "Conceptual Errors",
  CALCULATION: "Calculation Mistakes",
  READING: "Reading Issues",
  OVERCONFIDENCE: "Overconfident Attempts",
  OTHER: "Miscellaneous Errors"
};

const MistakeOverview = ({ overview }: { overview: MistakeAnalyticsOverview }) => {

  const { cnt,
    trend,
    mistakesBySubject,
    mostMistakeType } = overview;

  const isImproving = trend?.improving || false;
  const arrowIcon = isImproving ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  const textColorClass = isImproving ? 'text-primary-800' : 'text-red-600';

  return (
    <Card className="border border-gray-100 shadow-sm mb-6 overflow-hidden">
      <div className="border-0 bg-gradient-to-r from-primary-50 to-primary-100 shadow-md animate-fade-in overflow-hidden md:p-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Section: Summary */}
          <div className="md:col-span-1">
            <div className="text-sm text-primary-900 uppercase tracking-wider opacity-80">Weekly Mistakes</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary-900">{cnt?.current}</span>
              {
                trend?.improving ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-900">
                    {TextFormator(trend?.status)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-500/10 text-red-900">
                    {TextFormator(trend?.status)}
                  </Badge>
                )
              }
            </div>
            <div className="mt-4">
              <Progress
                value={cnt?.reducePct || 0}
                max={100}
                
                className="h-2 bg-gray-300/30 border border-primary-100"
                indicatorColor="bg-primary-400"
              />
            </div>
            <div className={`md:mt-4 mt-2 text-sm flex items-center gap-2 ${textColorClass}`}>
              {arrowIcon}
              <span>
                {isImproving
                  ? `+${cnt?.reducePct || 0}% better than last week`
                  : `${cnt?.reducePct || 0}% worse than last week`}
              </span>
            </div>


          </div>

          {/* Right Section: Breakdown */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Mistake Level */}
              <Card className="border border-primary-100 p-4">
                <div className="text-sm opacity-80 text-primary-800">Mistake Level</div>
                <div className="mt-2 text-xl font-semibold flex items-center gap-2">
                  <span>{TextFormator(trend?.status)}</span>
                </div>
                <div className="mt-2 text-sm opacity-80 text-gray-800">
                  {trend?.recommendation || "Keep up the good work!"}
                </div>
              </Card>

              {/* Mistake Type */}
              <Card className="border border-primary-100 p-4">
                <div className="text-sm opacity-80 text-primary-800">Most Mistake Type</div>
                <div className="mt-2 text-xl font-semibold flex items-center gap-2">
                  {TextFormator(mostMistakeType?.type)}
                </div>
                <div className="mt-2 text-gray-800 text-sm opacity-80">
                  {`${mostMistakeType?.count || 0} ${typePhrases[mostMistakeType?.type] || "Mistakes"}`}
                </div>
              </Card>

              {/* Top Mistake Topic */}
              <Card className="border border-primary-100 p-4">
                <div className="text-sm opacity-80 text-primary-800">Top Mistake Subject</div>
                <div className="mt-2 text-xl font-semibold">{getTopMistakeSubject(mistakesBySubject)?.subject}</div>
                <div className="mt-2 text-gray-800 text-sm opacity-80">
                  {getTopMistakeSubjectStatement(mistakesBySubject)}
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


function getTopMistakeSubjectStatement(data: MistakeBySubject[]): string {
  if (!data || data.length === 0) return "No data available";

  const top = data.reduce((max, curr) => curr.current > max.current ? curr : max, data[0]);

  return `${top.current} mistakes in ${top.subject}`;
}

function getTopMistakeSubject(data: MistakeBySubject[]): MistakeBySubject | null {
  if (!data || data.length === 0) return null;

  return data.reduce((max, item) => item.current > max.current ? item : max, data[0]);
}