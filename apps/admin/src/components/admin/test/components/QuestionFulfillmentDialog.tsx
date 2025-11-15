"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/common-ui";
import { Button } from "@repo/common-ui";
import { Badge } from "@repo/common-ui";
import Questionset from "@/components/questions/QuestionTable";
import type { QuestionSelection } from "@/components/questions/QuestionTable";
import type { QuestionFormat, QuestionType } from "@repo/db/enums";
import { toast } from "@/hooks/use-toast";

export interface PreviewQuestion {
  id: string;
  title: string;
  slug: string;
  difficulty: number;
  type: QuestionType | string;
  format: QuestionFormat | string;
  subject: {
    id?: string;
    name: string;
    shortName?: string;
  };
  topic: {
    id?: string;
    name: string;
    weightage?: number;
  };
  subTopic?: {
    id?: string;
    name: string;
  };
  category?: { category: string }[];
  pyqYear?: string;
}

interface QuestionFulfillmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionName: string | null;
  selectionLimit: number;
  currentQuestions: PreviewQuestion[];
  examCode: string;
  subjectId?: string;
  onSave: (questions: PreviewQuestion[]) => void;
}

export function QuestionFulfillmentDialog({
  open,
  onOpenChange,
  sectionName,
  selectionLimit,
  currentQuestions,
  examCode,
  subjectId,
  onSave,
}: QuestionFulfillmentDialogProps) {
  const effectiveLimit = useMemo(
    () => Math.max(selectionLimit || 0, currentQuestions.length || 0),
    [currentQuestions.length, selectionLimit],
  );

  const [localSelection, setLocalSelection] = useState<PreviewQuestion[]>(
    currentQuestions,
  );

  useEffect(() => {
    if (open) {
      setLocalSelection(currentQuestions);
    }
  }, [currentQuestions, open]);

  const remainingSlots = Math.max(effectiveLimit - localSelection.length, 0);

  const mapToPreviewQuestion = (question: QuestionSelection): PreviewQuestion => ({
    id: question.id,
    title: question.title ?? "Untitled Question",
    slug: question.slug ?? question.id,
    difficulty: question.difficulty ?? 0,
    type: question.type ?? "UNKNOWN",
    format: question.format ?? "SINGLE_SELECT",
    subject: question.subject ?? { name: "Unknown" },
    topic: question.topic ?? { name: "General", weightage: 0 },
    subTopic: question.subTopic,
    category: question.category,
    pyqYear: question.pyqYear,
  });

  const handleSelectionChange = (questions: QuestionSelection[]) => {
    const normalized = questions.map(mapToPreviewQuestion);
    if (normalized.length > effectiveLimit) {
      toast({
        title: "Section limit reached",
        description: `You can only keep ${effectiveLimit} questions in this section.`,
        variant: "destructive",
      });
      setLocalSelection(normalized.slice(0, effectiveLimit));
      return;
    }
    setLocalSelection(normalized);
  };

  const handleSave = () => {
    onSave(localSelection);
  };

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-5xl p-4 sm:p-6 max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            Adjust Questions{sectionName ? ` • ${sectionName}` : ""}
          </DialogTitle>
          <DialogDescription>
            Replace or add questions from the bank. This section supports up to {" "}
            <strong>{effectiveLimit}</strong> {effectiveLimit === 1 ? "question" : "questions"}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-full flex-col gap-4">
          <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-1">
            <div className="flex flex-col gap-3 rounded-md border p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">
              {remainingSlots > 0
                ? `${remainingSlots} additional ${remainingSlots === 1 ? "slot" : "slots"} available`
                : "All slots are currently filled"}
            </span>
            <Badge
              variant={remainingSlots > 0 ? "outline" : "default"}
              className="self-start sm:self-auto"
            >
              {localSelection.length} / {effectiveLimit}
            </Badge>
          </div>

          <Questionset
            selectedQuestions={localSelection}
            onSelectedQuestionsChange={handleSelectionChange}
            isCheckBox
            isPublished
            examCode={examCode}
            lockedSubjectId={subjectId}
            maxSelectable={effectiveLimit}
            onSelectionLimitReached={() =>
              toast({
                title: "Section limit reached",
                description: `You can only keep ${effectiveLimit} questions in this section.`,
                variant: "destructive",
              })
            }
          />
          </div>

          <div className="border-t border-muted pt-3 sm:pt-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={localSelection.length === 0}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
