"use client";
import { AlertCircle, Plus, Search } from "lucide-react";
import { Card, CardContent, CardFooter } from "@repo/common-ui";
import { Input } from "@repo/common-ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/common-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/common-ui";
import SelectFilter from "@/components/SelectFilter";
import React, { useState, useEffect } from "react";
import { QTableRow } from "@/components/questions/QTableRow";
import { QTableRowSkeleton } from "@/components/questions/QTableRowSkeleton";
import { useQuery } from "@tanstack/react-query";
import {  QuestionTableProps } from "@/types";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/common-ui";
import { cn } from "@/lib/utils";
import { QuestionFormat, QuestionType } from "@repo/db/enums";
import { useSubjects } from "@/hooks/useSubject";
import Link from "next/link";
import { Button } from "@repo/common-ui";
import { usePathname } from "next/navigation";
import {  getQuestionByFilter } from "@/services/question.service";


export interface QuestionSelection {
  id: string;
  title?: string;
  slug?: string;
  difficulty?: number;
  type?: QuestionType | string;
  format?: QuestionFormat | string;
  pyqYear?: string;
  topic?: { id?: string; name: string; weightage?: number };
  subTopic?: { id?: string; name: string };
  subject?: { id?: string; name: string; shortName?: string };
  category?: { category: string }[];
}

interface QuestionsetProps {
  selectedQuestions?: QuestionSelection[];
  onSelectedQuestionsChange?: (selected: QuestionSelection[]) => void;
  isCheckBox?: boolean;
  isPublished?: boolean;
  examCode?: string;
  maxSelectable?: number;
  onSelectionLimitReached?: () => void;
  lockedSubjectId?: string;
  questionFilter?: "all" | "my-questions";
}

