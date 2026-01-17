"use client";
import React, { useEffect, useState, useMemo } from 'react'
import { Button, Badge } from '@repo/common-ui'
import MarkdownRenderer from '@/lib/MarkdownRenderer'
import { useToast } from '@/hooks/use-toast';
import { attempDataProps, QuestionProps } from '@/types';
import Options from './Options';
import { AlertCircle, BookOpen, Lightbulb, AlertTriangle, Lock, EyeOff, Settings, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getDifficultyLabel } from '@/utils/getDifficultyLabel';
import { Motion } from '@repo/common-ui';
import Timer from './Timer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/common-ui';
import MistakeFeedbackModal from './MistakeFeedbackModal';
import { useRouter } from 'next/navigation';
import { reportQuestion } from '@/services/question.service';
import QuestionUISettings from './QuestionUISettings';
import {
  QuestionUIPreferences,
  loadUIPreferences,
} from '@/utils/questionUIPreferences';
import {
  filterSolutionContent,
  getAvailableSections,
} from '@/utils/solutionFilter';


interface QuestionShowProps extends Omit<QuestionProps, "attempts" | "createdAt"> { }

interface QuestionUIProps {
  question: QuestionShowProps;
  isSolutionShow?: boolean;
  handleAttempt?: (attemptData: attempDataProps) => void;
  answer?: string | null;
  attemptId?: string;
  isUnlocked?: boolean;
  markAsMistake?: boolean;
  // Review mode props
  reviewMode?: boolean;
  questionNumber?: number;
  status?: 'correct' | 'incorrect' | 'unattempted';
  timeTaken?: number;
}
const QuestionUI = ({
  question,
  handleAttempt,
  isSolutionShow = false,
  answer,
  attemptId,
  isUnlocked = true,
  markAsMistake = false,
  reviewMode = false,
  questionNumber,
  status,
  timeTaken,
}: QuestionUIProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const isAnswered = useMemo(() => Boolean(answer) || isSolutionShow || reviewMode, [answer, isSolutionShow, reviewMode]);


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
    if (!handleAttempt || reviewMode) return; // Don't submit in review mode



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
      duration: 500,
      className: isCorrect ? "bg-gray-100 text-gray-800" : "bg-red-500 text-white",
    })

    handleAttempt(attemptData);
  };

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportType, setReportType] = useState<string>('WRONG_ANSWER');
  const [reportText, setReportText] = useState<string>('');
  const [isReporting, setIsReporting] = useState(false);

  // UI Preferences
  const [uiPreferences, setUiPreferences] = useState<QuestionUIPreferences>(loadUIPreferences());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Get available sections and filtered content
  const availableSections = useMemo(() =>
    question?.solution ? getAvailableSections(question.solution) : [],
    [question?.solution]
  );

  const filteredSolution = useMemo(() =>
    question?.solution ? filterSolutionContent(question.solution, uiPreferences.solutionContentFilters) : '',
    [question?.solution, uiPreferences.solutionContentFilters]
  );

  const REPORT_TYPES: { value: string; label: string; hint?: string }[] = [
    { value: 'WRONG_ANSWER', label: 'Wrong Answer' },
    { value: 'WRONG_SOLUTION', label: 'Wrong Solution' },
    { value: 'WRONG_QUESTION', label: 'Wrong Question' },
    { value: 'MISSING_INFO', label: 'Missing Information' },
    { value: 'TYPO', label: 'Grammar/typo' },
    { value: 'OTHER', label: 'Other' },
  ];

  const handleReportSubmit = async () => {
    if (!question?.slug) return;

    setIsReporting(true);
    const res = await reportQuestion(question.slug, { type: reportType, feedback: reportText });
    setIsReporting(false);
    if (res?.success !== false) {
      toast({ title: 'Report submitted. Thank you!', variant: 'default' });
      setIsReportOpen(false);
      setReportText('');
      setReportType('OPTION_WRONG');
    } else {
      toast({ title: 'Failed to submit report', variant: 'destructive' });
    }
  };

  // Review mode status helpers
  const getStatusIcon = () => {
    if (!reviewMode || !status) return null;
    switch (status) {
      case 'correct':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'incorrect':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'unattempted':
        return <Clock className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    if (!reviewMode || !status) return null;
    switch (status) {
      case 'correct':
        return <Badge className="bg-green-100 text-green-800">Correct</Badge>;
      case 'incorrect':
        return <Badge className="bg-red-100 text-red-800">Incorrect</Badge>;
      case 'unattempted':
        return <Badge className="bg-gray-100 text-gray-800">Unattempted</Badge>;
      default:
        return null;
    }
  };


  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col bg-white" id={reviewMode ? "review-question" : "fullscreen"}>
      <div className="flex flex-wrap md:flex-row flex-1 p-2 rounded-lg overflow-hidden ">
        {/* Left side: Question */}
        <div className="w-full md:w-1/2 md:p-6 p-2 border-b md:border-b-0 md:border-r">
          <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold mb-2">
                {reviewMode && questionNumber ? `Question ${questionNumber}` : 'Question'}
              </h1>
              {reviewMode && getStatusIcon()}
              {reviewMode && getStatusBadge()}
            </div>
            <button
              className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-full text-xs font-medium flex items-center gap-1 transition-colors border border-purple-200"
              onClick={() => setIsSettingsOpen(true)}
              title="Display Settings"
            >
              <Settings className="h-3 w-3" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>

          {/* Timer - Hidden when answered or in review mode */}
          {!isAnswered && !reviewMode && (
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
              {reviewMode && timeTaken !== undefined && (
                <span className="px-2 py-0.5 md:py-1 border border-gray-300 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {Math.floor(timeTaken / 60)}m {timeTaken % 60}s
                </span>
              )}
              {!reviewMode && (
                <span
                  className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium flex items-center gap-1 hover:underline cursor-pointer"
                  onClick={() => setIsReportOpen(true)}
                >
                  Report
                </span>
              )}
            </div>
          </div>

          {/* Question content */}
          <div className='noselect'>
            <MarkdownRenderer content={question?.content} className='md:text-base text-sm' />
          </div>

          {/* Hint button - Hidden in review mode */}
          {!reviewMode && !isAnswered && !isHintUsed && uiPreferences.showHint && (
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

          {/* Submit button - Hidden in review mode */}
          {!reviewMode && (!isAnswered && !isSubmitting) && (
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
      {(!isCorrect && (attemptId || optimisticAttemptId) && !markAsMistake) && (
        <div className="flex justify-center">
          <Button
            onClick={() => setShowFeedbackModal(true)}
            variant="outline"
            size="sm"
            className="bg-primary-500 text-white font-medium rounded-full py-4 px-4 shadow-sm
    hover:bg-primary-600/90 focus:bg-primary-600
    active:bg-primary-600
    disabled:bg-primary-600/50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Select Error Reason
          </Button>
        </div>
      )}

      {/* Hint section - Hidden in review mode */}
      {!reviewMode && !isAnswered && isHintUsed && uiPreferences.showHint && (
        <Motion animation='fade-in' className="w-full p-2">
          <div className="mt-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              <h3 className="font-semibold text-yellow-900 text-sm">Hint</h3>
            </div>
            <div className="prose prose-sm max-w-none overflow-x-auto">
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

      {/* Solution section - Always show in review mode if enabled */}
      {(reviewMode || isAnswered || isSubmitting) && uiPreferences.showDetailedSolution && (
        <Motion animation="fade-in" className="w-full p-2 ">
          <Accordion type="single" collapsible defaultValue="solution" >
            <AccordionItem value="solution" >
              <div className="mt-3 p-2 md:p-3 bg-purple-50 rounded-lg border-purple-100">
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
                      {
                        isUnlocked ? (
                          <>
                            {/* Solving Strategy */}
                            {uiPreferences.showStrategy && question?.strategy && question?.strategy?.length > 10 && (
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Lightbulb className="h-4 w-4 text-blue-600" />
                                  <h4 className="font-semibold text-blue-900 text-sm">Solving Strategy</h4>
                                </div>
                                <div className="prose prose-sm max-w-none overflow-x-auto">
                                  <MarkdownRenderer content={question.strategy} className="text-sm" />
                                </div>
                              </div>
                            )}
                            {/* Common Mistakes */}
                            {uiPreferences.showCommonMistakes && question?.commonMistake && question?.commonMistake?.length > 10 && (
                              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                  <h4 className="font-semibold text-red-900 text-sm">Common Mistakes to Avoid</h4>
                                </div>
                                <div className="prose prose-sm max-w-none overflow-x-auto">
                                  <MarkdownRenderer content={question.commonMistake} className="text-sm" />
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div
                            className="text-center my-2 bg-primary-50/60 hover:bg-primary-50 transition rounded-lg border border-primary-400 p-3 cursor-pointer shadow-sm"
                            onClick={() => router.push(`/subscription?plan=rank&ref=solution_locked_banner`)}
                          >
                            <Lock className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                            <span className="block text-xs md:text-sm text-primary-700 font-medium">
                              Unlock <span className="font-semibold">Solving Strategy</span> & <span className="font-semibold">Common Mistakes to Avoid</span>
                            </span>
                            <span className="block text-xs md:text-sm text-primary-600 mt-1">
                              Get full access with <span className="font-semibold">Rank Subscription</span>
                            </span>
                            <span className="inline-block mt-2 text-xs md:text-sm bg-primary-500 text-white px-3 py-1 rounded-md font-medium">
                              Upgrade Now
                            </span>
                          </div>
                        )
                      }

                      {/* Step-by-Step Analysis */}
                      <div className="bg-white rounded-lg border border-purple-200 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-purple-600" />
                          <h4 className="font-semibold text-purple-900 text-sm">Step-by-Step Analysis</h4>
                        </div>
                        <div className="prose prose-sm max-w-none overflow-x-auto">
                          <MarkdownRenderer content={filteredSolution} className="text-sm" />
                        </div>
                      </div>

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

      {/* Solution Hidden Message */}
      {(reviewMode || isAnswered || isSubmitting) && !uiPreferences.showDetailedSolution && (
        <Motion animation="fade-in" className="w-full p-2">
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <EyeOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 font-medium">Detailed solution is hidden</p>
            <p className="text-xs text-gray-500 mt-1">Open settings to enable solution display</p>
          </div>
        </Motion>
      )}
      <MistakeFeedbackModal
        attemptId={attemptId || optimisticAttemptId}
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-lg shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl p-4 sm:p-5 m-3 sm:m-6"
          >
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Report this question</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Reason</label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {REPORT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      className={`text-left border rounded-md p-2 sm:p-2.5 text-sm transition-colors ${reportType === t.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => setReportType(t.value)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Details</label>
                <textarea
                  className="mt-1 w-full border rounded-md p-2 sm:p-3 text-sm min-h-[60px] md:min-h-[140px]"
                  placeholder="Describe the issue..."
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setIsReportOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={handleReportSubmit}
                  disabled={isReporting}
                >
                  {isReporting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <QuestionUISettings
        availableSolutionSections={availableSections}
        onPreferencesChange={setUiPreferences}
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
};

export default React.memo(QuestionUI);