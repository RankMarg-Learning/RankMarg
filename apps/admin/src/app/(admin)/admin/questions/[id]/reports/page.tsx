"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  MessageSquare,
  Trash,
  ExternalLink,
  Edit,
} from "lucide-react";

import { Button } from "@repo/common-ui";
import { Badge } from "@repo/common-ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@repo/common-ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/common-ui";
import { getReportsByQuestionSlug, deleteReport } from "@/services/report.service";

interface ReportDetail {
  id: string;
  type: string;
  feedback: string | null;
  createdAt: string;
}

function QuestionReportsContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.id as string;
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);

  const { data: reportDetails, refetch, isLoading } = useQuery({
    queryKey: ["questionReports", slug],
    queryFn: () => getReportsByQuestionSlug(slug, { page: 1, limit: 100 }),
  });

  const handleDelete = async (reportId: string) => {
    try {
      await deleteReport(reportId);
      setIsDeleteDialogOpen(false);
      setDeleteReportId(null);
      refetch();
    } catch (error) {
      console.error("Error deleting report:", error);
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

  const handleEditQuestion = () => {
    router.push(`/admin/questions/${slug}/edit`);
  };

  const handleViewQuestion = () => {
    window.open(`/question/${slug}`, '_blank');
  };

  if (!reportDetails?.success && !isLoading) {
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Question Reports</h1>
              <p className="text-sm text-gray-500 font-mono max-w-2xl truncate">
                {slug}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditQuestion}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Question
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewQuestion}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Question
            </Button>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <span className="animate-spin h-6 w-6 border-2 border-edu-blue border-t-transparent rounded-full mb-2"></span>
                        <span>Loading reports...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : reportDetails?.data?.reports?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <MessageSquare className="h-10 w-10 mb-2" />
                        <span className="text-lg font-medium">No reports found</span>
                        <span className="text-sm">This question has no reports</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  reportDetails?.data?.reports?.map((report: ReportDetail) => (
                    <TableRow key={report.id}>
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
                      <TableCell className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Summary */}
        {reportDetails?.data?.reports?.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Report Summary</span>
            </div>
            <p className="text-sm text-blue-700">
              This question has received <strong>{reportDetails.data.total}</strong> report(s).
              Consider reviewing the feedback and making necessary improvements.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
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

export default function QuestionReports() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-10 text-gray-500">Loading...</div>}>
      <QuestionReportsContent />
    </Suspense>
  );
}