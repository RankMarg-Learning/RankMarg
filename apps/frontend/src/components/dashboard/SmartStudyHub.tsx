"use client"
import { BrainCircuit, Flame, ListTodo, RotateCcw, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";
import CurrentTopicCard from "./CurrentTopicCard";
import { SmartStudyHubProps } from "@/types/dashboard.types";
import { useMemo } from "react";
import { timeFormator } from "@/utils/timeFormatter";

const TodaysProgressCard = ({ 
  percentComplete = 0, 
  minutesStudied = 0, 
  goalMinutes = 0 
}) => (
  <Card className="border border-primary-100">
    <CardContent className="p-4 space-y-2">
      <h3 className="font-medium text-sm text-primary-800">Today's Progress</h3>
      <Progress 
        value={percentComplete} 
        className="h-2" 
        indicatorColor="bg-primary-400" 
      />
      <div className="flex items-center justify-between text-sm">
        <span>{timeFormator(minutesStudied,{from:'sec',to:['min','sec']})} </span>
        <span className="text-muted-foreground">Goal: {timeFormator(goalMinutes,{from:'sec',to:['min','sec']})}</span>
      </div>
    </CardContent>
  </Card>
);

const RevisionSubtopicsCard = ({ subtopics = [] }) => (
  <Card className="border border-purple-100">
    <CardContent className="p-4 space-y-2">
      <h3 className="font-medium text-sm text-purple-800 flex items-center gap-1">
        <ListTodo className="h-4 w-4" />
        Today’s Key Concepts
      </h3>
      <div className="flex flex-wrap gap-1">
        {subtopics.length > 0 ? (
          subtopics.map((name, i) => (
            <Badge key={`subtopic-${i}`} variant="outline" className="bg-purple-50">
              {name}
            </Badge>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-3 w-full">
            <h2 className="text-sm font-medium text-gray-700">
              No subtopics to revise today.
            </h2>
            <p className="mt-2 text-xs text-gray-500">
              No practice session found, so no revision topics available.
            </p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const SmartRecommendation = ({ recommendation, isMobile }) => (
  <div className="relative bg-gradient-to-r from-primary-100 to-primary-200 md:col-span-2 p-4 md:p-6 flex flex-col justify-center rounded-lg overflow-hidden">
    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-10 flex items-center justify-center">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-primary-900">Coming Soon</h3>
        <p className="text-sm text-muted-foreground">Smart Recommendation will be available soon</p>
      </div>
    </div>
    <div className="pointer-events-none opacity-50">
      <div className="text-center md:text-left">
        <h3 className="font-medium text-primary-900 mb-2">Smart Recommendation</h3>
        <div className="bg-white rounded-lg p-3 shadow-sm border border-primary-200 mb-3">
          <Badge className="bg-primary-100 text-primary-800 border-none mb-2">
            {getRecommendationType(recommendation.type)}
          </Badge>
          <p className="font-medium mb-1">
            {recommendation.subject}: {recommendation.topic}
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            Reason: {recommendation.reason}
          </p>
          <p className="text-xs flex items-center justify-center md:justify-start gap-1">
            <RotateCcw className="h-3 w-3" />
            <span>Recommended time: {recommendation.timeRecommended} min</span>
          </p>
        </div>
        <Button
          size={isMobile ? "sm" : "default"}
          className="w-full bg-primary-500 hover:bg-primary-600"
        >
          Start Smart Session
        </Button>
      </div>
    </div>
  </div>
);

const getRecommendationType = (type) => {
  const types = {
    focus: "Focus Session",
    review: "Review Needed",
    practice: "Practice Session"
  };
  return types[type] || "Study Session";
};

export function SmartStudyHub({ dashboardData, currentStudies }: SmartStudyHubProps) {
  const isMobile = useIsMobile();

  const userStats = useMemo(() => ({
    streak: dashboardData?.userStats?.streak ?? 0,
    level: dashboardData?.userStats?.level ?? 1
  }), [dashboardData?.userStats]);

  const todaysProgress = useMemo(() => ({
    percentComplete: dashboardData?.todaysProgress?.percentComplete ?? 0,
    minutesStudied: dashboardData?.todaysProgress?.minutesStudied ?? 0,
    goalMinutes: dashboardData?.todaysProgress?.goalMinutes ?? 0
  }), [dashboardData?.todaysProgress]);

  const revisionSubtopics = useMemo(() => 
    dashboardData?.revisionSubtopics ?? [], 
    [dashboardData?.revisionSubtopics]
  );

  const studyRecommendation = useMemo(() => ({
    type: "focus",
    subject: "Physics",
    topic: "Kinematics",
    reason: "Test in 3 days",
    timeRecommended: 30
  }), []);

  return (
    <Card className="border-0 bg-gradient-to-r from-primary-50 to-primary-100 shadow-md animate-fade-in overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {/* Main section */}
          <div className="p-4 md:p-6 md:col-span-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-primary-900 flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-primary-600" />
                  Smart Study Hub
                </h2>
                <p className="text-sm text-muted-foreground">
                  Personalized learning path based on your performance
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className="bg-amber-100 text-amber-700 gap-1 flex items-center px-2 py-1 border-amber-200"
                >
                  <Flame className="h-3 w-3" />
                  <span className="font-medium">{userStats.streak} day streak</span>
                </Badge>

                <Badge 
                  variant="outline" 
                  className="bg-primary-100 text-primary-700 gap-1 flex items-center px-2 py-1 border-primary-200"
                >
                  <Target className="h-3 w-3" />
                  <span className="font-medium">Level {userStats.level}</span>
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TodaysProgressCard 
                percentComplete={todaysProgress.percentComplete}
                minutesStudied={todaysProgress.minutesStudied}
                goalMinutes={todaysProgress.goalMinutes}
              />
              <RevisionSubtopicsCard subtopics={revisionSubtopics} />
              <CurrentTopicCard currentStudies={currentStudies} />
            </div>
          </div>
          <SmartRecommendation 
            recommendation={studyRecommendation}
            isMobile={isMobile}
          />
        </div>
      </CardContent>
    </Card>
  );
}