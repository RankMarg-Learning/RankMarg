"use client";
import { Search } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
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
import Loading from "@/components/Loading";
import RandomQuestion from "@/components/questions/RandomQuestion";
import { Tags } from "@/constant/tags";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from '@/lib/utils';

const Questionset = () => {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleDifficulty = (value: string[]) => {
    setDifficulty(value[0] === "Default" ? "" : value[0]);
    setCurrentPage(1);
  };

  const handleTags = (value: string[]) => {
    setTags(value[0] === "Default" ? "" : value[0]);
    setCurrentPage(1);
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["questions", currentPage, subject, difficulty, tags, search],
    queryFn: async () => {
      const response = await axios.get<QuestionSetProps>(
        `/api/question?page=${currentPage}&subject=${subject}&difficulty=${difficulty}&tags=${tags}&search=${search}`
      );
      return response.data;
    },
  });

  useEffect(() => {
    refetch();
  }, [currentPage, subject, difficulty, tags, search, refetch]);

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

  return !loading ? (
    <main className="flex flex-col items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <RandomQuestion setLoading={setLoading} />
      <div className="w-full">
        <Tabs defaultValue="all">
          <div className="grid gap-2 sm:flex sm:items-center">
            <TabsList>
              {["All", "Mathematics", "Physics", "Chemistry"].map((sub) => (
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
            </div>
          </div>
          <TabsContent value={subject.toLowerCase() || "all"}>
            <Card>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      {[
                        { key: "class", label: "Class", hideOnMobile: true },
                        { key: "difficulty", label: "Difficulty", hideOnMobile: true },
                        { key: "question", label: "Question", hideOnMobile: false },
                        { key: "subject", label: "Subject", hideOnMobile: false },
                        { key: "topic", label: "Topic", hideOnMobile: true },
                      ].map((column) => (
                        <TableHead
                          key={column.key}
                          className={column.hideOnMobile ? "hidden md:table-cell" : ""}
                        >
                          {column.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                    <TableBody>
                      {isLoading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <QTableRowSkeleton key={i} />
                          ))
                        : data?.questionSet.length >0 ? data?.questionSet.map((question: QuestionTableProps) => (
                            <QTableRow key={question.id} problem={question} />
                          )): <TableRow><td colSpan={5} className="text-center">No questions found</td></TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter>
              <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                     className={cn(
                      "gap-1 pl-2.5",
                      currentPage === 1 && "cursor-not-allowed opacity-50" 
                    )}
                        onClick={handlePrevious}
                        aria-disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    {data?.totalPages && (
                      <>
                        {currentPage > 1 && (
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageClick(1)}
                              className={currentPage === 1 ? "font-bold" : ""}
                            >
                              1
                            </PaginationLink>
                          </PaginationItem>
                        )}

                        {currentPage > 2 && (
                          <PaginationEllipsis />
                        )}

                        {Array.from({ length: 2 }).map((_, index) => {
                          const pageNumber = currentPage + index;
                          if (pageNumber <= data.totalPages) {
                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  onClick={() => handlePageClick(pageNumber)}
                                  className={currentPage === pageNumber ? "font-bold" : ""}
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}

                        {currentPage + 2 < data.totalPages && (
                          <>
                            <PaginationEllipsis />
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => handlePageClick(data.totalPages)}
                                className={currentPage === data.totalPages ? "font-bold" : ""}
                              >
                                {data.totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          </>
                        )}
                      </>
                    )}

                    <PaginationItem>
                    <PaginationNext
                      onClick={handleNext}
                      aria-disabled={currentPage === data?.totalPages}
                      className={cn(
                        "gap-1 pr-2.5",
                        currentPage === data?.totalPages && "cursor-not-allowed opacity-50" 
                      )}
                    />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  ) : (
    <Loading />
  );
};

export default Questionset;

