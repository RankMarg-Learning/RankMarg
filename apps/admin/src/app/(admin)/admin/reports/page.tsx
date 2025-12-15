"use client";

import { Suspense, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@repo/common-ui";
import { Button } from "@repo/common-ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@repo/common-ui";
import {
  AlertCircle,
  Search,
  Filter,
  X,
  MessageSquare,
  Trash,
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
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { getAllReports, deleteReport } from "@/services/report.service";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

function ReportsContent() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialPageFromUrl = Number(searchParams.get("page") || "1");
  const [currentPage, setCurrentPage] = useState<number>(
    Number.isNaN(initialPageFromUrl) || initialPageFromUrl < 1 ? 1 : initialPageFromUrl
  );
  const limit = 25;

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "all");

  const { data: reports, refetch, isLoading } = useQuery({
    queryKey: ["reports", currentPage, searchQuery, typeFilter],
    queryFn: () => getAllReports({
      page: currentPage,
      limit,
      search: searchQuery || undefined,
      type: typeFilter === "all" ? undefined : typeFilter
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

  const updateFiltersInUrl = (search: string, type: string) => {
    const params = new URLSearchParams(searchParams);

    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }

    if (type !== "all") {
      params.set("type", type);
    } else {
      params.delete("type");
    }

    params.delete("page");

    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    updateFiltersInUrl(value, typeFilter);
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
    updateFiltersInUrl(searchQuery, value);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
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
    const typeFromUrl = searchParams.get("type") || "all";

    if (searchFromUrl !== searchQuery) {
      setSearchQuery(searchFromUrl);
    }
    if (typeFromUrl !== typeFilter) {
      setTypeFilter(typeFromUrl);
    }
  }, [searchParams, searchQuery, typeFilter]);

  const handleDelete = async (reportId: string) => {
    if (reportId) {
      const data = await deleteReport(reportId);
      setIsDeleteDialogOpen(false);
      setDeleteReportId(null);
      if (data.success) {
        toast({
          title: "Success! Report Deleted Successfully",
          variant: "default",
          duration: 3000,
          className: "bg-gray-100 text-gray-800",
        });
        refetch();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete report",
          className: "bg-red-500 text-white"
        });
      }
    }
  };

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      "Incorrect Answer": "bg-red-500 text-white",
      "Poor Quality": "bg-orange-500 text-white",
      "Inappropriate Content": "bg-purple-500 text-white",
      "Spelling/Grammar Error": "bg-yellow-500 text-black",
      "Duplicate Question": "bg-blue-500 text-white",
      "Other": "bg-gray-500 text-white",
    };

    return (
      <Badge className={typeColors[type] || "bg-gray-500 text-white"}>
        {type}
      </Badge>
    );
  };

  if (!reports?.success && !isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <AlertCircle className="h-10 w-10 mb-2" />
          <span className="text-lg font-medium">Error fetching reports</span>
          <span className="text-sm">Please try again later</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Question Reports</h2>
          <p className="text-gray-500">Manage and review all question reports</p>
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
                placeholder="Search by question title, feedback, or slug..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Incorrect Answer">Incorrect Answer</SelectItem>
                  <SelectItem value="Poor Quality">Poor Quality</SelectItem>
                  <SelectItem value="Inappropriate Content">Inappropriate Content</SelectItem>
                  <SelectItem value="Spelling/Grammar Error">Spelling/Grammar Error</SelectItem>
                  <SelectItem value="Duplicate Question">Duplicate Question</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || typeFilter !== "all") && (
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
        {(searchQuery || typeFilter !== "all") && (
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
            {typeFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Type: {typeFilter}
                <button
                  onClick={() => handleTypeFilterChange("all")}
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
                <TableHead>Question</TableHead>
                <TableHead>Report Type</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead className="text-center">Total Reports</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <span className="animate-spin h-6 w-6 border-2 border-edu-blue border-t-transparent rounded-full mb-2"></span>
                      <span>Loading reports...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : reports?.data?.reports?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <MessageSquare className="h-10 w-10 mb-2" />
                      <span className="text-lg font-medium">No reports found</span>
                      <span className="text-sm">Try adjusting your filters</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                reports?.data?.reports?.map((report: any) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium max-w-[200px] truncate">
                          {report.question?.title || report.slug}
                        </div>
                        <div className="text-xs text-gray-500 font-mono truncate max-w-[200px]">
                          {report.slug}
                        </div>
                        {report.question?.subject && (
                          <div className="text-xs text-gray-400">
                            {report.question.subject.name}
                            {report.question.topic && ` • ${report.question.topic.name}`}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(report.type)}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="text-sm">
                        {report.feedback || (
                          <span className="text-gray-400 italic">No feedback provided</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {report.user?.name || report.user?.email || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-center">
                      {report.reportCount > 0 ? (
                        <Badge className="bg-red-500 text-white">
                          {report.reportCount}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {report.question && (
                          <Link href={`/admin/questions/${report.slug}/reports`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <MessageSquare className="h-3 w-3" />
                              View All
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeleteReportId(report.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{" "}
            <span className="font-medium">
              {(currentPage - 1) * limit + (reports?.data?.reports?.length || 0)}
            </span> of <span className="font-medium">{reports?.data?.totalCount || 0}</span> results
            {(searchQuery || typeFilter !== "all") && (
              <span className="ml-2 text-xs text-gray-400">(filtered)</span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => goToPage(prev => prev - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= (reports?.data?.totalPages || 1)}
              onClick={() => goToPage(prev => prev + 1)}
            >
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
              Are you sure you want to delete this report? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button
              onClick={() => handleDelete(deleteReportId!)}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Reports() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-10 text-gray-500">Loading...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
