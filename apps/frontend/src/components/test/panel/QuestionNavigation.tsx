"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@repo/common-ui";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@repo/common-ui";
import { ChevronLeft } from 'lucide-react';
import { ScrollArea } from "@repo/common-ui";
import { TestContext } from "@/context/TestContext";
import { useContext } from "react";
import { QuestionStatus } from "@/utils";
import { TestSummaryPopup } from "./TestSubmitPop";
import { TextFormator } from "@/utils/textFormator";

interface ReviewModeProps {
  reviewMode: true;
  currentQuestion: number;
  setCurrentQuestion: (questionNumber: number) => void;
  totalQuestions: number;
  questionsStatus: Record<number, 'correct' | 'incorrect' | 'unattempted'>;
  testSection?: Record<string, any>;
}

interface TestModeProps {
  reviewMode?: false;
}

type QuestionNavigationProps = ReviewModeProps | TestModeProps;

export function QuestionNavigation(props?: QuestionNavigationProps) {
  const isReviewMode = props?.reviewMode === true;

  const contextValue = useContext(TestContext);

  const currentQuestion = isReviewMode ? (props as ReviewModeProps).currentQuestion : (contextValue?.currentQuestion ?? 1);
  const setCurrentQuestion = isReviewMode ? (props as ReviewModeProps).setCurrentQuestion : (contextValue?.setCurrentQuestion ?? (() => { }));
  const totalQuestions = isReviewMode ? (props as ReviewModeProps).totalQuestions : (contextValue?.totalQuestions ?? 0);
  const testSection = isReviewMode ? (props as ReviewModeProps).testSection : contextValue?.testSection;

  const [isOpen, setIsOpen] = useState(false);
  const currentQuestionRef = useRef<HTMLButtonElement | null>(null);

  const testStatusCounts = useMemo(() => {
    if (isReviewMode || !contextValue) return null;
    const counts: Record<QuestionStatus, number> = {
      [QuestionStatus.NotAnswered]: totalQuestions,
      [QuestionStatus.Answered]: 0,
      [QuestionStatus.MarkedForReview]: 0,
      [QuestionStatus.AnsweredAndMarked]: 0,
    };

    Object.values(contextValue.questionsData).forEach(({ status }) => {
      counts[status]++;
      counts[QuestionStatus.NotAnswered]--;
    });

    return counts;
  }, [isReviewMode, contextValue, totalQuestions]);

  const reviewStatusCounts = useMemo(() => {
    if (!isReviewMode || !(props as ReviewModeProps).questionsStatus) return null;
    const counts = {
      correct: 0,
      incorrect: 0,
      unattempted: 0,
    };

    Object.values((props as ReviewModeProps).questionsStatus).forEach((status) => {
      counts[status]++;
    });

    return counts;
  }, [isReviewMode, props]);

  const testStatusClasses = useMemo(
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

  const reviewStatusClasses = useMemo(
    () => ({
      correct: "bg-green-500 text-white hover:bg-green-600",
      incorrect: "bg-red-500 text-white hover:bg-red-600",
      unattempted: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    }),
    []
  );

  const getButtonClassName = (questionNumber: number) => {
    const isCurrentQuestion = questionNumber === currentQuestion;
    const baseClass = "md:h-10 md:w-10 h-9 w-9 p-0 text-sm font-medium flex items-center justify-center";

    if (isReviewMode && (props as ReviewModeProps).questionsStatus) {
      const status = (props as ReviewModeProps).questionsStatus[questionNumber] || 'unattempted';
      return `${baseClass} ${reviewStatusClasses[status]} ${isCurrentQuestion ? "ring-2 ring-offset-2 ring-yellow-300" : ""
        }`;
    } else if (contextValue) {
      const status = contextValue.questionsData[questionNumber]?.status || QuestionStatus.NotAnswered;
      return `${baseClass} ${testStatusClasses[status]} ${isCurrentQuestion ? "ring-2 ring-offset-2 ring-yellow-300" : ""
        }`;
    } else {
      return `${baseClass} ${testStatusClasses[QuestionStatus.NotAnswered]} ${isCurrentQuestion ? "ring-2 ring-offset-2 ring-yellow-300" : ""
        }`;
    }
  };

  const getQuestionStatus = (questionNumber: number): string => {
    if (isReviewMode && (props as ReviewModeProps).questionsStatus) {
      return (props as ReviewModeProps).questionsStatus[questionNumber] || 'unattempted';
    } else if (contextValue) {
      const status = contextValue.questionsData[questionNumber]?.status || QuestionStatus.NotAnswered;
      return status;
    } else {
      return QuestionStatus.NotAnswered;
    }
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
        {isReviewMode && reviewStatusCounts ? (
          <>
            <div className="flex flex-1 items-center gap-1">
              <div className={`h-5 w-5 text-center text-xs rounded-sm justify-center flex items-center ${reviewStatusClasses.correct}`}>
                {reviewStatusCounts.correct}
              </div>
              <span className="text-sm">Correct</span>
            </div>
            <div className="flex flex-1 items-center gap-1">
              <div className={`h-5 w-5 text-center text-xs rounded-sm justify-center flex items-center ${reviewStatusClasses.incorrect}`}>
                {reviewStatusCounts.incorrect}
              </div>
              <span className="text-sm">Incorrect</span>
            </div>
            <div className="flex flex-1 items-center gap-1">
              <div className={`h-5 w-5 text-center text-xs rounded-sm justify-center flex items-center ${reviewStatusClasses.unattempted}`}>
                {reviewStatusCounts.unattempted}
              </div>
              <span className="text-sm">Unattempted</span>
            </div>
          </>
        ) : testStatusCounts ? (
          Object.entries(testStatusCounts).map(([status, count]) => (
            <div key={status} className="flex flex-1 items-center gap-1">
              <div className={`h-5 w-5 text-center text-xs rounded-sm justify-center  ${testStatusClasses[status as QuestionStatus]}`} >
                {count}
              </div>
              <span className="text-sm"> {TextFormator(status.replace(/-/g, ' '))}</span>
            </div>
          ))
        ) : null}
      </div>

      <ScrollArea className="h-[800px] rounded-md border">
        <div className="p-2">
          {testSection && Object.entries(testSection).length > 0 ? (
            Object.entries(testSection).map(([key, value]) => {
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
                        const status = getQuestionStatus(questionNumber);
                        return (
                          <Button
                            key={questionNumber}
                            ref={isCurrent ? currentQuestionRef : null}
                            onClick={() => {
                              setCurrentQuestion(questionNumber);
                              setIsOpen(false);
                            }}
                            className={getButtonClassName(questionNumber)}
                            title={`Question ${questionNumber} - ${status}`}
                          >
                            {questionNumber}
                          </Button>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-wrap gap-2 items-center">
              {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((questionNumber) => {
                const isCurrent = questionNumber === currentQuestion;
                const status = getQuestionStatus(questionNumber);
                return (
                  <Button
                    key={questionNumber}
                    ref={isCurrent ? currentQuestionRef : null}
                    onClick={() => {
                      setCurrentQuestion(questionNumber);
                      setIsOpen(false);
                    }}
                    className={getButtonClassName(questionNumber)}
                    title={`Question ${questionNumber} - ${status}`}
                  >
                    {questionNumber}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {!isReviewMode && testStatusCounts && (
        <div className=" p-2 border-t">
          <TestSummaryPopup statusCounts={testStatusCounts} />
        </div>
      )}
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
        <SheetContent side="right" className="lg:hidden md:hidden w-[240px] sm:w-[280px] p-0 bg-white">
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
