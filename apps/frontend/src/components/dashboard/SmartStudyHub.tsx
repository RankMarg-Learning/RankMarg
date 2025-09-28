"use client"
import { BrainCircuit, Flame, ListTodo, Target, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CurrentTopicCard from "./CurrentTopicCard";
import { SmartStudyHubProps, SubjectGroup } from "@/types/dashboard.types";
import { useMemo, useState } from "react";
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

const RevisionSubtopicsCard = ({ revisionData, onViewAll }) => {
  const subtopics = revisionData?.display || [];
  const groupedData = revisionData?.grouped || [];
  
  return (
    <Card className="border border-purple-100 cursor-pointer hover:shadow-md transition-shadow" onClick={onViewAll}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-purple-800 flex items-center gap-1">
            <ListTodo className="h-4 w-4" />
            Today's Top Concepts
          </h3>
          {groupedData.length > 0 && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-purple-600 hover:text-purple-700">
              View All
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {subtopics.length > 0 ? (
            subtopics.map((name, i) => (
              <Badge key={`subtopic-${i}`} variant="outline" className="bg-purple-50 truncate block">
                {name}
              </Badge>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-3 w-full">
              <h2 className="text-sm font-medium text-gray-700">
                No subtopics to study today.
              </h2>
              <p className="mt-2 text-xs text-gray-500">
                No practice session found, so no study topics available.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const RevisionSubtopicsDialog = ({ isOpen, onClose, groupedData }) => {
  const [activeSubject, setActiveSubject] = useState(null);

  const toggleSubject = (subjectId) => {
    setActiveSubject(activeSubject === subjectId ? null : subjectId);
  };

  // Reorganize data: Group by subject first, then topic, then subtopic
  const reorganizedData = useMemo((): SubjectGroup[] => {
    if (!groupedData || groupedData.length === 0) return [];
    
    // Create a map to group by subject first
    const subjectGroups = new Map<string, {
      subjectId: string;
      subjectName: string;
      totalCount: number;
      topics: Map<string, {
        topicId: string;
        topicName: string;
        count: number;
        subtopics: Map<string, {
          subtopicId: string;
          subtopicName: string;
          count: number;
        }>;
      }>;
    }>();
    
    groupedData.forEach(subject => {
      if (!subjectGroups.has(subject.subjectId)) {
        subjectGroups.set(subject.subjectId, {
          subjectId: subject.subjectId,
          subjectName: subject.subjectName,
          totalCount: 0,
          topics: new Map()
        });
      }
      
      const subjectGroup = subjectGroups.get(subject.subjectId)!;
      
      subject.subtopics.forEach(subtopic => {
        // Group by topic within this subject
        const topicKey = subtopic.topicId;
        if (!subjectGroup.topics.has(topicKey)) {
          subjectGroup.topics.set(topicKey, {
            topicId: subtopic.topicId,
            topicName: subtopic.topicName,
            count: 0,
            subtopics: new Map()
          });
        }
        
        const topicGroup = subjectGroup.topics.get(topicKey)!;
        topicGroup.count += subtopic.count;
        subjectGroup.totalCount += subtopic.count;
        
        // Group by subtopic within this topic
        if (!topicGroup.subtopics.has(subtopic.id)) {
          topicGroup.subtopics.set(subtopic.id, {
            subtopicId: subtopic.id,
            subtopicName: subtopic.name,
            count: subtopic.count
          });
        }
      });
    });
    
    // Convert to array and sort by total count
    return Array.from(subjectGroups.values())
      .map(subjectGroup => ({
        subjectId: subjectGroup.subjectId,
        subjectName: subjectGroup.subjectName,
        totalCount: subjectGroup.totalCount,
        topics: Array.from(subjectGroup.topics.values())
          .map(topicGroup => ({
            topicId: topicGroup.topicId,
            topicName: topicGroup.topicName,
            count: topicGroup.count,
            subtopics: Array.from(topicGroup.subtopics.values())
              .sort((a, b) => b.count - a.count)
          }))
          .sort((a, b) => b.count - a.count)
      }))
      .sort((a, b) => b.totalCount - a.totalCount);
  }, [groupedData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <BookOpen className="h-4 w-4" />
            Study Topics
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {reorganizedData.length > 0 ? (
            reorganizedData.map((subjectGroup) => {
              const isActive = activeSubject === subjectGroup.subjectId;
              return (
                <div key={`subject-${subjectGroup.subjectId}`} className="space-y-1">
                  {/* Subject Card - Collapsible */}
                  <Card className={`border transition-all duration-300 ${
                    isActive 
                      ? 'border-purple-300 shadow-lg shadow-purple-100' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}>
                    <CardContent className="p-0">
                      <div 
                        className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                          isActive ? 'bg-purple-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => toggleSubject(subjectGroup.subjectId)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-sm font-semibold transition-colors truncate ${
                              isActive ? 'text-purple-900' : 'text-gray-900'
                            }`} title={subjectGroup.subjectName}>
                              {subjectGroup.subjectName}
                            </h3>
                            <p className="text-xs text-gray-600">
                              {subjectGroup.topics.length} topics • {subjectGroup.totalCount} questions
                            </p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 transition-transform duration-300 ${
                          isActive ? 'rotate-180' : ''
                        }`}>
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Collapsible Content */}
                      {isActive && (
                        <div className="border-t border-purple-100 bg-gradient-to-br from-purple-50 to-white">
                          <div className="p-3 space-y-2">
                            {subjectGroup.topics.map((topicGroup) => (
                              <div key={`topic-${topicGroup.topicId}`} className="space-y-1">
                                {/* Topic */}
                                <div className="bg-white rounded-lg border border-blue-100 p-3 shadow-sm">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="text-xs font-semibold text-gray-800 flex-1 min-w-0">
                                      <span className="truncate block" title={topicGroup.topicName}>
                                        {topicGroup.topicName}
                                      </span>
                                    </h4>
                                    <Badge className="bg-blue-100 text-blue-800 text-xs flex-shrink-0">
                                      {topicGroup.subtopics.length} subtopics
                                    </Badge>
                                  </div>
                                  
                                  {/* Subtopics as Badges */}
                                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                                    {topicGroup.subtopics.map((subtopicGroup) => (
                                      <Badge 
                                        key={`subtopic-${subtopicGroup.subtopicId}`}
                                        variant="outline" 
                                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300 cursor-pointer transition-all duration-200 text-xs font-medium px-2 py-0.5 max-w-full truncate"
                                        title={subtopicGroup.subtopicName}
                                      >
                                        <span className="truncate block">
                                          {subtopicGroup.subtopicName}
                                        </span>
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No study topics available
              </h3>
              <p className="text-sm text-gray-500">
                Complete practice sessions to see your study topics.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};


export function SmartStudyHub({ dashboardData, currentStudies }: SmartStudyHubProps) {
  const [revisionSubtopicsDialogOpen, setRevisionSubtopicsDialogOpen] = useState(false);

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
    dashboardData?.revisionSubtopics ?? { display: [], grouped: [] }, 
    [dashboardData?.revisionSubtopics]
  );

  const groupedRevisionData = useMemo(() => {
    return revisionSubtopics?.grouped || [];
  }, [revisionSubtopics]);


  return (
    <Card className="border-0 bg-gradient-to-r from-primary-50 to-primary-100 shadow-md animate-fade-in overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 gap-2">
          {/* Main section */}
          <div className="p-4 md:p-6 space-y-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <TodaysProgressCard 
                percentComplete={todaysProgress.percentComplete}
                minutesStudied={todaysProgress.minutesStudied}
                goalMinutes={todaysProgress.goalMinutes}
              />
              <RevisionSubtopicsCard 
                revisionData={dashboardData?.revisionSubtopics} 
                onViewAll={() => setRevisionSubtopicsDialogOpen(true)}
              />
              <CurrentTopicCard currentStudies={currentStudies} />
            </div>
          </div>
        </div>
      </CardContent>
      <RevisionSubtopicsDialog 
        isOpen={revisionSubtopicsDialogOpen} 
        onClose={() => setRevisionSubtopicsDialogOpen(false)} 
        groupedData={groupedRevisionData} 
      />
    </Card>
  );
}