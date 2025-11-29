"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@repo/common-ui";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@repo/common-ui";
import {  ChevronLeft } from 'lucide-react';
import { ScrollArea } from "@repo/common-ui";
import { useTestContext } from "@/context/TestContext";
import { QuestionStatus } from "@/utils";
import { TestSummaryPopup } from "./TestSubmitPop";
import { TextFormator } from "@/utils/textFormator";



export function QuestionNavigation() {
  const { currentQuestion, setCurrentQuestion, totalQuestions, questionsData, testSection } = useTestContext();

  const [isOpen, setIsOpen] = useState(false);
  const currentQuestionRef = useRef<HTMLButtonElement | null>(null);

  const statusCounts = useMemo(() => {
    const counts: Record<QuestionStatus, number> = {
      [QuestionStatus.NotAnswered]: totalQuestions,
      [QuestionStatus.Answered]: 0,
      [QuestionStatus.MarkedForReview]: 0,
      [QuestionStatus.AnsweredAndMarked]: 0,
    };

    Object.values(questionsData).forEach(({ status }) => {
      counts[status]++;
      counts[QuestionStatus.NotAnswered]--;
    });

    return counts;
  }, [questionsData, totalQuestions]);

  const statusClasses = useMemo(
    () => ({
      [QuestionStatus.Answered]: "bg-green-500 text-white hover:bg-green-600",
      [QuestionStatus.NotAnswered]:
        "bg-gray-200 text-gray-700 hover:bg-gray-300",
      [QuestionStatus.MarkedForReview]:
        "bg-purple-500 text-white hover:bg-purple-600",
      [QuestionStatus.AnsweredAndMarked]:
        "bg-purple-700 text-white hover:bg-purple-800",
    }),
    []
  );

  const getButtonClassName = (questionNumber: number) => {
    const status = questionsData[questionNumber]?.status || QuestionStatus.NotAnswered;
    const isCurrentQuestion = questionNumber === currentQuestion;

    const baseClass = "md:h-10 md:w-10 h-9 w-9 p-0 text-sm font-medium";

    return `${baseClass} ${statusClasses[status]} ${
      isCurrentQuestion ? "ring-2 ring-offset-2 ring-yellow-300" : ""
    }`;
  };

  useEffect(() => {
    if (currentQuestionRef.current) {
      currentQuestionRef.current.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "nearest",
      });
    }
  }, [currentQuestion, isOpen]);
  

  const NavigationContent = () => (
    <div className="flex flex-col   h-full md:h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-3.5rem)]  ">
      <div className="p-2 border-b space-y-3 mt-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="flex flex-1 items-center gap-1">
            <div className={`h-5 w-5 text-center text-sm rounded-sm justify-center  ${statusClasses[status as QuestionStatus]}`} >
              {count}
            </div>
            <span className="text-sm "> {TextFormator(status.replace(/-/g, ' '))}</span>
          </div>
        ))}
      </div>

      <ScrollArea className="h-[800px] rounded-md border">
        <div className="p-2">
          {testSection && Object.entries(testSection).map(([key, value]) => {
            const [sectionName, range] = key.split('_');
            const [start, end] = range.split('-').map(Number);
            const isSingleSection = Object.keys(testSection).length === 1;

            return (
              <div key={key} className=" mb-4  ">
                {!isSingleSection && (
                  <div className="text-left text-xs font-semibold text-gray-700 mb-2">
                    {sectionName} 
                    {value.maxQuestions > 0 && ` (Any ${value.maxQuestions})`}
                  </div>
                )}

                <div className="flex flex-wrap gap-2  items-center">
                  {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(
                    (questionNumber) => {
                      const isCurrent = questionNumber === currentQuestion;
                      return (
                        <Button
                          key={questionNumber}
                          ref={isCurrent ? currentQuestionRef : null}
                          onClick={() => {
                            setCurrentQuestion(questionNumber);
                            setIsOpen(false);
                          }}
                          className={getButtonClassName(questionNumber)}
                        >
                          {questionNumber}
                        </Button>
                      );
                    }
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>


      <div className=" p-2 border-t">
        <TestSummaryPopup statusCounts={statusCounts} />
        {/* <Button
          className="w-full"
          onClick={handleOnSubmit}
        >
          Submit Test
        </Button> */}
      </div>
    </div>
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen} >
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-1/2 -translate-y-1/2 -right-1 z-50 lg:hidden bg-yellow-400 shadow-lg border-yellow-600 h-24 w-6 rounded-l-lg rounded-r-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent  side="right" className="lg:hidden md:hidden w-[240px] sm:w-[280px] p-0 bg-white">
          <SheetHeader className="hidden">
            <SheetTitle>Question Line</SheetTitle>
            <SheetDescription>
              Navigate to any question
            </SheetDescription>
          </SheetHeader>

          <NavigationContent />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block w-1/6 border-l">
        <NavigationContent />
      </div>
    </>
  );
}
