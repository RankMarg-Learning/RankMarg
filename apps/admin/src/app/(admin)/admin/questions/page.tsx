"use client"
import { Suspense, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,  DialogDescription, DialogClose } from "@repo/common-ui";

import { Button } from "@repo/common-ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@repo/common-ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@repo/common-ui";
import {
  Edit,
  MoreHorizontal,
  Plus,
  Trash,
  AlertCircle,
  Search,
  Filter,
  X,
  MessageSquare
} from "lucide-react";
import { Badge } from "@repo/common-ui";
import { Input } from "@repo/common-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/common-ui";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { deleteQuestion, getQuestionByFilter } from "@/services/question.service";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { QuestionType } from "@repo/db/enums";


function QuestionsContent() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteQuestionSlug, setDeleteQuestionSlug] = useState(null);
  const router = useRouter()
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialPageFromUrl = Number(searchParams.get("page") || "1");
  const [currentPage, setCurrentPage] = useState<number>(
    Number.isNaN(initialPageFromUrl) || initialPageFromUrl < 1 ? 1 : initialPageFromUrl
  );
  const limit = 25;
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; question: any } | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [publishFilter, setPublishFilter] = useState(searchParams.get("published") || "all");
  const [reportFilter, setReportFilter] = useState(searchParams.get("reports") || "all");

  const { data: questions, refetch ,isLoading } = useQuery({
    queryKey: ["questions", currentPage, searchQuery, publishFilter, reportFilter],
    queryFn: () => getQuestionByFilter({ 
      page: currentPage, 
      limit,
      search: searchQuery || undefined,
      isPublished: publishFilter === "all" ? undefined : publishFilter === "published",
      reports: reportFilter === "all" ? undefined : reportFilter
    })
  });
  
  const updatePageInUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    if (newPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const updateFiltersInUrl = (search: string, published: string, reports: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    
    if (published !== "all") {
      params.set("published", published);
    } else {
      params.delete("published");
    }
    
    if (reports !== "all") {
      params.set("reports", reports);
    } else {
      params.delete("reports");
    }
    
    params.delete("page");
    
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    updateFiltersInUrl(value, publishFilter, reportFilter);
  };

  const handlePublishFilterChange = (value: string) => {
    setPublishFilter(value);
    setCurrentPage(1);
    updateFiltersInUrl(searchQuery, value, reportFilter);
  };

  const handleReportFilterChange = (value: string) => {
    setReportFilter(value);
    setCurrentPage(1);
    updateFiltersInUrl(searchQuery, publishFilter, value);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPublishFilter("all");
    setReportFilter("all");
    setCurrentPage(1);
    router.replace(pathname, { scroll: false });
  };

  const goToPage = (updater: (prev: number) => number) => {
    setCurrentPage(prev => {
      const nextPage = updater(prev);
      const normalized = nextPage < 1 ? 1 : nextPage;
      updatePageInUrl(normalized);
      return normalized;
    });
  };

  useEffect(() => {
    const pageFromUrl = Number(searchParams.get("page") || "1");
    const normalized = Number.isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;
    if (normalized !== currentPage) {
      setCurrentPage(normalized);
    }
  }, [searchParams]);

  useEffect(() => {
    const searchFromUrl = searchParams.get("search") || "";
    const publishedFromUrl = searchParams.get("published") || "all";
    const reportsFromUrl = searchParams.get("reports") || "all";
    
    if (searchFromUrl !== searchQuery) {
      setSearchQuery(searchFromUrl);
    }
    if (publishedFromUrl !== publishFilter) {
      setPublishFilter(publishedFromUrl);
    }
    if (reportsFromUrl !== reportFilter) {
      setReportFilter(reportsFromUrl);
    }
  }, [searchParams, searchQuery, publishFilter, reportFilter]);
  
  

  const handleDelete = async (slug: string) => {
    if (slug) {
     const data = await deleteQuestion(slug);
      setIsDeleteDialogOpen(false);
      if(data.success) {
        toast({
          title: "Success! Question Deleted Successfully",
          variant: "default",
          duration: 3000,
          className: "bg-gray-100 text-gray-800",
        })
        refetch();
      }else{
        toast({ title: "Error", description: "Failed to delete question", color: "white", className: "bg-red-500 text-white" })
      }
      
    }
  };

  const getDifficultyBadge = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return <Badge variant="Easy">Easy</Badge>;
      case 2:
        return <Badge variant="Medium">Medium</Badge>;
      case 3:
        return <Badge variant="Hard">Hard</Badge>;
      case 4:
        return <Badge className="bg-red-500">Very Hard</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: QuestionType) => {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
        return <Badge variant="outline">Single Correct</Badge>;
      case QuestionType.INTEGER:
        return <Badge variant="outline">Integer</Badge>;
      case QuestionType.SUBJECTIVE:
        return <Badge variant="outline">Subjective</Badge>;
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

      {/* Filter Section */}
      <div className="mb-6 bg-white p-4 rounded-lg border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search questions by title or content..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Published Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={publishFilter} onValueChange={handlePublishFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Questions</SelectItem>
                  <SelectItem value="published">Published Only</SelectItem>
                  <SelectItem value="unpublished">Unpublished Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reports Filter */}
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              <Select value={reportFilter} onValueChange={handleReportFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by reports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Questions</SelectItem>
                  <SelectItem value="reported">Reported Questions</SelectItem>
                  <SelectItem value="not-reported">Not Reported</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Clear Filters Button */}
          {(searchQuery || publishFilter !== "all" || reportFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
        
        {/* Active Filters Display */}
        {(searchQuery || publishFilter !== "all" || reportFilter !== "all") && (
          <div className="mt-3 flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{searchQuery}"
                <button
                  onClick={() => handleSearchChange("")}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {publishFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {publishFilter === "published" ? "Published" : "Unpublished"}
                <button
                  onClick={() => handlePublishFilterChange("all")}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {reportFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Reports: {reportFilter === "reported" ? "Reported" : "Not Reported"}
                <button
                  onClick={() => handleReportFilterChange("all")}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
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
                <TableHead>Subject</TableHead>
                <TableHead className="text-center">Topic</TableHead>
                <TableHead className="text-center">Published</TableHead>
                <TableHead className="text-center">Reports</TableHead>
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
              ) : questions?.data?.questions?.length === 0 ? (
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
                    <TableRow 
                      key={question.id}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ x: e.pageX, y: e.pageY, question });
                      }}
                    >
                      <TableCell className="font-medium">{question.id.substring(0, 6)}</TableCell>
                      <TableCell className="max-w-[250px] truncate">{question.title}</TableCell>
                      <TableCell>{getTypeBadge(question.type)}</TableCell>
                      <TableCell>{getDifficultyBadge(question.difficulty)}</TableCell>
                      <TableCell>{question?.subject?.name || "-"}</TableCell>
                      <TableCell className="max-w-[150px] truncate">
                      {question?.topic?.name || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {question.isPublished ? (
                          <Badge variant="Easy">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {question.reportCount > 0 ? (
                          <Badge className="bg-red-500 text-white">
                            {question.reportCount}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
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
                            {question.reportCount > 0 && (
                              <DropdownMenuItem
                                className="flex items-center gap-2"
                                onClick={() => router.push(`/admin/questions/${question.slug}/reports`)}
                              >
                                <MessageSquare className="h-4 w-4" /> View Reports ({question.reportCount})
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={() => router.push(`/admin/questions/${question.slug}/edit?page=${currentPage}&published=${publishFilter}&reports=${reportFilter}`)}
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
            Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to <span className="font-medium">{(currentPage - 1) * limit + (questions?.data?.questions?.length || 0)}</span> of <span className="font-medium">{questions?.data?.totalCount || 0}</span> results
            {(searchQuery || publishFilter !== "all" || reportFilter !== "all") && (
              <span className="ml-2 text-xs text-gray-400">
                (filtered)
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => goToPage(prev => prev - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage >= (questions?.data?.totalPages || 1)} onClick={() => goToPage(prev => prev + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>

      <DropdownMenu open={!!contextMenu} onOpenChange={() => setContextMenu(null)}>
        <DropdownMenuContent 
          style={{ 
            position: 'absolute', 
            left: `${contextMenu?.x}px`, 
            top: `${contextMenu?.y}px`, 
            zIndex: 1000 
          }}
        >
          <DropdownMenuItem 
            className="flex items-center gap-2"
            onClick={() => {
              router.push(`/admin/questions/${contextMenu.question.slug}/edit?page=${currentPage}&published=${publishFilter}&reports=${reportFilter}`);
              setContextMenu(null);
            }}
          >
            <Edit className="h-4 w-4" /> Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

export default function Tests() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-10 text-gray-500">Loading...</div>}>
      <QuestionsContent />
    </Suspense>
  )
}

