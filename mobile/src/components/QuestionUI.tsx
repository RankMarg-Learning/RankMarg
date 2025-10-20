import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { AlertCircle, BookOpen, Lightbulb, AlertTriangle } from 'lucide-react-native';
import tw from '@/utils/tailwind';
import MarkdownRenderer from '@/src/lib/MarkdownRenderer';
import Options from '@/src/components/Options';
import { getDifficultyLabel } from '@/src/utils/getDifficultyLabel';
import Motion from '@/src/components/ui/motion';
import Timer from '@/src/components/Timer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/ui/accordion';
import MistakeFeedbackModal from '@/src/components/MistakeFeedbackModal';
import { reportQuestion } from '@/src/services/question.service';

type QuestionType = 'MCQ' | 'MULTI' | 'INTEGER';

interface Option {
  id?: string;
  text?: string;
  content?: string;
  isCorrect?: boolean;
}

interface QuestionUIProps {
  question: {
    id: string;
    type: QuestionType;
    content?: string;
    title?: string;
    statement?: string;
    hint?: string | null;
    options?: Option[];
    isNumerical?: number | null;
    solution?: string | null;
    strategy?: string | null;
    commonMistake?: string | null;
    slug?: string;
    topic?: { name?: string } | null;
    difficulty?: string | null;
  };
  handleAttempt: (data: { questionId: string; answer: string; isCorrect: boolean; timing?: number; reactionTime?: number; isHintUsed?: boolean }) => void;
  isSolutionShow?: boolean;
  answer?: string | null;
}

