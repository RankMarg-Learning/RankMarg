"use client";
import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getQuestionBySlug, deleteQuestion, migrateAttempts } from "@/services/question.service";
import MarkdownRenderer from "@/lib/MarkdownRenderer";
import { QuestionType } from "@repo/db/enums";
import { TextFormator } from "@/utils/textFormator";
import { Button } from "@repo/common-ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@repo/common-ui";
import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

function DuplicateDetectorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug1 = searchParams.get("slug1");
  const slug2 = searchParams.get("slug2");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    slug: string;
    questionNumber: number;
  } | null>(null);

  const { data: question1Data, isLoading: loading1, refetch: refetch1 } = useQuery({
    queryKey: ["question", slug1],
    queryFn: () => getQuestionBySlug(slug1!),
    enabled: !!slug1,
    retry: 2,
  });

  const { data: question2Data, isLoading: loading2, refetch: refetch2 } = useQuery({
    queryKey: ["question", slug2],
    queryFn: () => getQuestionBySlug(slug2!),
    enabled: !!slug2,
    retry: 2,
  });

  const question1 = question1Data?.data;
  const question2 = question2Data?.data;

  const handleDeleteClick = (slug: string | undefined, questionNumber: number) => {
    if (!slug) return;
    
    const questionToDelete = questionNumber === 1 ? question1 : question2;
    const targetQuestion = questionNumber === 1 ? question2 : question1;

    if (!questionToDelete?.id) {
      toast({
        title: "Error",
        description: `Question ${questionNumber} data not available`,
        variant: "destructive",
      });
      return;
    }

    if (!targetQuestion?.id) {
      toast({
        title: "Error",
        description: "Cannot delete: Target question not available for migration",
        variant: "destructive",
      });
      return;
    }

    setPendingDelete({ slug, questionNumber });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;

    const { slug, questionNumber } = pendingDelete;
    const questionToDelete = questionNumber === 1 ? question1 : question2;
    const targetQuestion = questionNumber === 1 ? question2 : question1;

    if (!questionToDelete?.id || !targetQuestion?.id) {
      toast({
        title: "Error",
        description: "Question data not available",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      setPendingDelete(null);
      return;
    }

    try {
      // First, migrate attempts from the question to be deleted to the other question
      const migrateResponse = await migrateAttempts(questionToDelete.id, targetQuestion.id);
      
      if (!migrateResponse?.success) {
        toast({
          title: "Migration Error",
          description: migrateResponse?.message || "Failed to migrate attempts. Question was not deleted.",
          variant: "destructive",
        });
        setIsDeleteDialogOpen(false);
        setPendingDelete(null);
        return;
      }

      toast({
        title: "Migration Successful",
        description: `Migrated attempts to question ${questionNumber === 1 ? 2 : 1}`,
        variant: "success",
      });

      // Now delete the question
      const deleteResponse = await deleteQuestion(slug);
      if (deleteResponse?.success) {
        toast({
          title: "Success",
          description: `Question ${questionNumber} deleted successfully`,
          variant: "success",
        });
        setIsDeleteDialogOpen(false);
        setPendingDelete(null);
        if (questionNumber === 1) {
          refetch1();
        } else {
          refetch2();
        }
        // Redirect to questions page after deletion
        setTimeout(() => {
          router.push("/admin/questions");
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: deleteResponse?.message || "Failed to delete question",
          variant: "destructive",
        });
        setIsDeleteDialogOpen(false);
        setPendingDelete(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      setPendingDelete(null);
    }
  };

  if (!slug1 || !slug2) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <AlertCircle className="h-5 w-5" />
          <p>Please provide both slug1 and slug2 query parameters in the URL.</p>
        </div>
      </div>
    );
  }

  const renderQuestion = (question: any, questionNumber: number, isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      );
    }

    if (!question) {
      return (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="h-5 w-5" />
          <p>Question {questionNumber} not found</p>
        </div>
      );
    }

    return (
      <div className="space-y-6 h-full ">
        <div className="flex items-center justify-between sticky top-0 bg-white  pb-4 border-b">
          <h2 className="text-base font-bold text-gray-900">Question {questionNumber}</h2>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteClick(question.slug, questionNumber)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Question {questionNumber}
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Question Title</h3>
          <div className="p-3 bg-gray-50 rounded-md border">
            <p className="text-gray-800">{question.title || "No title provided"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Question Content</h3>
          <div className="p-4 bg-white rounded-md border">
            {question.content ? (
              <MarkdownRenderer content={question.content} />
            ) : (
              <p className="text-gray-500 italic">No content provided</p>
            )}
          </div>
        </div>

        {question.type === QuestionType.MULTIPLE_CHOICE && question.options?.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Options</h3>
            <div className="space-y-3">
              {question.options.map((option: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-md border ${
                    option.isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${
                        option.isCorrect
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <div className="flex-1">
                      <MarkdownRenderer content={option.content} />
                    </div>
                    {option.isCorrect && (
                      <span className="text-green-600 font-medium text-sm">✓ Correct</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {question.type === QuestionType.INTEGER && question.isNumerical && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Correct Answer</h3>
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-blue-800 font-medium">{question.isNumerical}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Solution</h3>
          <div className="p-4 bg-white rounded-md border">
            {question.solution ? (
              <MarkdownRenderer content={question.solution} />
            ) : (
              <p className="text-gray-500 italic">No solution provided</p>
            )}
          </div>
        </div>

        {question.strategy && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Strategy</h3>
            <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
              <MarkdownRenderer content={question.strategy} />
            </div>
          </div>
        )}

        {question.hint && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Hint</h3>
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <MarkdownRenderer content={question.hint} />
            </div>
          </div>
        )}

        {question.commonMistake && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Common Mistakes</h3>
            <div className="p-3 bg-red-50 rounded-md border border-red-200">
              <MarkdownRenderer content={question.commonMistake} />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Question Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-gray-50 rounded-md border">
            <div>
              <p className="text-sm font-medium text-gray-600">Type</p>
              <p className="text-sm text-gray-800">{TextFormator(question.type)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Difficulty</p>
              <p className="text-sm text-gray-800">
                {question.difficulty === 1 && "Easy"}
                {question.difficulty === 2 && "Medium"}
                {question.difficulty === 3 && "Hard"}
                {question.difficulty === 4 && "Very Hard"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Time</p>
              <p className="text-sm text-gray-800">{question.questionTime || "N/A"} sec</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-sm text-gray-800">
                {question.isPublished ? "Published" : "Draft"}
              </p>
            </div>
          </div>
        </div>

        {question.category?.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {question.category.map((cat: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                >
                  {TextFormator(cat)}
                </span>
              ))}
            </div>
          </div>
        )}

        {(question.pyqYear || question.book) && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">References</h3>
            <div className="space-y-2">
              {question.pyqYear && (
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="text-sm font-medium text-gray-600">PYQ Year</p>
                  <p className="text-sm text-gray-800">{question.pyqYear}</p>
                </div>
              )}
              {question.book && (
                <div className="p-2 bg-gray-50 rounded border">
                  <p className="text-sm font-medium text-gray-600">Book Reference</p>
                  <p className="text-sm text-gray-800">{question.book}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Slug</h3>
          <div className="p-2 bg-gray-50 rounded border">
            <p className="text-sm text-gray-800 font-mono">{question.slug}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto ">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Duplicate Question Detector</h1>
        <p className="text-gray-600 text-sm">
          Compare two questions side by side to identify duplicates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        <div className="border rounded-lg p-6 bg-white shadow-sm overflow-hidden flex flex-col">
          {renderQuestion(question1, 1, loading1)}
        </div>
        <div className="border rounded-lg p-6 bg-white shadow-sm overflow-hidden flex flex-col">
          {renderQuestion(question2, 2, loading2)}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white p-4 rounded-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              {pendingDelete && (
                <>
                  Are you sure you want to delete <strong>Question {pendingDelete.questionNumber}</strong>?
                  <br />
                  <br />
                  All attempts will be migrated to <strong>Question {pendingDelete.questionNumber === 1 ? 2 : 1}</strong> before deletion.
                  <br />
                  <br />
                  This action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setPendingDelete(null)}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const DuplicateDetectorPage = () => {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      }
    >
      <DuplicateDetectorContent />
    </Suspense>
  );
};

export default DuplicateDetectorPage;
