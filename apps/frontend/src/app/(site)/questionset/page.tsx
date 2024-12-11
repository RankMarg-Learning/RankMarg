"use client";
import { Search } from "lucide-react";
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
import React, { useState } from "react";
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
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Questionset = () => {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleDifficulty = (value: string[]) => {
    if (value[0] === "Default") {
      setDifficulty("");
      return;
    }
    setDifficulty(value[0]);
  };

  const handleTags = (value: string[]) => {
    if (value[0] === "Default") {
      setTags("");
      return;
    }
    setTags(value[0]);
  };

  const { data } = useQuery({
    queryKey: ["questions", currentPage],
    queryFn: async () => {
      const response = await axios.get<QuestionSetProps>(
        `/api/question?page=${currentPage}`
      );
      const { data } = response;
      return data;
    },
  });

  const questions =
    data?.questionSet.filter((question: QuestionTableProps) => {
      const matchesDifficulty = !difficulty || question.difficulty === difficulty;
      const matchesTags = !tags || (question.tag && question.tag === tags);
      const matchesSubject = !subject || question.subject === subject;
      const matchesSearch =
        !search ||
        question.content.toLowerCase().includes(search.toLowerCase()) ||
        question.topic.toLowerCase().includes(search.toLowerCase());
      return matchesDifficulty && matchesTags && matchesSubject && matchesSearch;
    }) || [];

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
        <div className="w-full mx-auto">
        <Tabs defaultValue="all">
          <div className="grid gap-2 sm:flex sm:items-center">
            <TabsList>
              {["All", "Mathematics", "Physics", "Chemistry"].map((sub) => (
                <TabsTrigger
                  key={sub}
                  value={sub}
                  onClick={() => setSubject(sub === "All" ? "" : sub)}
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
                onChange={(e) => setSearch(e.target.value)}
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
          <TabsContent value={subject || "all"}>
            <Card>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        {["Class", "Difficulty", "Question", "Subject", "Topic"].map(
                          (head) => (
                            <TableHead
                              key={head}
                              className="hidden md:table-cell"
                            >
                              {head}
                            </TableHead>
                          )
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.length
                        ? questions.map((question) => (
                            <QTableRow key={question.id} problem={question} />
                          ))
                        : Array.from({ length: 5 }).map((_, i) => (
                            <QTableRowSkeleton key={i} />
                          ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={handlePrevious}
                        aria-disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    {Array.from({ length: data?.totalPages || 1 }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => handlePageClick(i + 1)}
                          className={currentPage === i + 1 ? "font-bold" : ""}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={handleNext}
                        aria-disabled={currentPage === data?.totalPages}
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
