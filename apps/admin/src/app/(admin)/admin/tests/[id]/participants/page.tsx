"use client"

import { Button } from "@repo/common-ui"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/common-ui"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/common-ui"
import { useQuery } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { AlertCircle, Download, Filter, Search, Trash, User, Users } from "lucide-react"
import { useState, useMemo } from "react"
import { Badge } from "@repo/common-ui"
import { getTestParticipants, deleteTestParticipant, TestParticipant } from "@/services/test-participant.service"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/common-ui"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@repo/common-ui"
import { MoreHorizontal } from "lucide-react"
import { Input } from "@repo/common-ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/common-ui"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function TestParticipantsPage() {
  const params = useParams()
  const testId = params?.id as string | undefined
  
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<'score' | 'accuracy' | 'startTime'>('startTime')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const pageSize = 20
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteParticipantId, setDeleteParticipantId] = useState<string | null>(null)
  const [deleteParticipantName, setDeleteParticipantName] = useState<string>('')
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: participantsData, isLoading, refetch } = useQuery({
    queryKey: ["test-participants", testId, statusFilter, sortBy, sortOrder, page],
    queryFn: async () => {
      if (!testId) return null
      return getTestParticipants({
        testId,
        status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
        limit: pageSize,
        offset: page * pageSize,
        sortBy,
        sortOrder,
      })
    },
    enabled: !!testId,
  })

  const filteredParticipants = useMemo(() => {
    if (!participantsData?.data?.participants) return []
    
    if (!searchQuery.trim()) return participantsData.data.participants

    const query = searchQuery.toLowerCase()
    return participantsData.data.participants.filter((participant: TestParticipant) => {
      const name = participant.user.name?.toLowerCase() || ''
      const username = participant.user.username?.toLowerCase() || ''
      const email = participant.user.email?.toLowerCase() || ''
      const phone = participant.user.phone?.toLowerCase() || ''
      
      return (
        name.includes(query) ||
        username.includes(query) ||
        email.includes(query) ||
        phone.includes(query)
      )
    })
  }, [participantsData?.data?.participants, searchQuery])

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      JOIN: { label: "Joined", variant: "outline" },
      STARTED: { label: "Started", variant: "default" },
      COMPLETED: { label: "Completed", variant: "default" },
      SUBMITTED: { label: "Submitted", variant: "default" },
    }

    const config = statusConfig[status] || { label: status, variant: "outline" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "N/A"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const exportToCSV = () => {
    if (!participantsData?.data?.participants) return

    const headers = [
      'Name',
      'Username',
      'Email',
      'Phone',
      'Status',
      'Score',
      'Total Marks',
      'Accuracy (%)',
      'Time Taken',
      'Correct',
      'Incorrect',
      'Unattempted',
      'Start Time',
      'End Time',
    ]

    const rows = participantsData.data.participants.map((p: TestParticipant) => [
      p.user.name || 'N/A',
      p.user.username || 'N/A',
      p.user.email || 'N/A',
      p.user.phone || 'N/A',
      p.status,
      p.score || 0,
      'N/A', // Total marks would need to come from test data
      p.accuracy ? `${p.accuracy.toFixed(2)}%` : 'N/A',
      formatTime(p.timing),
      p.stats.correctCount,
      p.stats.incorrectCount,
      p.stats.unattemptedCount,
      formatDate(p.startTime),
      formatDate(p.endTime),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `test-participants-${testId}-${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "CSV Exported Successfully",
      description: "The participant data has been downloaded",
      duration: 3000,
      className: "bg-gray-100 text-gray-800",
    })
  }

  const handleDeleteClick = (participant: TestParticipant) => {
    setDeleteParticipantId(participant.id)
    setDeleteParticipantName(participant.user.name || participant.user.username || 'Unknown')
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteParticipantId || !testId) return

    try {
      setIsDeleting(true)
      const response = await deleteTestParticipant(testId, deleteParticipantId)

      if (response.success) {
        toast({
          title: "Participant Deleted Successfully",
          description: `${deleteParticipantName}'s participation has been removed`,
          duration: 3000,
          className: "bg-gray-100 text-gray-800",
        })
        setIsDeleteDialogOpen(false)
        setDeleteParticipantId(null)
        setDeleteParticipantName('')
        refetch()
      } else {
        toast({
          title: "Failed to Delete Participant",
          description: response.message || "An error occurred",
          duration: 3000,
          className: "bg-red-500 text-white",
        })
      }
    } catch (error) {
      console.error("Error deleting participant:", error)
      toast({
        title: "Error",
        description: "Failed to delete participant. Please try again.",
        duration: 3000,
        className: "bg-red-500 text-white",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Show loading state while params are being resolved
  if (!testId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <span className="animate-spin h-8 w-8 border-2 border-edu-blue border-t-transparent rounded-full mb-4"></span>
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  const totalPages = participantsData?.data?.total
    ? Math.ceil(participantsData.data.total / pageSize)
    : 0

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Test Participants</h2>
          <p className="text-gray-500">
            Manage and view all participants for test: {testId.substring(0, 8)}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="flex items-center gap-2"
            disabled={!participantsData?.data?.participants?.length}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Link href="/admin/tests">
            <Button variant="outline">Back to Tests</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants Management
            </CardTitle>
          </CardHeader>
          <CardContent className="rounded-md">
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, username, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="JOIN">Joined</SelectItem>
                  <SelectItem value="STARTED">Started</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startTime">Start Time</SelectItem>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="accuracy">Accuracy</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'} {sortOrder === 'asc' ? 'Asc' : 'Desc'}
              </Button>
            </div>

            {/* Stats Summary */}
            {participantsData?.data && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Total Participants</p>
                        <p className="text-2xl font-bold">{participantsData.data.total}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="text-2xl font-bold">
                          {participantsData.data.participants.filter(
                            (p: TestParticipant) => p.status === 'COMPLETED'
                          ).length}
                        </p>
                      </div>
                      <User className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">In Progress</p>
                        <p className="text-2xl font-bold">
                          {participantsData.data.participants.filter(
                            (p: TestParticipant) => p.status === 'STARTED'
                          ).length}
                        </p>
                      </div>
                      <Filter className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Avg Accuracy</p>
                        <p className="text-2xl font-bold">
                          {participantsData.data.participants.length > 0
                            ? (
                                participantsData.data.participants.reduce(
                                  (sum: number, p: TestParticipant) => sum + (p.accuracy || 0),
                                  0
                                ) / participantsData.data.participants.length
                              ).toFixed(1)
                            : '0'}
                          %
                        </p>
                      </div>
                      <User className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Participants Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Time Taken</TableHead>
                  <TableHead>Correct</TableHead>
                  <TableHead>Incorrect</TableHead>
                  <TableHead>Unattempted</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <span className="animate-spin h-6 w-6 border-2 border-edu-blue border-t-transparent rounded-full mb-2"></span>
                        <span>Loading Participants...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredParticipants.length > 0 ? (
                  filteredParticipants.map((participant: TestParticipant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {participant.user.name || participant.user.username || 'N/A'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {participant.user.email || participant.user.phone || ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(participant.status)}</TableCell>
                      <TableCell>
                        {participant.score !== null ? participant.score : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {participant.accuracy !== null
                          ? `${participant.accuracy.toFixed(2)}%`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{formatTime(participant.timing)}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {participant.stats.correctCount}
                      </TableCell>
                      <TableCell className="text-red-600 font-medium">
                        {participant.stats.incorrectCount}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {participant.stats.unattemptedCount}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(participant.startTime)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(participant.endTime)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="flex items-center gap-2 text-red-600"
                              onClick={() => handleDeleteClick(participant)}
                            >
                              <Trash className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <AlertCircle className="h-10 w-10 mb-2" />
                        <span className="text-lg font-medium">No participants found</span>
                        <span className="text-sm">
                          {searchQuery || (statusFilter && statusFilter !== 'all')
                            ? 'Try adjusting your filters'
                            : 'No participants have joined this test yet'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {page * pageSize + 1} to{' '}
                  {Math.min((page + 1) * pageSize, participantsData?.data?.total || 0)} of{' '}
                  {participantsData?.data?.total || 0} participants
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white p-4 rounded-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the participation record for <strong>{deleteParticipantName}</strong>? 
              This will remove all their test attempts and participation data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button 
              onClick={handleDeleteConfirm} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></span>
                  Deleting...
                </>
              ) : (
                'Delete Participant'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
