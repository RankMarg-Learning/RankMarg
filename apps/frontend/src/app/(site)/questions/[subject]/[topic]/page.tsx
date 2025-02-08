"use client"
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cn, decodeURLParam } from '@/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { CircleCheck } from 'lucide-react';
import axios from 'axios';
import { QuestionSetProps } from '@/types';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const getQuestionsBySubjectAndTopic = async (subject: string, topic: string) => {
  const decodedTopic = decodeURLParam(topic);
  const response = await axios.get<QuestionSetProps>(`/api/question?subject=${subject.charAt(0).toUpperCase() + subject.slice(1)}&topic=${decodedTopic}`);
  if (!response) {
    throw new Error('Network response was not ok');
  }
  return response.data;
};

const TopicList = ({ params }: { params: { subject: string, topic: string } }) => {
  const { subject, topic } = params
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ['questions', subject, topic],
    queryFn: () => getQuestionsBySubjectAndTopic(subject, topic),
  })

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
  if (error) return <div>Error loading questions</div>

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-2 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          {decodeURLParam(topic)}
        </h1>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Status</TableHead>
                <TableHead>Question</TableHead>
                <TableHead className="w-28">Difficulty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                isLoading ?
                  Array.from({ length: 20 }).map((_, i) => (
                    <TableRow key={i} className="h-10 w-full">
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    </TableRow>
                  ))
                  :
                  data?.questionSet.length > 0 ?
                    data?.questionSet.map((question) => (
                      <TableRow
                        key={question.id}
                        className="cursor-pointer hover:bg-gray-100 transition-colors hover:text-gray-900"
                        onClick={() => router.push(`/question/${question.slug}`)}
                      >
                        <TableCell className="font-medium">{question.attempts.length > 0 ? (<CircleCheck className="text-green-400" />) : ("")}</TableCell>
                        <TableCell>{question.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              question.difficulty as
                              | "default"
                              | "Easy"
                              | "Medium"
                              | "Hard"
                              | "destructive"
                              | "outline"
                              | "secondary"
                              | null
                              | undefined
                            }
                          >
                            {question.difficulty}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                    :
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">No questions found</TableCell>
                    </TableRow>
              }
            </TableBody>
          </Table>
        </div>
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
      </div>
    </main>
  )
}

export default TopicList