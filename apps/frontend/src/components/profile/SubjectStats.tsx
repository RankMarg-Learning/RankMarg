"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";


type SubjectStats = {
  AttemptCount: number;
  TotalQuestion: number;
};
interface SubjectProps {
  subjectStats: Record<string, SubjectStats>
  
}

const SubjectStats = ({
  subjectStats
}: SubjectProps) => {
  return (
    <Card className="border-yellow-500/20">
        <CardHeader>
          <CardTitle>Subject Progress</CardTitle>
        </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(subjectStats).map(([name, subject]) => (
                      <div key={name} className="space-y-2">
                        <div className="flex justify-between">
                          <p className="font-medium">{name}</p>
                          <p className="text-sm text-muted-foreground">{subject.AttemptCount} / {subject.TotalQuestion} Questions</p>
                        </div>
                        <Progress value={(subject.AttemptCount / subject.TotalQuestion) * 100} className="h-2"  />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
  );
};

export default SubjectStats;