export default function QuestionUI({ question, handleAttempt, isSolutionShow = false, answer }: QuestionUIProps) {
  const isAnswered = useMemo(() => Boolean(answer) || isSolutionShow, [answer, isSolutionShow]);

  const initialSelectedValues = useMemo(() => {
    if (!answer) return [];
    if (question.type === 'INTEGER') return [];
    return answer.split(',').map(Number).filter(n => !isNaN(n));
  }, [answer, question.type]);

  const initialNumericalValue = useMemo(() => {
    if (!answer || question.type !== 'INTEGER') return null;
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
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportType, setReportType] = useState<string>('WRONG_ANSWER');
  const [reportText, setReportText] = useState<string>('');
  const [isReporting, setIsReporting] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    if (question.type === 'INTEGER') {
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

  // Track reaction time
  useEffect(() => {
    if (!isAnswered && selectedValues.length === 0 && numericalValue === null) {
      setReactionTime(time);
    }
  }, [time, selectedValues, numericalValue, isAnswered]);

  // Selection change handlers
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

  // Check if answer is correct
  const checkIfSelectedIsCorrect = (answerStr?: string) => {
    if (!question.options && question.type !== 'INTEGER') return false;

    // Handle numerical/integer type question
    if (question.type === 'INTEGER') {
      if (answerStr !== undefined) {
        const parsedValue = parseInt(answerStr.trim(), 10);
        return question.isNumerical === parsedValue;
      }
      return question.isNumerical === numericalValue;
    }

    // Handle MCQ/MULTI-SELECT
    const correctIndices = (question.options || [])
      .map((opt, idx) => (opt.isCorrect ? idx : null))
      .filter((idx) => idx !== null) as number[];

    const selectedIndices: number[] = answerStr
      ? answerStr.split(',').map((val) => parseInt(val.trim(), 10))
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

  const handleOnSubmit = () => {
    setIsRunning(false);
    setIsSubmitting(true);

    isCorrect = checkIfSelectedIsCorrect();
    const answerStr = question.type === 'INTEGER'
      ? numericalValue?.toString() || ''
      : selectedValues.toString();

    // Generate optimistic attempt ID
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

    // Show success/error feedback
    Alert.alert(
      isCorrect ? 'Correct Answer!' : 'Incorrect Answer',
      isCorrect ? 'Well done!' : 'Keep trying!',
      [{ text: 'OK' }]
    );

    handleAttempt(attemptData);
  };

  // Report types
  const REPORT_TYPES: { value: string; label: string }[] = [
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
      Alert.alert('Success', 'Report submitted. Thank you!');
      setIsReportOpen(false);
      setReportText('');
      setReportType('WRONG_ANSWER');
    } else {
      Alert.alert('Error', 'Failed to submit report');
    }
  };

  return (
    <ScrollView style={tw`flex-1 bg-white`} contentContainerStyle={tw`pb-6`}>
      {/* Question Section */}
      <View style={tw`p-4 border-b border-gray-200`}>
        <Text style={tw`text-lg font-bold mb-2`}>Question</Text>

        {/* Timer - Hidden when answered */}
        {!isAnswered && (
          <Timer
            questionId={question.id}
            defaultTime={time}
            isRunning={isRunning}
            onTimeChange={setTime as any}
          />
        )}

        {/* Question metadata */}
        <View style={tw`flex-row justify-between items-start mb-2 flex-wrap gap-2`}>
          <Text style={tw`px-2 py-1 border border-blue-500 text-blue-500 rounded-full text-xs font-medium`}>
            {question?.topic?.name}
          </Text>
          <View style={tw`flex-row items-center gap-2`}>
            <Text style={tw`px-2 py-1 border border-amber-500 text-amber-500 rounded-full text-xs font-medium`}>
              {getDifficultyLabel(question?.difficulty)}
            </Text>
            <TouchableOpacity
              onPress={() => setIsReportOpen(true)}
              style={tw`px-2 py-1 bg-gray-100 rounded-full`}
            >
              <Text style={tw`text-xs font-medium text-gray-800`}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Question content */}
        <View style={tw`mt-2`}>
          <MarkdownRenderer content={question?.content || ''} />
        </View>

        {/* Hint button */}
        {!isAnswered && !isHintUsed && (
          <TouchableOpacity onPress={handleShowHint} style={tw`mt-2`}>
            <Text style={tw`text-sm text-blue-600 underline`}>Show Hint</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Options Section */}
      <View style={tw`p-4`}>
        <Options
          isAnswered={isAnswered || isSubmitting}
          type={question.type === 'INTEGER' ? 'INTEGER' : 'MULTIPLE_CHOICE'}
          options={(question.options || []).map((o) => ({
            content: o.content || o.text || '',
            isCorrect: o.isCorrect
          }))}
          selectedValues={selectedValues}
          onSelectionChange={handleSelectionChange}
          numericalValue={numericalValue}
          onNumericalChange={handleNumericalChange}
          correctOptions={correctOptions}
          correctNumericalValue={question.isNumerical}
        />

        {/* Submit button */}
        {(!isAnswered && !isSubmitting) && (
          <View style={tw`mt-4`}>
            <TouchableOpacity
              style={[
                tw`px-4 py-3 bg-blue-600 rounded-md`,
                ((question.type === 'INTEGER' ? numericalValue === null : selectedValues.length === 0) || isSubmitting) && tw`opacity-50`
              ]}
              onPress={handleOnSubmit}
              disabled={(question.type === 'INTEGER' ? numericalValue === null : selectedValues.length === 0) || isSubmitting}
            >
              <Text style={tw`text-white text-center font-medium`}>Submit Answer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Error Reason Button */}
      {(!isCorrect && optimisticAttemptId) && (
        <View style={tw`px-4 pb-2`}>
          <TouchableOpacity
            onPress={() => setShowFeedbackModal(true)}
            style={tw`flex-row items-center justify-center gap-2 bg-blue-600 rounded-md py-2 px-4`}
          >
            <AlertCircle size={16} color="#fff" />
            <Text style={tw`text-white font-medium`}>Select Error Reason</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Hint section */}
      {!isAnswered && isHintUsed && (
        <Motion>
          <View style={tw`mx-4 mb-3 bg-yellow-50 rounded-lg border border-yellow-200 p-3`}>
            <View style={tw`flex-row items-center gap-2 mb-2`}>
              <Lightbulb size={16} color="#ca8a04" />
              <Text style={tw`font-semibold text-yellow-900 text-sm`}>Hint</Text>
            </View>
            {question?.hint ? (
              <MarkdownRenderer content={question.hint} />
            ) : (
              <View style={tw`items-center py-2`}>
                <Lightbulb size={20} color="#9ca3af" />
                <Text style={tw`text-sm text-gray-500 mt-1`}>Hint is not available</Text>
              </View>
            )}
          </View>
        </Motion>
      )}

      {/* Solution section */}
      {(isAnswered || isSubmitting) && (
        <Motion>
          <View style={tw`mx-4`}>
            <Accordion>
              <AccordionItem value="solution">
                <View style={tw`mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100`}>
                  <AccordionTrigger>
                    <View style={tw`flex-row items-center gap-2`}>
                      <BookOpen size={18} color="#7c3aed" />
                      <Text style={tw`font-medium text-purple-900`}>Detailed Solution</Text>
                    </View>
                  </AccordionTrigger>
                  <AccordionContent>
                    {question?.solution ? (
                      <View style={tw`gap-3`}>
                        {/* Solving Strategy */}
                        {question?.strategy && (
                          <View style={tw`bg-blue-50 rounded-lg border border-blue-200 p-3`}>
                            <View style={tw`flex-row items-center gap-2 mb-2`}>
                              <Lightbulb size={16} color="#2563eb" />
                              <Text style={tw`font-semibold text-blue-900 text-sm`}>Solving Strategy</Text>
                            </View>
                            <MarkdownRenderer content={question.strategy} />
                          </View>
                        )}

                        {/* Common Mistakes */}
                        {question?.commonMistake && (
                          <View style={tw`bg-red-50 rounded-lg border border-red-200 p-3`}>
                            <View style={tw`flex-row items-center gap-2 mb-2`}>
                              <AlertTriangle size={16} color="#dc2626" />
                              <Text style={tw`font-semibold text-red-900 text-sm`}>Common Mistakes to Avoid</Text>
                            </View>
                            <MarkdownRenderer content={question.commonMistake} />
                          </View>
                        )}

                        {/* Step-by-Step Analysis */}
                        <View style={tw`bg-white rounded-lg border border-purple-200 p-3`}>
                          <View style={tw`flex-row items-center gap-2 mb-2`}>
                            <BookOpen size={16} color="#7c3aed" />
                            <Text style={tw`font-semibold text-purple-900 text-sm`}>Step-by-Step Analysis</Text>
                          </View>
                          <MarkdownRenderer content={question.solution} />
                        </View>
                      </View>
                    ) : (
                      <View style={tw`items-center py-4`}>
                        <BookOpen size={24} color="#9ca3af" />
                        <Text style={tw`text-sm text-gray-500 mt-1`}>Solution is not available</Text>
                      </View>
                    )}
                  </AccordionContent>
                </View>
              </AccordionItem>
            </Accordion>
          </View>
        </Motion>
      )}

      <MistakeFeedbackModal
        attemptId={optimisticAttemptId}
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      {/* Report Modal */}
      {isReportOpen && (
        <View style={tw`absolute inset-0 bg-black/40 items-center justify-center p-4`}>
          <View style={tw`bg-white rounded-lg w-full max-w-md p-4`}>
            <Text style={tw`text-lg font-semibold mb-4`}>Report this question</Text>

            {/* Reason selection */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Reason</Text>
              <View style={tw`flex-row flex-wrap gap-2`}>
                {REPORT_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    onPress={() => setReportType(t.value)}
                    style={[
                      tw`border rounded-md px-3 py-2`,
                      reportType === t.value
                        ? tw`border-blue-600 bg-blue-50`
                        : tw`border-gray-200`
                    ]}
                  >
                    <Text style={[
                      tw`text-sm`,
                      reportType === t.value ? tw`text-blue-700` : tw`text-gray-700`
                    ]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Details textarea - using TextInput in React Native */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>Details</Text>
              <TextInput
                style={tw`border border-gray-200 rounded-md p-3 min-h-24 text-sm`}
                placeholder="Describe the issue..."
                value={reportText}
                onChangeText={setReportText}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Action buttons */}
            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity
                style={tw`flex-1 border border-gray-300 rounded-md py-2`}
                onPress={() => setIsReportOpen(false)}
              >
                <Text style={tw`text-center text-gray-700 font-medium`}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[tw`flex-1 bg-blue-600 rounded-md py-2`, isReporting && tw`opacity-50`]}
                onPress={handleReportSubmit}
                disabled={isReporting}
              >
                <Text style={tw`text-center text-white font-medium`}>
                  {isReporting ? 'Submitting...' : 'Submit Report'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}


