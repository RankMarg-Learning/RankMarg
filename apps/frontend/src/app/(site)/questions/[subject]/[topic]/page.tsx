"use client"
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { decodeURLParam } from '@/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Question } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const getQuestionsBySubjectAndTopic = async (subject: string, topic: string) => {
  const decodedTopic = decodeURLParam(topic);
  const response = await fetch(`/api/question?subject=${subject.charAt(0).toUpperCase() + subject.slice(1)}&topic=${decodedTopic}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const TopicList = ({ params }: { params: { subject: string, topic: string } }) => {
  const { subject, topic } = params
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ['questions', subject, topic],
    queryFn: () => getQuestionsBySubjectAndTopic(subject, topic),
  })
  console.log(data)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'Hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
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
                <TableHead className="w-24">Q No.</TableHead>
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
                    data?.questionSet.map((question: Question, idx: number) => (
                      <TableRow
                        key={question.id}
                        className="cursor-pointer hover:bg-gray-100 transition-colors hover:text-gray-900"
                        onClick={() => router.push(`/question/${question.slug}`)}
                      >
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell>{question.title}</TableCell>
                        <TableCell>
                          <Badge className={getDifficultyColor(question.difficulty)}>
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

      </div>
    </main>
  )
}

export default TopicList