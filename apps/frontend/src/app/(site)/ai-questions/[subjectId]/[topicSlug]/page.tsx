"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  aiQuestionService,
  AIQuestion,
  AIQuestionPagination,
  AIQuestionMetadata,
} from "@/services/aiQuestion.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Trophy,
  Target,
  Clock,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AIQuestionsTopicPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const subjectId = params.subjectId as string;
  const topicSlug = params.topicSlug as string;

  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [pagination, setPagination] = useState<AIQuestionPagination | null>(null);
  const [metadata, setMetadata] = useState<AIQuestionMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (topicSlug) {
      fetchQuestions(currentPage);
    }
  }, [topicSlug, currentPage]);

  const fetchQuestions = async (page: number) => {
    try {
      setLoading(true);
      const data = await aiQuestionService.getQuestionsByTopic(topicSlug, page, 10);
      console.log("data",data);
      setQuestions(data);
      setPagination(data.pagination);
      setMetadata(data.metadata);
    } catch (error: any) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to load questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (pagination?.hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return { label: "Easy", color: "bg-green-100 text-green-800 border-green-300" };
      case 2:
        return { label: "Medium", color: "bg-yellow-100 text-yellow-800 border-yellow-300" };
      case 3:
        return { label: "Hard", color: "bg-orange-100 text-orange-800 border-orange-300" };
      case 4:
        return { label: "Very Hard", color: "bg-red-100 text-red-800 border-red-300" };
      default:
        return { label: "Unknown", color: "bg-gray-100 text-gray-800 border-gray-300" };
    }
  };

  const formatGrade = (grade: string) => {
    return grade.replace("_", "+");
  };

  const handleQuestionClick = (question: AIQuestion) => {
    // Navigate to full question view
    router.push(`/question/${question.slug}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Topics
        </Button>

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {metadata?.topicName || "AI Questions"}
            </h1>
            <p className="text-gray-600 text-lg">
              {metadata?.subjectName} • Tailored for Grade {metadata && formatGrade(metadata.userGrade)}
            </p>
          </div>
        </div>

        {/* Metadata Cards */}
        {metadata && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Your Grade</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatGrade(metadata.userGrade)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Difficulty Range</p>
                    <p className="text-xl font-bold text-green-600">
                      {metadata.difficultyRange.min} - {metadata.difficultyRange.max}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Attempted</p>
                    <p className="text-xl font-bold text-purple-600">
                      {metadata.questionsAttempted}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-600 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-xl font-bold text-orange-600">
                      {pagination?.totalCount || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Smart Question Selection</AlertTitle>
          <AlertDescription className="text-blue-800">
            Questions are filtered based on your grade level and exclude those you've already attempted.
            This ensures focused practice on new material.
          </AlertDescription>
        </Alert>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Questions Available
            </h3>
            <p className="text-gray-600 mb-4">
              {metadata?.questionsAttempted
                ? "Great job! You've attempted all available questions for this topic at your level."
                : "There are no questions available for this topic at the moment."}
            </p>
            <Button onClick={() => router.push(`/ai-questions/${subjectId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Topics
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {questions.map((question, index) => {
              const difficultyInfo = getDifficultyLabel(question.difficulty);
              return (
                <Card
                  key={question.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleQuestionClick(question)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                          {(currentPage - 1) * 10 + index + 1}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                            {question.title}
                          </CardTitle>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <Badge variant="outline" className={difficultyInfo.color}>
                          {difficultyInfo.label}
                        </Badge>
                        {question.pyqYear && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                            PYQ {question.pyqYear}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 ml-13">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{question.questionTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{question.type.replace("_", " ")}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="prose prose-sm max-w-none mb-4 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: question.content }}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {question.categories.slice(0, 3).map((cat, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {cat.replace("_", " ")}
                          </Badge>
                        ))}
                        {question.categories.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{question.categories.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <Button variant="outline" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        View Question
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount}{" "}
                total questions)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPreviousPage}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

