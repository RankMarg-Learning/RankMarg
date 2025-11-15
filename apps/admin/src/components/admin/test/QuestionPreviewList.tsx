"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  GripVertical,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VariantProps } from "class-variance-authority";
import { TextFormator } from "@/utils/textFormator";
import { PreviewQuestion, QuestionFulfillmentDialog } from "./components/QuestionFulfillmentDialog";

type SelectedQuestion = PreviewQuestion;

interface ProcessedSection {
  name: string;
  isOptional: boolean;
  maxQuestions?: number;
  correctMarks: number;
  negativeMarks: number;
  questionLimit?: number;
  subjectId?: string;
  questions: SelectedQuestion[];
}

interface QuestionPreviewListProps {
  sections: ProcessedSection[];
  onUpdateSections: (sections: ProcessedSection[]) => void;
  onBack: () => void;
  onCreate: () => void;
  hideActions?: boolean;
  examCode: string;
}

export function QuestionPreviewList({
  sections,
  onUpdateSections,
  onBack,
  onCreate,
  hideActions = false,
  examCode,
}: QuestionPreviewListProps) {
  const [draggedItem, setDraggedItem] = useState<{
    sectionIndex: number;
    questionIndex: number;
  } | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);
  const [isFulfillmentOpen, setIsFulfillmentOpen] = useState(false);

  const totalQuestions = sections.reduce(
    (sum, section) => sum + section.questions.length,
    0
  );

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "Easy";
      case 2:
        return "Medium";
      case 3:
        return "Hard";
      case 4:
        return "Very Hard";
      default:
        return "Unknown";
    }
  };

  const handleDragStart = (sectionIndex: number, questionIndex: number) => {
    setDraggedItem({ sectionIndex, questionIndex });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetSectionIndex: number, targetQuestionIndex: number) => {
    if (!draggedItem) return;

    const newSections = [...sections];
    const sourceSection = newSections[draggedItem.sectionIndex];
    const targetSection = newSections[targetSectionIndex];

    // Remove from source
    const [movedQuestion] = sourceSection.questions.splice(
      draggedItem.questionIndex,
      1
    );

    // Add to target
    if (draggedItem.sectionIndex === targetSectionIndex) {
      targetSection.questions.splice(targetQuestionIndex, 0, movedQuestion);
    } else {
      targetSection.questions.splice(targetQuestionIndex, 0, movedQuestion);
    }

    onUpdateSections(newSections);
    setDraggedItem(null);
  };

  const handleRemoveQuestion = (sectionIndex: number, questionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].questions.splice(questionIndex, 1);
    onUpdateSections(newSections);
  };

  const handleRemoveSection = (sectionIndex: number) => {
    const newSections = sections.filter((_, index) => index !== sectionIndex);
    onUpdateSections(newSections);
  };

  const getSectionStats = (section: ProcessedSection) => {
    const difficultyCount = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    };

    section.questions.forEach((q) => {
      if (q.difficulty in difficultyCount) {
        difficultyCount[q.difficulty as keyof typeof difficultyCount]++;
      }
    });

    return difficultyCount;
  };

  const openFulfillmentDialog = (sectionIndex: number) => {
    setActiveSectionIndex(sectionIndex);
    setIsFulfillmentOpen(true);
  };

  const handleFulfillmentSave = (updatedQuestions: SelectedQuestion[]) => {
    if (activeSectionIndex === null) return;
    const updatedSections = sections.map((section, index) =>
      index === activeSectionIndex ? { ...section, questions: updatedQuestions } : section,
    );
    onUpdateSections(updatedSections);
    setIsFulfillmentOpen(false);
  };

  const activeSection =
    activeSectionIndex !== null ? sections[activeSectionIndex] : null;
  const activeSubjectId = activeSection?.subjectId;

  const getRemainingSlots = (section: ProcessedSection) => {
    if (!section.questionLimit) return 0;
    return Math.max(section.questionLimit - section.questions.length, 0);
  };

  return (
    <div className="space-y-4">
      

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Question Preview & Adjustment</CardTitle>
              <CardDescription>
                Total Sections: {sections.length} | Total Questions: {totalQuestions}
              </CardDescription>
            </div>
            {!hideActions && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Configure
                </Button>
                <Button onClick={onCreate}>
                  Create Test
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <Accordion type="multiple" className="w-full">
            {sections.map((section, sectionIndex) => {
              const stats = getSectionStats(section);
              const remainingSlots = getRemainingSlots(section);
              return (
                <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">{section.name}</span>
                        <Badge variant="secondary">
                          {section.questions.length} Questions
                        </Badge>
                        {section.isOptional && (
                          <Badge variant="outline">Optional</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>+{section.correctMarks}</span>
                        <span>/{` `}-{section.negativeMarks}</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-md">
                        <div className="text-sm">
                          <span className="font-medium">Difficulty Distribution:</span>
                        </div>
                        <div className="flex gap-2">
                          {Object.entries(stats).map(([diff, count]) => (
                            <Badge
                              key={diff}
                              variant={parseInt(diff) as VariantProps<typeof badgeVariants>["variant"]}
                            >
                              {getDifficultyLabel(parseInt(diff))}: {count}
                            </Badge>
                          ))}
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          {section.questionLimit && (
                            <Badge
                              variant={remainingSlots > 0 ? "outline" : "secondary"}
                            >
                              {remainingSlots > 0
                                ? `${remainingSlots} slot${remainingSlots === 1 ? "" : "s"} open`
                                : "Section full"}
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openFulfillmentDialog(sectionIndex)}
                          >
                            Adjust Questions
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveSection(sectionIndex)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Section
                          </Button>
                        </div>
                      </div>

                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12"></TableHead>
                              <TableHead className="w-12">#</TableHead>
                              <TableHead>Question</TableHead>
                              <TableHead>Topic</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Difficulty</TableHead>
                              <TableHead className="w-20">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {section.questions.map((question, questionIndex) => (
                              <TableRow
                                key={question.id}
                                draggable
                                onDragStart={() =>
                                  handleDragStart(sectionIndex, questionIndex)
                                }
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(sectionIndex, questionIndex)}
                                className="cursor-move hover:bg-muted/50"
                              >
                                <TableCell>
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </TableCell>
                                <TableCell className="font-medium">
                                  {questionIndex + 1}
                                </TableCell>
                                <TableCell className="max-w-md">
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium line-clamp-2">
                                      {question.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {question.slug}
                                    </p>
                                    {question.pyqYear && (
                                      <Badge variant="secondary" className="text-xs">
                                        PYQ {question.pyqYear}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                      {question.topic.name}
                                    </p>
                                    {question.subTopic && (
                                      <p className="text-xs text-muted-foreground">
                                        {question.subTopic.name}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="truncate">
                                  <Badge variant="outline">{TextFormator(question.type as string)}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={parseInt(question.difficulty as unknown as string) as VariantProps<typeof badgeVariants>["variant"]}
                                  >
                                    {getDifficultyLabel(question.difficulty)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveQuestion(sectionIndex, questionIndex)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {section.questions.length === 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            This section has no questions. You may want to remove it or go
                            back to reconfigure.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
            </Accordion>
          </div>

          {sections.length === 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No sections available. Please go back and configure at least one section.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <QuestionFulfillmentDialog
        open={isFulfillmentOpen && Boolean(activeSection)}
        onOpenChange={(open) => {
          setIsFulfillmentOpen(open);
          if (!open) {
            setActiveSectionIndex(null);
          }
        }}
        sectionName={activeSection?.name ?? null}
        selectionLimit={
          activeSection
            ? activeSection.questionLimit ?? activeSection.questions.length
            : 0
        }
        currentQuestions={activeSection?.questions ?? []}
        examCode={examCode}
        subjectId={activeSubjectId}
        onSave={handleFulfillmentSave}
      />
    </div>
  );
}

