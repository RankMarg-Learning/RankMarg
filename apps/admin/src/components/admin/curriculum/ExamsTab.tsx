import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/common-ui";
import { Button } from "@repo/common-ui";
import { Plus, Calendar } from "lucide-react";
import { Exam } from "@/types/typeAdmin";
import { ExamCard } from "./ExamCard";
import { UseMutationResult } from "@tanstack/react-query";

interface ExamsTabProps {
  exams: Exam[];
  isLoading: boolean;
  onAddExam: () => void;
  onEditExam: (exam: Exam) => void;
  onDeleteExam: (exam: Exam) => void;
  onAddSubjectToExam: (examCode: string) => void;
  removeSubjectFromExam: UseMutationResult<void, Error, { examId: string; subjectId: string }, unknown>;
  formatDate: (dateString?: string) => string;
}

export const ExamsTab = ({
  exams,
  isLoading,
  onAddExam,
  onEditExam,
  onDeleteExam,
  onAddSubjectToExam,
  removeSubjectFromExam,
  formatDate,
}: ExamsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Exams</CardTitle>
            <CardDescription>Manage exams and their subject configurations</CardDescription>
          </div>
          <Button onClick={onAddExam} disabled={isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Add Exam
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading exams...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {exams.map((exam) => (
              <ExamCard
                key={exam.code}
                exam={exam}
                onEditExam={onEditExam}
                onDeleteExam={onDeleteExam}
                onAddSubjectToExam={onAddSubjectToExam}
                removeSubjectFromExam={removeSubjectFromExam}
                formatDate={formatDate}
              />
            ))}

            {exams.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No exams found</h3>
                <p className="mb-4">Create your first exam to get started.</p>
                <Button onClick={onAddExam}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Exam
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

