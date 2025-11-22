import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/common-ui";
import { Button } from "@repo/common-ui";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@repo/common-ui";
import { Plus, MoreVertical, Pencil, Trash2, Users } from "lucide-react";
import { Exam } from "@/types/typeAdmin";
import { UseMutationResult } from "@tanstack/react-query";

interface ExamCardProps {
  exam: Exam;
  onEditExam: (exam: Exam) => void;
  onDeleteExam: (exam: Exam) => void;
  onAddSubjectToExam: (examCode: string) => void;
  removeSubjectFromExam: UseMutationResult<void, Error, { examId: string; subjectId: string }, unknown>;
  formatDate: (dateString?: string) => string;
}

export const ExamCard = ({
  exam,
  onEditExam,
  onDeleteExam,
  onAddSubjectToExam,
  removeSubjectFromExam,
  formatDate,
}: ExamCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">{exam.name}</CardTitle>
              <span className={`px-2 py-1 rounded-full text-xs ${exam.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                }`}>
                {exam.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {exam.fullName && (
              <CardDescription className="mt-1">{exam.fullName}</CardDescription>
            )}
            {exam.description && (
              <p className="text-sm text-muted-foreground mt-2">{exam.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEditExam(exam)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit Exam
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddSubjectToExam(exam.code)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteExam(exam)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Exam
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{exam.totalMarks}</div>
            <div className="text-sm text-muted-foreground">Total Marks</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{exam.duration}</div>
            <div className="text-sm text-muted-foreground">Minutes</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{exam.minDifficulty}-{exam.maxDifficulty}</div>
            <div className="text-sm text-muted-foreground">Difficulty</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{exam.examSubjects?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Subjects</div>
          </div>
        </div>

        {/* Exam Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
          <div>
            <span className="font-medium">Category:</span> {exam.category || "Not specified"}
          </div>
          <div>
            <span className="font-medium">Negative Marking:</span> {exam.negativeMarking ? "Yes" : "No"}
            {exam.negativeMarking && exam.negativeMarkingRatio && (
              <span className="ml-1">({exam.negativeMarkingRatio})</span>
            )}
          </div>
          <div>
            <span className="font-medium">Exam Date:</span> {formatDate(exam.examDate)}
          </div>
        </div>

        {/* Subjects Section */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-lg">Subjects</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddSubjectToExam(exam.code)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </div>

          {exam.examSubjects && exam.examSubjects.length > 0 ? (
            <div className="space-y-2">
              {exam.examSubjects.map((examSubject) => (
                <div
                  key={`${examSubject.examCode}-${examSubject.subjectId}`}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">
                        {examSubject.subject?.name}
                        {examSubject.subject?.shortName && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({examSubject.subject.shortName})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-medium text-blue-600">
                        {examSubject.weightage}%
                      </div>
                      <div className="text-xs text-muted-foreground">Weightage</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubjectFromExam.mutate({ examId: exam.code, subjectId: examSubject.subjectId })}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No subjects added to this exam yet.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => onAddSubjectToExam(exam.code)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Subject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

