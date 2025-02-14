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

  const userIndex = entries[0]?.TestParticipation?.findIndex(
    (entry) => entry.user.username === localStorage.getItem("username")
  );
  const currentUser = userIndex !== -1 ? entries[0]?.TestParticipation[userIndex] : null;

  return (
    <div className="p-8 bg-background min-h-screen">
      <h1 className="text-4xl font-bold mb-8"> Leaderboard: {entries[0]?.title}</h1>

      <div >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Finish Time</TableHead>
              <TableHead>Accuracy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              currentUser && (
                <TableRow className='bg-yellow-300 rounded-md'>
                  <TableCell className='font-medium'>{userIndex + 1}</TableCell>
                  <TableCell>
                    <Link href={`/u/${currentUser?.user?.username}`} className="flex items-center gap-2 hover:underline" target='_blank'>
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
                  <TableCell>{currentUser.score}/{entries[0]?.totalMarks}</TableCell>
                  <TableCell>{formatTime(currentUser?.timing)}</TableCell>
                  <TableCell>{currentUser?.accuracy}</TableCell>
                </TableRow>
              )
            }
            {!isLoading ? (
              entries[0]?.TestParticipation.map((entry, idx: number) => (
                <TableRow key={idx + 1} className={`${entry.user.username === localStorage.getItem("username") ? 'hidden' : ""}`}>
                  <TableCell className="font-medium ">{idx + 1}</TableCell>
                  <TableCell>
                    <Link href={`/u/${entry?.user?.username}`} className="flex items-center gap-2 hover:underline" target='_blank'>
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
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default LeaderboardPage