"use client";
import { AlertCircle, Plus, Search } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { Stream, QuestionType } from "@prisma/client";
import { useSubjects } from "@/hooks/useSubject";
import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import {  getQuestionByFilter } from "@/services/question.service";
import { PYQ_Year } from "@/constant/pyqYear";
import useSessionStore from "@/store/sessionStore";

interface QuestionsetProps {
  selectedQuestions?: {
    id: string;
    title?: string;
  }[];
  onSelectedQuestionsChange?: (selected: { id: string; title?: string; }[]) => void;
  isCheckBox?: boolean;
  isPublished?: boolean;
  IPstream?: Stream;
}

const Questionset: React.FC<QuestionsetProps> = ({
  selectedQuestions = [],
  onSelectedQuestionsChange,
  isCheckBox = false,
  isPublished = false,
  IPstream
}) => {
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [pyqYear, setPyqYear] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [type, setType] = useState<QuestionType | null>(null);

  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  const { stream: sessionStream } = useSessionStore();

  const getInitialStream = (): Stream => {
    if (IPstream) return IPstream;
    if (sessionStream) return sessionStream;
    return (typeof window !== "undefined" && localStorage.getItem("stream") as Stream) || "NEET";
  };

  const [stream, setStream] = useState<Stream>(getInitialStream());

  useEffect(() => {
    if (IPstream) {
      setStream(IPstream);
    } else if (sessionStream) {
      setStream(sessionStream);
    }
  }, [IPstream, sessionStream]);

  const handleDifficulty = (value: string[]) => {
    const difficultyMap: Record<string, number | null> = {
      Default: null,
      Easy: 1,
      Medium: 2,
      Hard: 3,
      "Very Hard" :4
    };
  
    const selected = value[0];
    setDifficulty(difficultyMap[selected] ?? null);
    setCurrentPage(1);
  };

  const handlePyqYear = (value: string[]) => {
    setPyqYear(value[0] === "Default" ? "" : value[0]);
    setCurrentPage(1);
  };

  const { data:questions, isLoading, refetch } = useQuery({
    queryKey: ["questions", currentPage, subject, difficulty, pyqYear, search, isPublished,stream],
    queryFn: async () => getQuestionByFilter({isPublished, page: currentPage, subjectId: subject, difficulty,  pyqYear, search, stream ,type }),
  });

  useEffect(() => {
    refetch();
  }, [currentPage, subject, difficulty, pyqYear, search, stream, type, refetch]);

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

  const handleCheckboxChange = (id: string, title: string) => {
    if (!onSelectedQuestionsChange) return;

    const updatedSelection = selectedQuestions.some((q) => q.id === id)
      ? selectedQuestions.filter((q) => q.id !== id)
      : [...selectedQuestions, { id, title }];

    onSelectedQuestionsChange(updatedSelection);
  };

  const { subjects, isLoading: isSubjectLoading } = useSubjects(stream);

  return (
    <div className="w-full">
      <Tabs defaultValue="all">
        <div className="grid gap-2 sm:flex sm:items-center">
          <TabsList>
            {!isSubjectLoading ? subjects?.data?.map((sub) => (
              <TabsTrigger
                key={sub.id} 
                value={sub.id} 
                onClick={() => {
                  setSubject(sub.id); 
                  setCurrentPage(1);
                }}
              >
                {sub.name} 
              </TabsTrigger>
            )):
            
            <TabsTrigger
              value="Loading"
              className="animate-pulse"
            >
              Loading
            </TabsTrigger>
            }
          </TabsList>
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
              placeholder="PYQ Year"
              selectName={PYQ_Year}
              onChange={handlePyqYear}
            />
            <SelectFilter
              width={"[100px]"}
              placeholder="Type"
              selectName={["Default", "MULTIPLE_CHOICE", "INTEGER", "SUBJECTIVE"]}
              onChange={(value) => setType(value[0] === "Default" ? null : value[0] as QuestionType)}
            />

          </div>
        </div>
        <TabsContent value={subject.toLowerCase() || "all"}>
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
                                  onChange={() => handleCheckboxChange(question.id, question.title)}
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
