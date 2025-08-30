"use client";
import React, { useEffect, useState, useMemo } from 'react'
import { Button } from './ui/button'
import MarkdownRenderer from '@/lib/MarkdownRenderer'
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { attempDataProps, QuestionProps } from '@/types';
import Options from './Options';
import { AlertCircle, BookOpen, Lightbulb, AlertTriangle } from 'lucide-react';
import { getDifficultyLabel } from '@/utils/getDifficultyLabel';
import Motion from './ui/motion';
import Timer from './Timer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import MistakeFeedbackModal from './MistakeFeedbackModal';


interface QuestionShowProps extends Omit<QuestionProps, "attempts" | "createdAt"> { }

interface QuestionUIProps {
  question: QuestionShowProps;
  isSolutionShow?: boolean;
  handleAttempt: (attemptData: attempDataProps) => void;
  answer?: string | null;
  attemptId?: string;
}
const QuestionUI = ({
  question,
  handleAttempt,
  isSolutionShow = false,
  answer,
  attemptId
}: QuestionUIProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const isAnswered = useMemo(() => Boolean(answer) || isSolutionShow, [answer, isSolutionShow]);

  const initialSelectedValues = useMemo(() => {
    if (!answer) return [];
    if (question.type === "INTEGER") return [];
    return answer.split(',').map(Number).filter(n => !isNaN(n));
  }, [answer, question.type]);

  const initialNumericalValue = useMemo(() => {
    if (!answer || question.type !== "INTEGER") return null;
    const num = Number(answer);
    return isNaN(num) ? null : num;
  }, [answer, question.type]);

  const [selectedValues, setSelectedValues] = useState<number[]>(initialSelectedValues);
  const [numericalValue, setNumericalValue] = useState<number | null>(initialNumericalValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHintUsed, setIsHintUsed] = useState(false);
  const [isRunning, setIsRunning] = useState(!isAnswered);
  const [time, setTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [optimisticAttemptId, setOptimisticAttemptId] = useState<string | null>(null);

  useEffect(() => {
    if (question.type === "INTEGER") {
      if (answer) {
        const num = Number(answer);
        setNumericalValue(!isNaN(num) ? num : null);
      } else {
        setNumericalValue(null);
      }
      setSelectedValues([]);
    } else {
      if (answer) {
        setSelectedValues(answer.split(',').map(Number).filter(n => !isNaN(n)));
      } else {
        setSelectedValues([]);
      }
      setNumericalValue(null);
    }

    setIsHintUsed(false);
    setIsRunning(!isAnswered);
    setTime(0);
    setReactionTime(0);
    setIsSubmitting(false);
    setOptimisticAttemptId(null);
  }, [question.id, question.type, answer, isAnswered]);

  const correctOptions = useMemo(() => {
    if (!(isAnswered || isSubmitting) || !question.options) return [];
    return question.options
      .map((option, index) => ({ ...option, index }))
      .filter((option) => option.isCorrect)
      .map((option) => option.index);
  }, [isAnswered, question.options, isSubmitting]);

  useEffect(() => {
    if (!isAnswered && selectedValues.length === 0 && numericalValue === null) {
      setReactionTime(time);
    }
  }, [time, selectedValues, numericalValue, isAnswered]);

  const handleSelectionChange = (values: number[]) => {
    if (isAnswered) return;
    setSelectedValues(values);
  };

  const handleNumericalChange = (value: number | null) => {
    if (isAnswered) return;
    setNumericalValue(value);
  };

  const handleShowHint = () => {
    setIsHintUsed(true);
  };
  const checkIfSelectedIsCorrect = (answer?: string) => {
    if (!question.options) return false;

    // Handle numerical/integer type question
    if (question.type === "INTEGER") {
      // If `answer` is provided, parse it as a number and compare
      if (answer !== undefined) {
        const parsedValue = parseInt(answer.trim(), 10);
        return question.isNumerical === parsedValue;
      }
      return question.isNumerical === numericalValue;
    }

    // Handle MCQ/MULTI-SELECT
    const correctIndices = question.options
      .map((opt, idx) => (opt.isCorrect ? idx : null))
      .filter((idx) => idx !== null) as number[];

    // If `answer` is provided, parse it as array of indices
    const selectedIndices: number[] = answer
      ? answer.split(",").map((val) => parseInt(val.trim(), 10))
      : selectedValues;

    return (
      selectedIndices.length === correctIndices.length &&
      selectedIndices.every((index) => correctIndices.includes(index))
    );
  };

  let isCorrect = false;

  if (answer) {
    isCorrect = checkIfSelectedIsCorrect(answer);
  }

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session) {
      router.push('/sign-in');
      return;
    }

    setIsRunning(false);
    setIsSubmitting(true);

    isCorrect = checkIfSelectedIsCorrect();
    const answerStr = question.type === "INTEGER"
      ? numericalValue?.toString() || ""
      : selectedValues.toString();

    // Generate optimistic attempt ID for immediate UI feedback
    const tempAttemptId = `temp_${Date.now()}_${question.id}`;
    setOptimisticAttemptId(tempAttemptId);

    const attemptData = {
      questionId: question.id,
      isCorrect,
      answer: answerStr,
      timing: time,
      isHintUsed,
      reactionTime
    };
    
    toast({
      title: isCorrect ? "Correct Answer" : "Incorrect Answer",
      variant: "default",
      duration: 3000,
      className: isCorrect ? "bg-gray-100 text-gray-800" : "bg-red-500 text-white",
    })

    handleAttempt(attemptData);
  };

  const reportData = useMemo(() => ({
    email: 'support@rankmarg.in',
    subject: `Report: ${question?.slug}`,
    body: `Hello,

I would like to report an issue with the following question:

- **Question Id**: ${question?.id}

Please look into this issue at your earliest convenience. Here is some additional information (optional):

[Provide details about the issue, such as incorrect information, inappropriate content, etc.]

Thank you for your assistance.

Best regards,
[Your Name]
`
  }), [question?.id, question?.slug]);

  const handleReport = () => {
    const mailtoLink = `mailto:${reportData.email}?subject=${encodeURIComponent(reportData.subject)}&body=${encodeURIComponent(reportData.body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col bg-white" id="fullscreen">
      <div className="flex flex-wrap md:flex-row flex-1 p-2 rounded-lg overflow-hidden ">
        {/* Left side: Question */}
        <div className="w-full md:w-1/2 md:p-6 p-2 border-b md:border-b-0 md:border-r">
          <h1 className="text-lg font-bold mb-2">Question</h1>

          {/* Timer - Hidden when answered */}
          {!isAnswered && (
            <Timer
              questionId={question.id}
              defaultTime={time}
              isRunning={isRunning}
              onTimeChange={setTime}
              className=" border-2 border-blue-500 text-blue-500 text-sm hidden"
            />
          )}

          {/* Question metadata */}
          <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
            <span className="px-2 py-0.5 md:py-1 border border-blue-500 text-blue-500 rounded-full text-xs font-medium">
              {question?.topic?.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 md:py-1 border border-amber-500 text-amber-500 rounded-full text-xs font-medium">
                {getDifficultyLabel(question?.difficulty)}
              </span>
              <span
                className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium flex items-center gap-1 hover:underline cursor-pointer"
                onClick={handleReport}
              >
                Report
              </span>
            </div>
          </div>

          {/* Question content */}
          <div className='noselect'>
            <MarkdownRenderer content={question?.content} className='md:text-base text-sm' />
          </div>

          {/* Hint button */}
          {!isAnswered && !isHintUsed && (
            <Button
              variant="link"
              className="text-sm mt-2 underline"
              onClick={handleShowHint}
            >
              Show Hint
            </Button>
          )}
        </div>

        {/* Right side: Options */}
        <div className="w-full md:w-1/2 md:p-6 p-2 relative noselect">
          <Options
            isAnswered={isAnswered || isSubmitting}
            type={question.type}
            options={question.options || []}
            selectedValues={selectedValues}
            onSelectionChange={handleSelectionChange}
            numericalValue={numericalValue}
            onNumericalChange={handleNumericalChange}
            correctOptions={correctOptions}
            correctNumericalValue={question.isNumerical}
          />

          {/* Submit button*/}
          {(!isAnswered && !isSubmitting) && (
            <div className="flex justify-center mt-4 gap-2">
              <form onSubmit={handleOnSubmit}>
                <Button
                  type="submit"
                  disabled={(question.type === "INTEGER" ? numericalValue === null : selectedValues.length === 0) || isSubmitting}
                >
                  Submit Answer
                </Button>
              </form>
            </div>
          )}
        </div>


      </div>
      {(!isCorrect && (attemptId || optimisticAttemptId)) && (
        <div className="flex justify-center">
          <Button
            onClick={() => setShowFeedbackModal(true)}
            variant="outline"
            size="sm"
            className="bg-amber-400 text-black font-medium rounded-md py-2 px-4 shadow-sm
    hover:bg-amber-500 focus:bg-amber-500
    active:bg-amber-600
    disabled:bg-amber-400/50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Select Error Reason
          </Button>
        </div>
      )}

      {/* Hint section */}
      {!isAnswered && isHintUsed && (
        <Motion animation='fade-in' className="w-full p-2">
          <div className="mt-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900 text-sm">Hint</h3>
            </div>
            <div className="prose prose-sm max-w-none">
              {question?.hint ? (
                <MarkdownRenderer content={question?.hint} className='text-sm' />
              ) : (
                <div className="text-center py-2">
                  <Lightbulb className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                  <span className='text-sm text-gray-500'>Hint is not available</span>
                </div>
              )}
            </div>
          </div>
        </Motion>
      )}

      {/* Solution section  */}
      {(isAnswered || isSubmitting) && (
        <Motion animation="fade-in" className="w-full p-2 ">
          <Accordion type="single" collapsible defaultValue="solution" >
            <AccordionItem value="solution" >
              <div className="mt-3 p-3 bg-purple-50 rounded-lg border-purple-100">
                <AccordionTrigger className="w-full text-left p-0 hover:no-underline">
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mt-0.5" />
                    <h3 className="font-medium text-purple-900 text-sm sm:text-base">
                      Detailed Solution
                    </h3>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-purple-800 mt-1 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  {question?.solution ? (
                    <div className="space-y-3">
                      {/* Step-by-Step Analysis */}
                      <div className="bg-white rounded-lg border border-purple-200 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-purple-600" />
                          <h4 className="font-semibold text-purple-900 text-sm">Step-by-Step Analysis</h4>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <MarkdownRenderer content={question.solution} className="text-sm" />
                        </div>
                      </div>

                      {/* Solving Strategy */}
                      {question?.strategy && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-blue-600" />
                            <h4 className="font-semibold text-blue-900 text-sm">Solving Strategy</h4>
                          </div>
                          <div className="prose prose-sm max-w-none">
                            <MarkdownRenderer content={question.strategy} className="text-sm" />
                          </div>
                        </div>
                      )}

                      {/* Common Mistakes */}
                      {question?.commonMistake && (
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <h4 className="font-semibold text-red-900 text-sm">Common Mistakes to Avoid</h4>
                          </div>
                          <div className="prose prose-sm max-w-none">
                            <MarkdownRenderer content={question.commonMistake} className="text-sm" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <BookOpen className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                      <span className="text-sm text-gray-500">Solution is not available</span>
                    </div>
                  )}
                </AccordionContent>
              </div>
            </AccordionItem>
          </Accordion>
        </Motion>
      )}
      <MistakeFeedbackModal
        attemptId={attemptId || optimisticAttemptId}
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  );
};

export default React.memo(QuestionUI);