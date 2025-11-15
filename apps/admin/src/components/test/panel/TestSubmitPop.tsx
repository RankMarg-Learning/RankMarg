"use client"

import { useState } from "react"
import { Button } from "@repo/common-ui"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/common-ui"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/common-ui"
import { QuestionStatus } from "@/utils"
import { useTestContext } from "@/context/TestContext"

interface TestSummaryProps {
  statusCounts: Record<QuestionStatus, number>;
}

const statusLabels: Record<QuestionStatus, string> = {
  [QuestionStatus.NotAnswered]: "Not Answered",
  [QuestionStatus.Answered]: "Answered",
  [QuestionStatus.MarkedForReview]: "Marked for Review",
  [QuestionStatus.AnsweredAndMarked]: "Answered & Marked",
}

export function TestSummaryPopup({ statusCounts }: TestSummaryProps) {
  const { setIsTestComplete } = useTestContext();
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call delay (replace with real API call if needed)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsTestComplete(true);
    setIsSubmitting(false);
    setIsOpen(false);
  }

  const totalQuestions = Object.values(statusCounts).reduce((acc, count) => acc + count, 0)
  const totalAnswered = statusCounts[QuestionStatus.Answered] + statusCounts[QuestionStatus.AnsweredAndMarked]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Submit Test</Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-[700px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Test Summary</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Review your test progress before submitting. You have answered {totalAnswered} out of {totalQuestions} questions.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] min-w-[150px]">Status</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(statusCounts).map(([status, count]) => (
                <TableRow key={status}>
                  <TableCell className="font-medium">{statusLabels[status as QuestionStatus]}</TableCell>
                  <TableCell className="text-right">{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Test"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
