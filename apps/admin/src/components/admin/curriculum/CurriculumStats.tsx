import { Card, CardContent } from "@repo/common-ui";
import { BookText, BookOpen, Zap, Users } from "lucide-react";
import { CurriculumStats as StatsType } from "./types";

interface CurriculumStatsProps {
  stats: StatsType;
  isLoadingSubjects: boolean;
  isLoadingTopics: boolean;
  isLoadingExams: boolean;
}

export const CurriculumStats = ({ 
  stats, 
  isLoadingSubjects, 
  isLoadingTopics, 
  isLoadingExams 
}: CurriculumStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Subjects</p>
              <p className="text-2xl font-bold text-blue-600">
                {isLoadingSubjects ? "..." : stats.totalSubjects}
              </p>
            </div>
            <BookText className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Unique Subjects</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Topics</p>
              <p className="text-2xl font-bold text-green-600">
                {isLoadingTopics ? "..." : stats.totalTopics}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Across all subjects</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-l-4 border-l-orange-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Exams</p>
              <p className="text-2xl font-bold text-orange-600">
                {isLoadingExams ? "..." : stats.activeExams}
              </p>
            </div>
            <Zap className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Currently active</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-l-4 border-l-purple-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Subjects in Exams</p>
              <p className="text-2xl font-bold text-purple-600">
                {isLoadingExams ? "..." : stats.totalSubjectsInExams}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total associations</p>
        </CardContent>
      </Card>
    </div>
  );
};

