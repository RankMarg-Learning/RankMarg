import { ArrowUp, CheckIcon, ChevronRight, CircleX, Info, InfoIcon, LucideIcon, TriangleAlert, BookOpen } from 'lucide-react';
import React from 'react'
import { Card } from '@repo/common-ui';
import { Progress } from '@repo/common-ui';
import Link from 'next/link';
import { Button } from '@repo/common-ui';
import { SubjectBackgroundColor, SubjectCardColor } from '@/constant/SubjectColorCode';
import { SubjectMasteryProps } from '@/types/mastery.types';
import { RecommendationIcon } from '@/types/recommendation.types';
import MarkdownRenderer from '@/lib/MarkdownRenderer';

export const getMasteryLevelInfo = (mastery: number): { level: string; color: string } => {
  if (mastery >= 85) {
    return { level: "Excellent", color: "text-green-600" };
  } else if (mastery >= 70) {
    return { level: "Good", color: "text-blue-600" };
  } else if (mastery >= 50) {
    return { level: "Average", color: "text-yellow-600" };
  } else {
    return { level: "Needs Improvement", color: "text-red-600" };
  }
};

function getMasteryColor(masteryLevel: number): string {
  if (masteryLevel >= 90) {
    return "text-green-700";
  } else if (masteryLevel >= 75) {
    return "text-green-500";
  } else if (masteryLevel >= 60) {
    return "text-lime-500";
  } else if (masteryLevel >= 45) {
    return "text-yellow-500";
  } else if (masteryLevel >= 30) {
    return "text-orange-500";
  } else {
    return "text-red-600";
  }
}

const SubjectMasteryCard = ({ sbt }: { sbt: SubjectMasteryProps }) => {
  const recommendationIconMap = {
    info: InfoIcon,
    warning: TriangleAlert,
    check: CheckIcon,
    close: CircleX,
  } satisfies Record<RecommendationIcon, LucideIcon>;

  const hasNoMastery = !sbt?.masteryPercentage || sbt?.masteryPercentage === 0;

  if (hasNoMastery) {
    return (
      <div className="flex flex-col">

        {/* Content Card */}
        <Card className={` p-4 sm:p-6 bg-gradient-to-r ${SubjectCardColor[sbt.name.toLowerCase() as keyof typeof SubjectCardColor] || SubjectCardColor.default} border animate-fade-in overflow-hidden`}>
          <div className="space-y-4 sm:space-y-6">
            {/* Main Info Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-0">{sbt?.name}</h2>
            <span className="text-lg sm:text-xl font-bold self-start sm:self-auto">{sbt?.masteryPercentage}%</span>
          </div>
            <div className="text-center py-3 sm:py-4">
              <p className="text-sm text-gray-600 font-medium">
                🎯 Ready to unlock your {sbt?.name} mastery potential?
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Start today and see your first insights this weekend!
              </p>
            </div>
            <Link href="/ai-practice" className="block">
              <Button className="w-full bg-gradient-to-tr from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold py-3 sm:py-4 rounded-md shadow-lg hover:shadow-xl transition-all duration-200 transform  text-sm sm:text-base">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Begin Practice
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Card className={`bg-gradient-to-r ${SubjectCardColor[sbt.name.toLowerCase() as keyof typeof SubjectCardColor] || SubjectCardColor.default} border animate-fade-in overflow-hidden`}>
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-0">{sbt?.name}</h2>
            <span className="text-lg sm:text-xl font-bold self-start sm:self-auto">{sbt?.masteryPercentage}%</span>
          </div>

          <Progress
            value={sbt?.masteryPercentage}
            className="h-2 bg-white/30 mb-3"
            indicatorColor={` ${SubjectBackgroundColor[sbt?.name.toLowerCase() as keyof typeof SubjectBackgroundColor] || SubjectBackgroundColor.default}`}
          />

          <div className="justify-between text-xs mt-1 hidden">
            <div className="flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>+{sbt?.improvementFromLastMonth}% from last month</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="font-medium text-gray-800 mb-3">Improvement Areas</h3>
        <div className="space-y-2 mb-6">
          {sbt?.improvementAreas?.map((topic) => (
            <div key={topic.name} className="flex justify-between text-sm">
              <span className="text-gray-700">{topic.name}</span>
              <span className={`font-medium ${getMasteryColor(topic.masteryLevel)}`}>{topic.masteryLevel}%</span>
            </div>
          ))}
        </div>
        
        <h3 className="font-medium text-gray-800 mb-3">Top Performing Topics</h3>
        <div className="space-y-2 mb-6">
          {sbt?.topPerformingTopics?.map((topic) => (
            <div key={topic.name} className="flex justify-between text-sm">
              <span className="text-gray-700">{topic.name}</span>
              <span className="font-medium text-green-600">{topic.masteryLevel}%</span>
            </div>
          ))}
        </div>

        <div className="mb-6 border-t pt-3 border-gray-200 hidden">
          <h3 className="font-medium text-gray-800 flex items-center gap-1 mb-3">
            <Info className="h-4 w-4 text-blue-500" />
            <span>Smart Recommendations</span>
          </h3>
          {sbt?.recommendations?.map((rx) => {
            const Icon = recommendationIconMap[rx.icon as RecommendationIcon] ?? InfoIcon;
            const iconColorClass = `text-${rx.color}-500`;

            return (
              <div key={`rec-${rx.type}`} className="bg-gray-50 rounded-md p-2 mb-2 text-sm">
                <div className="flex gap-2">
                  <div>
                    <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconColorClass}`} />
                  </div>
                  <p className="text-gray-700">
                    <MarkdownRenderer content={rx.message} className="text-sm" />
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Link
          href={`/mastery/${sbt?.id}?subject=${sbt?.name}`}
          className="block"
        >
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-1 text-primary-600 border-primary-200 hover:bg-primary-50"
          >
            <span>View detailed breakdown</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SubjectMasteryCard;