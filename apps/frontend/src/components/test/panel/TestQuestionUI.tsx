"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Badge } from "@repo/common-ui";
import Options from "@/components/Options";
import { useTestContext } from "@/context/TestContext";
import MarkdownRenderer from "@/lib/MarkdownRenderer";
import TimeSpendOnQuestion from "@/utils/test/TimeSpendOnQuestion";
import { QuestionStatus } from "@/utils";
import { QuestionType } from "@repo/db/enums";

/**
 * TestQuestionUI - A streamlined question display component for test mode
 * 
 * This component displays questions during a test without showing solutions,
 * hints, or other practice-mode features. It focuses on:
 * - Clean question and options display
 * - Test-specific actions (Save, Mark for Review, Clear)
 * - Time tracking per question
 * - Navigation between questions
 */
export function TestQuestionUI() {
  // State for the Options component interface
  const [selectedValues, setSelectedValues] = useState<number[]>([]);
  const [numericalValue, setNumericalValue] = useState<number | null>(null);

  const {
    questions,
    currentQuestion,
    setCurrentQuestion,
    totalQuestions,
    setQuestionsData,
    questionsData,
    testSection,
  } = useTestContext();

  // Memoized values for optimization
  const question = useMemo(
    () => questions?.[currentQuestion - 1],
    [questions, currentQuestion]
  );
  const options = useMemo(() => question?.options || [], [question]);

  // Question type flags
  const questionTypes = useMemo(
    () => ({
      isLastQuestion: currentQuestion === totalQuestions,
      isNumerical: question?.type === "INTEGER",
      isSingleChoice:
        question?.type === "MULTIPLE_CHOICE" &&
        question?.format !== "MULTIPLE_SELECT",
      isMultipleChoice:
        question?.type === "MULTIPLE_CHOICE" &&
        question?.format === "MULTIPLE_SELECT",
    }),
    [currentQuestion, totalQuestions, question?.type, question?.format]
  );

  // Calculate marks based on question section
  const getMarks = useCallback(
    (questionIndex: number) => {
      if (!testSection || Object.keys(testSection).length === 0) {
        return { correctMarks: 0, negativeMarks: 0 };
      }

      for (const [key, value] of Object.entries(testSection)) {
        const range = key.split("_")[1];
        const [start, end] = range.split("-").map(Number);

        if (questionIndex >= start && questionIndex <= end) {
          return {
            correctMarks: value.correctMarks,
            negativeMarks: value.negativeMarks > 0 ? -value.negativeMarks : 0,
          };
        }
      }

      return { correctMarks: 0, negativeMarks: 0 };
    },
    [testSection]
  );

  // Handle selection changes
  const handleSelectionChange = useCallback((values: number[]) => {
    setSelectedValues(values);
  }, []);

  // Handle numerical value changes
  const handleNumericalChange = useCallback((value: number | null) => {
    setNumericalValue(value);
  }, []);

  // Load saved answers when navigating between questions
  useEffect(() => {
    const currentQuestionData =
      questionsData[currentQuestion]?.selectedOptions || [];

    if (currentQuestionData.length > 0) {
      if (questionTypes.isNumerical) {
        // For numerical questions, store as numerical value
        const numValue = Number(currentQuestionData[0]);
        setNumericalValue(isNaN(numValue) ? null : numValue);
        setSelectedValues([]);
      } else {
        // For choice questions, store as array of indices
        setSelectedValues(currentQuestionData);
        setNumericalValue(null);
      }
    } else {
      // Reset when no saved answer
      setSelectedValues([]);
      setNumericalValue(null);
    }
  }, [currentQuestion, questionsData, questionTypes.isNumerical]);

  // Get current selection based on question type
  const getCurrentSelection = useCallback(() => {
    if (questionTypes.isNumerical) {
      return numericalValue !== null ? [numericalValue] : [];
    } else {
      return selectedValues;
    }
  }, [questionTypes.isNumerical, numericalValue, selectedValues]);

  // Determine question status
  const getQuestionStatus = useCallback((isMarked: boolean, hasAnswer: boolean) => {
    if (isMarked) {
      return hasAnswer
        ? QuestionStatus.AnsweredAndMarked
        : QuestionStatus.MarkedForReview;
    }
    return hasAnswer ? QuestionStatus.Answered : QuestionStatus.NotAnswered;
  }, []);

  // Update question data
  const updateQuestionData = useCallback(
    (isMarked = false) => {
      const currentSelection = getCurrentSelection();
      const hasAnswer = currentSelection.length > 0;
      const questionType = questionTypes.isMultipleChoice ? "multiple" : "single";

      setQuestionsData((prev) => ({
        ...prev,
        [currentQuestion]: {
          ...prev[currentQuestion],
          selectedOptions: currentSelection,
          status: getQuestionStatus(isMarked, hasAnswer),
          type: question?.type === "INTEGER" ? "integer" : questionType,
          submittedAt: new Date(),
        },
      }));

      return { hasAnswer };
    },
    [
      currentQuestion,
      getCurrentSelection,
      getQuestionStatus,
      question?.type,
      questionTypes.isMultipleChoice,
      setQuestionsData,
    ]
  );

  // Handler: Mark for review
  const onMarkForReview = useCallback(() => {
    updateQuestionData(true);

    if (!questionTypes.isLastQuestion) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedValues([]);
      setNumericalValue(null);
    }
  }, [
    currentQuestion,
    questionTypes.isLastQuestion,
    setCurrentQuestion,
    updateQuestionData,
  ]);

  // Handler: Clear response
  const onClearResponse = useCallback(() => {
    setQuestionsData((prev) => ({
      ...prev,
      [currentQuestion]: {
        ...prev[currentQuestion],
        status: QuestionStatus.NotAnswered,
        selectedOptions: [],
        submittedAt: new Date(),
      },
    }));

    setSelectedValues([]);
    setNumericalValue(null);
  }, [currentQuestion, setQuestionsData]);

  // Handler: Save and next (or just Next when not answered)
  const onSaveAndNext = useCallback(() => {
    // Always record timing & status, even if unanswered
    updateQuestionData(false);

    if (!questionTypes.isLastQuestion) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedValues([]);
      setNumericalValue(null);
    }
  }, [currentQuestion, questionTypes.isLastQuestion, setCurrentQuestion, updateQuestionData]);

  const hasAnswer = useMemo(
    () =>
      questionTypes.isNumerical
        ? numericalValue !== null
        : selectedValues.length > 0,
    [questionTypes.isNumerical, numericalValue, selectedValues.length]
  );

  const marks = getMarks(currentQuestion);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Question Header with metadata */}
      <div className="flex sm:flex-row sm:items-center justify-between p-2 sm:p-3 border-b space-y-2 sm:space-y-0">
        <div className="flex items-center gap-1 justify-between">
          <Badge variant="outline">
            {currentQuestion} / {totalQuestions}
          </Badge>
          <div className="flex gap-1">
            <Badge variant="outline" className="flex items-center gap-1">
              <span>Marks:</span>
              <span className="text-green-600">+{marks.correctMarks}</span>
              <span>/</span>
              <span className="text-red-500">{marks.negativeMarks}</span>
            </Badge>
            <TimeSpendOnQuestion currentQuestion={currentQuestion} />
          </div>
        </div>
      </div>

      {/* Question Content - Two Column Layout */}
      <div className="flex-1 overflow-auto default-scroll">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Column: Question Text */}
          <div className="lg:flex-1 lg:w-1/2 p-4 sm:p-6 pb-8 border-b lg:border-b-0 lg:border-r noselect">
            <h2 className="text-lg font-bold mb-4">Question</h2>
            <MarkdownRenderer content={question?.content || ""} />
          </div>

          {/* Right Column: Options */}
          <div className="flex-1 lg:w-1/2 p-4 sm:p-6 noselect">
            <Options
              type={question?.type as QuestionType}
              options={options}
              selectedValues={selectedValues}
              onSelectionChange={handleSelectionChange}
              numericalValue={numericalValue}
              onNumericalChange={handleNumericalChange}
              isAnswered={false}
              correctOptions={[]}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="sticky bottom-0 left-0 right-0 flex flex-col sm:flex-row justify-between items-stretch sm:items-center p-2 sm:p-4 bg-[#F5F5F5] border-t gap-3 z-10">
        <div className="flex flex-row gap-1 sm:gap-1">
          <Button
            variant="outline"
            onClick={onMarkForReview}
            className="w-full sm:w-auto hover:border-yellow-500 hover:text-yellow-500"
          >
            Mark for Review
          </Button>
          <Button
            variant="outline"
            onClick={onClearResponse}
            className="w-full sm:w-auto hover:border-yellow-500 hover:text-yellow-500"
          >
            Clear Response
          </Button>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={onSaveAndNext}
            className="flex-1 sm:flex-initial bg-yellow-400 hover:bg-yellow-500"
          >
            {questionTypes.isLastQuestion
              ? hasAnswer
                ? "Save"
                : "Save"
              : hasAnswer
                ? "Save and Next"
                : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

