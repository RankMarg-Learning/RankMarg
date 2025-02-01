"use client";
import { Search } from "lucide-react";
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
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { QuestionSetProps, QuestionTableProps } from "@/types";
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
import { Tags } from "@/constant/tags";
import { Stream } from "@prisma/client";

interface QuestionsetProps {
  selectedQuestions?: string[];
  onSelectedQuestionsChange?: (selected: string[]) => void;
  isCheckBox?: boolean;
  isPublished?: boolean;
}

const Questionset: React.FC<QuestionsetProps> = ({
  selectedQuestions = [],
  onSelectedQuestionsChange,
  isCheckBox = false,
  isPublished = false,
}) => {
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [type, setType] = useState("");
  const [stream, setStream] = useState<Stream>("JEE");



  const handleDifficulty = (value: string[]) => {
    setDifficulty(value[0] === "Default" ? "" : value[0]);
    setCurrentPage(1);
  };

  const handleTags = (value: string[]) => {
    setTags(value[0] === "Default" ? "" : value[0]);
    setCurrentPage(1);
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["questions", currentPage, subject, difficulty, tags, search, isPublished],
    queryFn: async () => {
      const response = await axios.get<QuestionSetProps>(
        `/api/question?page=${currentPage}&subject=${subject}&difficulty=${difficulty}&tags=${tags}&search=${search}&type=${type}&stream=${stream}&isPublished=${isPublished}`
      );
      return response.data;
    },
  });

  useEffect(() => {
    refetch();
  }, [currentPage, subject, difficulty, tags, search, stream, type, refetch]);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (data?.totalPages && currentPage < data.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleCheckboxChange = (id: string) => {
    if (!onSelectedQuestionsChange) return;

    const updatedSelection = selectedQuestions.includes(id)
      ? selectedQuestions.filter((questionId) => questionId !== id)
      : [...selectedQuestions, id];

    onSelectedQuestionsChange(updatedSelection);
  };

  useEffect(() => {
    setStream((localStorage.getItem('stream') as Stream) || "NEET");
  }, []);

  return (
    <div className="w-full">
      <Tabs defaultValue="all">
        <div className="grid gap-2 sm:flex sm:items-center">
          <TabsList>
            {(isLoading
              ? ["All", "Physics", "Chemistry", "Mathematics", "Biology"]
              : stream === "JEE"
                ? ["All", "Physics", "Chemistry", "Mathematics"]
                : ["All", "Physics", "Chemistry", "Biology"]
            ).map((sub) => (
              <TabsTrigger
                key={sub}
                value={sub.toLowerCase()}
                onClick={() => {
                  setSubject(sub === "All" ? "" : sub);
                  setCurrentPage(1);
                }}
              >
                {sub}
              </TabsTrigger>
            ))}
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
              selectName={["Default", "Easy", "Medium", "Hard"]}
              onChange={handleDifficulty}
            />
            <SelectFilter
              width={"[100px]"}
              placeholder="PYQ"
              selectName={Tags}
              onChange={handleTags}
            />
            <SelectFilter
              width={"[100px]"}
              placeholder="Type"
              selectName={["MCQ", "NUM"]}
              onChange={(value) => setType(value[0])}
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
                      <TableHead>Class</TableHead>
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
                      : data?.questionSet?.length > 0
                        ? data?.questionSet.map((question: QuestionTableProps) => (
                          <TableRow key={question.id} className="sm:text-sm">
                            {isCheckBox && (
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedQuestions.includes(question.id)}
                                  onChange={() => handleCheckboxChange(question.id)}
                                  className="form-checkbox h-5 w-5 text-yellow-500"
                                />
                              </TableCell>
                            )}
                            <QTableRow problem={question} isPublished={isPublished} />
                          </TableRow>
                        ))
                        : (
                          <TableRow>
                            <td colSpan={5} className="text-center">
                              No questions found
                            </td>
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
                        "gap-1 px-2 py-1 text-sm sm:text-base",
                        currentPage === 1 && "cursor-not-allowed opacity-50"
                      )}
                      onClick={handlePrevious}
                    />
                  </PaginationItem>

                  {data?.totalPages && (
                    <>
                      {/* First Page */}
                      <PaginationItem>
                        <PaginationLink
                          className="px-2 py-1 text-sm sm:text-base"
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
                      {currentPage !== 1 && currentPage !== data.totalPages && (
                        <PaginationItem>
                          <PaginationLink
                            className="px-2 py-1 text-sm sm:text-base font-semibold"
                            onClick={() => handlePageClick(currentPage)}
                          >
                            {currentPage}
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      {/* Ellipsis if current page is far from the last page */}
                      {currentPage < data.totalPages - 1 && (
                        <PaginationEllipsis className="text-gray-500" />
                      )}

                      {/* Last Page */}
                      <PaginationItem>
                        <PaginationLink
                          className={`px-2 py-1 text-sm sm:text-base ${data.totalPages === 1 ? "hidden" : ""}`}
                          onClick={() => handlePageClick(data.totalPages)}
                        >
                          {data.totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  {/* Next Button */}
                  <PaginationItem>
                    <PaginationNext
                      className={cn(
                        "gap-1 px-2 py-1 text-sm sm:text-base",
                        currentPage === data?.totalPages && "cursor-not-allowed opacity-50"
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
