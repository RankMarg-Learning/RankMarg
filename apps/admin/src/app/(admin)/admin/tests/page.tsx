"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { useQuery } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, Copy, Edit, MoreHorizontal, Plus, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { deleteTest, getTests } from "@/services/test.service"


export default function AdminTestPage() {

  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTestId, setDeleteTestId] = useState(null);

  const { data: tests, refetch, isLoading } = useQuery({
    queryKey: ["tests"],
    queryFn: async () => getTests(),
  });
  
  const getTestLink = (testId: string) => `${process.env.NEXT_PUBLIC_WEBSITE_URL!}/test/${testId}`

  const handleCopyTestLink = async (testId: string) => {
    const link = getTestLink(testId)
    if (typeof navigator === "undefined" || !navigator?.clipboard) {
      toast({
        title: "Clipboard unavailable",
        description: "Please copy the link manually.",
        duration: 3000,
        className: "bg-red-500 text-white",
      })
      return
    }
    try {
      await navigator.clipboard.writeText(link)
      toast({
        title: "Test link copied",
        description: link,
        duration: 3000,
        className: "bg-gray-100 text-gray-800",
      })
    } catch (error) {
      toast({
        title: "Failed to copy test link",
        variant: "default",
        duration: 3000,
        className: "bg-red-500 text-white",
      })
    }
  }

  const handleDelete = async (testId: string) => {
    if (testId) {

      const response = await deleteTest(testId);
      setIsDeleteDialogOpen(false);
      if (response.success) {
        toast({
          title: "Test Deleted Successfully",
          variant: "default",
          duration: 3000,
          className: "bg-gray-100 text-gray-800",
        })
        refetch()
      }
      else{
        toast({
          title: response.message,
          variant: "default",
          duration: 3000,
          className: "bg-red-500 text-white",
        })
        
      }
    }
  }

  if(!tests?.success && !isLoading){
    return(
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">{tests.message}</h1>
      </div>
    )
  }



  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">All Tests</h2>
          <p className="text-gray-500">Manage all your Tests</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">

          <Link href="/admin/tests/add">
            <Button
              variant="outline"
              className=" hover:bg-primary-500 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Test
            </Button>
          </Link>
        </div>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader className="hidden">
            <div className="flex justify-between items-center">
              <CardTitle>Test Management</CardTitle>
              <Link href="/admin/tests/create">
                <Button>Create New Test</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="rounded-md">
            <div className="flex justify-end mb-4">
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Test Link</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Duration (min)</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <span className="animate-spin h-6 w-6 border-2 border-edu-blue border-t-transparent rounded-full mb-2"></span>
                        <span>Loading Tests...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : tests?.data
                  .length > 0 ? tests?.data?.map((test) => (
                    <TableRow key={test.testId}>
                      <TableCell className="font-medium">{test.testId.substring(0, 6)}</TableCell>
                      <TableCell className="truncate">{test.title}</TableCell>
                      <TableCell className="w-48">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm">{getTestLink(test.testId)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleCopyTestLink(test.testId)}
                            aria-label="Copy test link"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="truncate">{test.examType.replace(/_/g, ' ').toLocaleLowerCase()
                        .replace(/\b\w/g, (char) => char.toUpperCase())}</TableCell>
                      <TableCell>{test.examCode}</TableCell>
                      <TableCell>{test.duration}</TableCell>
                      <TableCell>
                        <Badge>
                          {test.visibility.replace(/_/g, ' ').toLocaleLowerCase()
                            .replace(/\b\w/g, (char) => char.toUpperCase())}
                        </Badge>
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
                              className="flex items-center gap-2"
                              onClick={() => router.push(`/admin/tests/${test.testId}/edit`)}
                            >
                              <Edit className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 text-red-600"
                              onClick={() => {
                                setDeleteTestId(test.testId);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )) :
                  (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <AlertCircle className="h-10 w-10 mb-2" />
                          <span className="text-lg font-medium">No test found</span>
                          <span className="text-sm">Try adjusting your filters or add a new test</span>

                          <Link href="/admin/tests/add" >
                            <Button
                              className="mt-4 bg-edu-blue hover:bg-primary-500"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Test
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                }
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>

        <DialogContent className="bg-white p-4 rounded-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this test? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter >
            <DialogClose >Cancel</DialogClose>
            <Button onClick={() => handleDelete(deleteTestId)} >Confirm Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

