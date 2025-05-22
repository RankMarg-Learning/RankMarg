"use client"
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from 'next/image'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

const LeaderboardPage = ({ params }: { params: { testId: string } }) => {
  const { testId } = params

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['leaderboard', testId],
    queryFn: async () => {
      const response = await axios.post(`/api/test/${testId}/leaderboard`)
      return response.data
    }
  })
  // if (isLoading) return <div>Loading...</div>

  function formatTime(seconds: number) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs > 0 ? `${hrs}h ` : ""}${mins > 0 ? `${mins}m ` : ""}${secs}s`;
  }

  const userIndex = entries[0]?.testParticipation?.findIndex(
    (entry) => entry.user.username === localStorage.getItem("username")
  );
  const currentUser = userIndex !== -1 ? entries[0]?.testParticipation[userIndex] : null;

  return (
    <div className="md:p-8 p-2 py-10 bg-background min-h-screen">
      <h1 className="text-4xl font-bold mb-8"> Leaderboard: {entries[0]?.title}</h1>
      <Card className="w-full overflow-x-auto rounded-sm scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow className="bg-gray-200 hover:bg-gray-200">
              <TableHead className="sticky left-0  w-[100px] bg-gray-200">Rank</TableHead>
              <TableHead className="sticky left-[100px] bg-gray-200 ">User</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Finish Time</TableHead>
              <TableHead>Accuracy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUser && (
              <TableRow className="bg-yellow-300 hover:bg-yellow-300">
                <TableCell className="sticky left-0 bg-yellow-300 font-medium">{userIndex + 1}</TableCell>
                <TableCell className="sticky left-[100px] bg-yellow-300 ">
                  <Link href={`/u/${currentUser?.user?.username}`} className="flex items-center gap-2 hover:underline" target="_blank">
                    <Image
                      src={currentUser?.user?.avatar || '/Profile_image.png'}
                      alt={`${currentUser?.user?.name}'s avatar`}
                      width={32}
                      height={32}
                      className="bg-muted rounded-full"
                    />
                    {currentUser.user.name}
                  </Link>
                </TableCell>
                <TableCell >{currentUser.score}/{entries[0]?.totalMarks}</TableCell>
                <TableCell >{formatTime(currentUser?.timing)}</TableCell>
                <TableCell >{currentUser?.accuracy}</TableCell>
              </TableRow>
            )}
            {!isLoading ? (
              entries[0]?.testParticipation.map((entry, idx) => (
                <TableRow key={idx + 1} className={`${entry.user.username === localStorage.getItem("username") ? 'hidden' : ''}`}>
                  <TableCell className="sticky left-0 bg-white font-medium">{idx + 1}</TableCell>
                  <TableCell className="sticky left-[100px] bg-white">
                    <Link href={`/u/${entry?.user?.username}`} className="flex items-center gap-2 hover:underline" target="_blank">
                      <Image
                        src={entry?.user?.avatar}
                        alt={`${entry?.user?.name}'s avatar`}
                        width={32}
                        height={32}
                        className="bg-muted rounded-full"
                      />
                      {entry?.user?.name}
                    </Link>
                  </TableCell>
                  <TableCell>{entry?.score}/{entries[0]?.totalMarks}</TableCell>
                  <TableCell>{formatTime(entry?.timing)}</TableCell>
                  <TableCell>{entry?.accuracy}</TableCell>
                </TableRow>
              ))
            ) : (
              Array.from({ length: 20 }).map((_, i) => (
                <TableRow key={i} className="h-10 w-full">
                  <TableCell className="sticky left-0 bg-white"><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell className="sticky left-[100px] bg-white"><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

export default LeaderboardPage