const Questionset: React.FC<QuestionsetProps> = ({
  selectedQuestions = [],
  onSelectedQuestionsChange,
  isCheckBox = false,
  isPublished = false,
  examCode,
  maxSelectable,
  onSelectionLimitReached,
  lockedSubjectId,
  questionFilter = "all",
}) => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [type, setType] = useState<QuestionType | null>(null);

  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const { subjects: subjectOptions, isLoading: isSubjectLoading } = useSubjects(examCode);

  useEffect(() => {
    if (lockedSubjectId && !subjects.includes(lockedSubjectId)) {
      setSubjects([lockedSubjectId]);
      setCurrentPage(1);
    }
  }, [lockedSubjectId, subjects]);


  const handleDifficulty = (value: string[]) => {
    const difficultyMap: Record<string, number | null> = {
      Default: null,
      Easy: 1,
      Medium: 2,
      Hard: 3,
      "Very Hard": 4,
    };

    const selected = value[0];
    setDifficulty(difficultyMap[selected] ?? null);
    setCurrentPage(1);
  };

  const activeTab = subjects.length > 0 ? subjects.join(",") : (lockedSubjectId ? lockedSubjectId : "all");

  const handleTabChange = (value: string) => {
    if (lockedSubjectId) return;
    if (value === "all") {
      setSubjects(subjectOptions.map((sub) => sub.id));
    } else {
      setSubjects([value]);
    }
    setCurrentPage(1);
  };

  const renderSubjectTabs = () => {
    if (lockedSubjectId) {
      const lockedSubject = subjectOptions.find((sub) => sub.id === lockedSubjectId);
      return (
        <TabsList>
          <TabsTrigger
            value={lockedSubjectId}
            className="pointer-events-none opacity-70"
          >
            {lockedSubject?.name || "Selected Subject"}
          </TabsTrigger>
        </TabsList>
      );
    }

    if (isSubjectLoading) {
      return (
        <TabsList>
          <TabsTrigger value="all" className="pointer-events-none opacity-70">
            Loading subjects...
          </TabsTrigger>
        </TabsList>
      );
    }

    if (subjectOptions.length === 0) {
      return (
        <TabsList>
          <TabsTrigger value="all" className="pointer-events-none opacity-70">
            No subjects available
          </TabsTrigger>
        </TabsList>
      );
    }

    return (
      <TabsList className="flex flex-wrap gap-2">
        <TabsTrigger value="all">All</TabsTrigger>
        {subjectOptions.map((sub) => (
          <TabsTrigger key={sub.id} value={sub.id}>
            {sub.name}
          </TabsTrigger>
        ))}
      </TabsList>
    );
  };

 

  const { data:questions, isLoading, refetch } = useQuery({
    queryKey: ["questions", currentPage, subjects, difficulty, search, isPublished,  examCode, questionFilter],
    queryFn: async () => getQuestionByFilter({
      isPublished, 
      page: currentPage, 
      subjectId: subjects.length > 0 ? (subjects as string[]) : undefined, 
      difficulty,  
      search, 
      type, 
      examCode, 
      questionFilter 
    }),
  });

  useEffect(() => {
    refetch();
  }, [currentPage, subjects, difficulty, search,  type, examCode, questionFilter, refetch]);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (questions?.data?.totalPages && currentPage < questions?.data?.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const buildSelectionPayload = (question: QuestionTableProps): QuestionSelection => ({
    id: question.id,
    title: question.title,
    slug: question.slug,
    difficulty: question.difficulty,
    type: question.type,
    format: question.format,
    topic: question.topic ? { name: question.topic.name } : undefined,
    subTopic: question.subTopic ? { name: question.subTopic.name } : undefined,
    subject: question.subject ? { name: question.subject.name } : undefined,
  });

  const handleCheckboxChange = (question: QuestionTableProps) => {
    if (!onSelectedQuestionsChange) return;

    const isSelected = selectedQuestions.some((q) => q.id === question.id);

    if (isSelected) {
      onSelectedQuestionsChange(selectedQuestions.filter((q) => q.id !== question.id));
      return;
    }

    if (typeof maxSelectable === "number" && maxSelectable > 0 && selectedQuestions.length >= maxSelectable) {
      onSelectionLimitReached?.();
      return;
    }

    onSelectedQuestionsChange([...selectedQuestions, buildSelectionPayload(question)]);
  };


  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="grid gap-2 sm:flex sm:items-center">
          {renderSubjectTabs()}
          <div className="relative flex-1 my-2 sm:ml-7">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg bg-background pl-8 h-9"
            />
          </div>
          <div className="grid gap-2 sm:flex sm:items-center">
            <SelectFilter
              width={"[100px]"}
              placeholder="Difficulty"
              selectName={["Default", "Easy", "Medium", "Hard","Very Hard"]}
              onChange={handleDifficulty}
            />
            <SelectFilter
              width={"[100px]"}
              placeholder="Type"
              selectName={["Default", "MULTIPLE_CHOICE", "INTEGER", "SUBJECTIVE"]}
              onChange={(value) => setType(value[0] === "Default" ? null : value[0] as QuestionType)}
            />

          </div>
        </div>
        <TabsContent value={activeTab}>
          <Card>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      {isCheckBox && <TableHead>Select</TableHead>}
                      {!isPublished && <TableHead>Status</TableHead>}
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Topic</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading
                      ? Array.from({ length: 20 }).map((_, i) => (
                        <QTableRowSkeleton key={i} />
                      ))
                      : questions?.data?.questions?.length > 0
                        ? questions?.data?.questions.map((question: QuestionTableProps, idx) => (
                          <TableRow key={idx} className="sm:text-sm">
                            {isCheckBox && (
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedQuestions.some((q) => q.id === question.id)}
                                  onChange={() => handleCheckboxChange(question)}
                                  className="form-checkbox h-5 w-5 text-yellow-500"
                                />
                              </TableCell>
                            )}
                            <QTableRow problem={question} isPublished={isPublished} />
                          </TableRow>
                        ))
                        : (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-10">
                              <div className="flex flex-col items-center justify-center text-gray-500">
                                <AlertCircle className="h-10 w-10 mb-2" />
                                <span className="text-lg font-medium">No questions found</span>
                                <span className="text-sm">Try adjusting your filters</span>{isAdminPage && (<span> or add a new question</span>)}
                                {isAdminPage && (
                                <Link href="/admin/questions/add" >
                                  <Button
                                    className="mt-4 bg-edu-blue hover:bg-primary-500"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Question
                                  </Button>
                                </Link>)}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter>
              <Pagination>
                <PaginationContent
                  className="flex flex-wrap items-center justify-center gap-2 sm:gap-4"
                >
                  {/* Previous Button */}
                  <PaginationItem>
                    <PaginationPrevious
                      className={cn(
                        "gap-1 px-2 py-1 text-sm sm:text-sm",
                        currentPage === 1 && "cursor-not-allowed opacity-50"
                      )}
                      onClick={handlePrevious}
                    />
                  </PaginationItem>

                  {questions?.data?.totalPages && (
                    <>
                      {/* First Page */}
                      <PaginationItem>
                        <PaginationLink
                          className="px-2 py-1 text-sm sm:text-sm"
                          onClick={() => handlePageClick(1)}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>

                      {/* Ellipsis if current page is far from the first page */}
                      {currentPage > 2 && (
                        <PaginationEllipsis className="text-gray-500" />
                      )}

                      {/* Current Page */}
                      {currentPage !== 1 && currentPage !== questions?.data.totalPages && (
                        <PaginationItem>
                          <PaginationLink
                            className="px-2 py-1 text-sm sm:text-sm font-semibold"
                            onClick={() => handlePageClick(currentPage)}
                          >
                            {currentPage}
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      {/* Ellipsis if current page is far from the last page */}
                      {currentPage < questions?.data.totalPages - 1 && (
                        <PaginationEllipsis className="text-gray-500" />
                      )}

                      {/* Last Page */}
                      <PaginationItem>
                        <PaginationLink
                          className={`px-2 py-1 text-sm sm:text-sm ${questions?.data.totalPages === 1 ? "hidden" : ""}`}
                          onClick={() => handlePageClick(questions?.data.totalPages)}
                        >
                          {questions?.data.totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  {/* Next Button */}
                  <PaginationItem>
                    <PaginationNext
                      className={cn(
                        "gap-1 px-2 py-1 text-sm sm:text-sm",
                        currentPage === questions?.data?.totalPages && "cursor-not-allowed opacity-50"
                      )}
                      onClick={handleNext}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>



            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Questionset;
