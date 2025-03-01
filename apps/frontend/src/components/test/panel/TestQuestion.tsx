import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import Options from "@/components/Options";
import { useTestContext } from "@/context/TestContext";
import MarkdownRenderer from "@/lib/MarkdownRenderer";
import TimeSpendOnQuestion from "@/utils/test/TimeSpendOnQuestion";
import { QuestionStatus } from "@/utils";

export function TestQuestion() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const {
    questions,
    currentQuestion,
    setCurrentQuestion,
    totalQuestions,
    setQuestionsData,
    questionsData,
    testSection,
  } = useTestContext();

  const question = questions?.[currentQuestion - 1];
  const options = question?.options || [];
  const isLastQuestion = currentQuestion === totalQuestions;

  const getMarks = (currentQuestionIndex: number) => {

    if (!testSection || Object.keys(testSection).length === 0) {
      return { correctMarks: 0, negativeMarks: 0 };
    }
    for (const [key, value] of Object.entries(testSection)) {
      const range = key.split('_')[1];

      const [start, end] = range.split('-').map(Number);
      if (currentQuestionIndex >= start && currentQuestionIndex <= end) {
        return {
          correctMarks: value.correctMarks,
          negativeMarks: value.negativeMarks > 0 ? -value.negativeMarks : 0,
        };
      }
    }
    return { correctMarks: 0, negativeMarks: 0 };
  }



  useEffect(() => {
    const currentQuestionData = questionsData[currentQuestion]?.selectedOptions || [];
    if (currentQuestionData.length > 0) {
      if (questionsData[currentQuestion]?.type === "multiple") {
        setSelectedOption(null);
        setSelectedOptions(currentQuestionData);
      } else {
        setSelectedOption(currentQuestionData[0]);
        setSelectedOptions([]);
      }
    } else {
      setSelectedOption(null);
      setSelectedOptions([]);
    }
  }, [currentQuestion, questionsData, question?.type]);




  

  // Handlers
  const onMarkForReview = () => {
    setQuestionsData((prev) => ({
      ...prev,
      [currentQuestion]: {
        ...prev[currentQuestion],
        status:
          selectedOption !== null || selectedOptions.length > 0
            ? QuestionStatus.AnsweredAndMarked
            : QuestionStatus.MarkedForReview,
        selectedOptions:
            selectedOption !== null 
            ? [selectedOption]
            : selectedOptions,
        type: question?.type === 'MCQ' ? (selectedOption !== null ? 'single' : 'multiple') : question?.type,
        submittedAt: new Date(),
      },
    }));

    if (!isLastQuestion) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setSelectedOptions([]);
    }
  };

  const onClearResponse = () => {
    setQuestionsData((prev) => ({
      ...prev,
      [currentQuestion]: {
        ...prev[currentQuestion],
        status: QuestionStatus.NotAnswered,
        selectedOptions: null,
        submittedAt: new Date(),
      },
    }));

    setSelectedOption(null);
    setSelectedOptions([]);
  };


  const onSaveAndNext = () => {
    setQuestionsData((prev) => ({
      ...prev,
      [currentQuestion]: {
        ...prev[currentQuestion],
        selectedOptions:
          question?.type === "MCQ"
            ? selectedOption !== null
              ? [selectedOption]
              : selectedOptions
            : [selectedOption],
        status:
          ( selectedOption !== null) ||
            selectedOptions.length > 0
            ? QuestionStatus.Answered
            : QuestionStatus.NotAnswered,
        type: question?.type === 'MCQ' ? (selectedOption !== null ? 'single' : 'multiple') : question?.type,
        submittedAt: new Date(),
      },
    }));

    if (!isLastQuestion) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setSelectedOptions([]);
    }



  };



  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Question Header */}
      <div className="flex sm:flex-row sm:items-center justify-between p-2 sm:p-3 border-b space-y-2 sm:space-y-0">
        <div className="flex items-center gap-1 justify-between">
          <Badge variant="outline">
            {currentQuestion} / {totalQuestions}
          </Badge>
          <div className="flex gap-1">
            <Badge variant="outline" className="flex items-center gap-1">
              <span>Marks:</span>
              <span className="text-green-600">+{getMarks(currentQuestion).correctMarks}</span>
              <span>/</span>
              <span className="text-red-500">{getMarks(currentQuestion).negativeMarks}</span>
            </Badge>
            <TimeSpendOnQuestion currentQuestion={currentQuestion} />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-auto default-scroll">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Question Text */}
          <div className="lg:flex-1 lg:w-1/2 p-4 sm:p-6 pb-8 border-b lg:border-b-0 lg:border-r noselect">
            <MarkdownRenderer content={question?.content || ""} />
          </div>

          {/* Options */}
          <div className="flex-1 lg:w-1/2 p-4 sm:p-6">
            <Options
              type={question?.type}
              options={options}
              selectedOption={selectedOption}
              selectedOptions={selectedOptions}
              setSelectedOption={setSelectedOption}
              setSelectedOptions={setSelectedOptions}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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
            {`Save ${!isLastQuestion ? "and Next" : ""}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
