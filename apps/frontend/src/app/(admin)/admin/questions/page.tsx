"use client"
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,  DialogDescription, DialogClose } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Edit,
  MoreHorizontal,
  Plus,
  Trash,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { deleteQuestion, getAllQuestions } from "@/services/question.service";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { QuestionType } from "@prisma/client";


export default function Tests() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteQuestionSlug, setDeleteQuestionSlug] = useState(null);
  const router = useRouter()

  const { data: questions, refetch ,isLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: () => getAllQuestions()
  });
  
  

  const handleDelete = async (slug: string) => {
    if (slug) {
     const data = await deleteQuestion(slug);
      setIsDeleteDialogOpen(false);
      if(data.success) {
        toast({ title: "Success", description: "Question Deleted Successfully", color: "white", className: "bg-green-500" })
        refetch();
      }else{
        toast({ title: "Error", description: "Failed to delete question", color: "white", className: "bg-red-500 text-white" })
      }
      
    }
  };

  const getDifficultyBadge = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return <Badge className="bg-green-500">Easy</Badge>;
      case 2:
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 3:
        return <Badge className="bg-orange-500">Hard</Badge>;
      case 4:
        return <Badge className="bg-red-500">Very Hard</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: QuestionType) => {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
        return <Badge className="bg-edu-blue">Single Correct</Badge>;
      case QuestionType.INTEGER:
        return <Badge className="bg-edu-teal">Integer</Badge>;
      case QuestionType.SUBJECTIVE:
        return <Badge className="bg-purple-500">Subjective</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if(!questions?.success && !isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <AlertCircle className="h-10 w-10 mb-2" />
          <span className="text-lg font-medium">Error fetching questions</span>
          <span className="text-sm">Please try again later</span>
        </div>
      </div>
    )
  }
  

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">All Questions</h2>
          <p className="text-gray-500">Manage all your exam questions</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">

          <Link href="/admin/questions/add">
            <Button
              variant="outline"
              className=" hover:bg-primary-500 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Stream</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-center">Topic</TableHead>
                <TableHead className="text-center">Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <span className="animate-spin h-6 w-6 border-2 border-edu-blue border-t-transparent rounded-full mb-2"></span>
                      <span>Loading questions...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : questions?.data?.questions
                .length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <AlertCircle className="h-10 w-10 mb-2" />
                      <span className="text-lg font-medium">No questions found</span>
                      <span className="text-sm">Try adjusting your filters or add a new question</span>
                      <Link href="/admin/questions/add">
                        <Button
                          className="mt-4 bg-edu-blue hover:bg-primary-500"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Question
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                questions?.data?.questions
                  .map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">{question.id.substring(0, 6)}</TableCell>
                      <TableCell className="max-w-[250px] truncate">{question.title}</TableCell>
                      <TableCell>{getTypeBadge(question.type)}</TableCell>
                      <TableCell>{getDifficultyBadge(question.difficulty)}</TableCell>
                      <TableCell>{question.stream || "-"}</TableCell>
                      <TableCell>{question?.subject?.name || "-"}</TableCell>
                      <TableCell className="max-w-[150px] truncate">
                      {question?.topic?.name || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {question.isPublished ? (
                          <Badge className="bg-green-500">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
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
                              onClick={() => router.push(`/admin/questions/${question.slug}/edit`)}
                            >
                              <Edit className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 text-red-600"
                              onClick={() => {
                                setDeleteQuestionSlug(question.slug);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{questions?.data.currentPage}</span> of <span className="font-medium">{questions?.data.totalPages}</span> results
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
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
            <Button onClick={() => handleDelete(deleteQuestionSlug)} >Confirm Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

