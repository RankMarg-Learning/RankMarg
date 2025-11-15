import React from 'react'
import { Card } from '@repo/common-ui'
import { Badge } from '@repo/common-ui'
import { Progress } from '@repo/common-ui'
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
    <Card className="border border-gray-100 shadow-sm overflow-hidden">
      <div className="border-0 bg-gradient-to-r from-primary-50 to-primary-100 shadow-md animate-fade-in overflow-hidden p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Main Stats Section */}
          <div className="lg:col-span-1">
            <div className="text-xs text-primary-900 uppercase tracking-wider opacity-80 mb-1">Weekly Mistakes</div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-primary-900">{cnt?.current}</span>
              {
                trend?.improving ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-900 text-xs">
                    {TextFormator(trend?.status)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-500/10 text-red-900 text-xs">
                    {TextFormator(trend?.status)}
                  </Badge>
                )
              }
            </div>
            <div className="mb-2">
              <Progress
                value={cnt?.reducePct || 0}
                max={100}
                className="h-1.5 bg-gray-300/30 border border-primary-100"
                indicatorColor="bg-primary-400"
              />
            </div>
            <div className={`text-xs flex items-center gap-1 ${textColorClass}`}>
              {arrowIcon}
              <span>
                {isImproving
                  ? `+${cnt?.reducePct || 0}% better`
                  : `${cnt?.reducePct || 0}% worse`}
              </span>
            </div>
          </div>

          {/* Compact Stats Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Mistake Level */}
              <Card className="border border-primary-100 p-3">
                <div className="text-xs opacity-80 text-primary-800 mb-1">Mistake Level</div>
                <div className="text-lg font-semibold text-primary-900 mb-1">
                  {TextFormator(trend?.status)}
                </div>
                <div className="text-xs opacity-80 text-gray-800 leading-tight">
                  {trend?.recommendation || "Keep up the good work!"}
                </div>
              </Card>

              {/* Mistake Type */}
              <Card className="border border-primary-100 p-3">
                <div className="text-xs opacity-80 text-primary-800 mb-1">Most Mistake Type</div>
                <div className="text-lg font-semibold text-primary-900 mb-1">
                  {TextFormator(mostMistakeType?.type)}
                </div>
                <div className="text-xs opacity-80 text-gray-800">
                  {`${mostMistakeType?.count || 0} ${typePhrases[mostMistakeType?.type] || "Mistakes"}`}
                </div>
              </Card>

              {/* Top Mistake Topic */}
              <Card className="border border-primary-100 p-3">
                <div className="text-xs opacity-80 text-primary-800 mb-1">Top Mistake Subject</div>
                <div className="text-lg font-semibold text-primary-900 mb-1">{getTopMistakeSubject(mistakesBySubject)?.subject}</div>
                <div className="text-xs opacity-80 text-gray-800">
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