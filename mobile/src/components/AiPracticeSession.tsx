import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import tw from '@/utils/tailwind';
import { useAiSession } from '@/src/hooks/useAiSession';
import Loading from './Loading';
import Progress from '@/src/components/ui/progress';
import QuestionUI from './QuestionUI';

interface AiPracticeSessionProps {
  sessionId: string;
}

export default function AiPracticeSession({ sessionId }: AiPracticeSessionProps) {
  // ===== HOOKS & STATE =====
  const searchParams = useLocalSearchParams();
  const isReviewMode = searchParams.review === 'true';

  const {
    isLoading,
    session,
    questions,
    currentQuestion,
    currentQuestionAttempt,
    progressPercentage,
    canGoPrev,
    canGoNext,
    handlePrev,
    handleNext,
    goToNextUnattempted,
    submitAttempt,
    isSubmitting,
    attemptedQuestions,
  } = useAiSession(sessionId);

  // ===== MEMOIZED VALUES =====
  const hasNextUnattempted = useMemo(
    () =>
      questions.some(
        (q: any, index: number) =>
          index > (questions.findIndex((qu: any) => qu.question.id === currentQuestion?.id) || 0) &&
          !attemptedQuestions.has(q.question.id)
      ),
    [questions, currentQuestion?.id, attemptedQuestions]
  );

  // ===== EVENT HANDLERS =====
  const handleAttempt = useCallback(
    (data: { questionId: string; answer: string; isCorrect: boolean }) => {
      submitAttempt({
        questionId: data.questionId,
        isCorrect: data.isCorrect,
        answer: data.answer,
      });
    },
    [submitAttempt]
  );

  // ===== RENDER HELPERS =====
  const renderLoadingState = () => <Loading />;

  const renderErrorState = () => (
    <View style={tw`flex-1 items-center justify-center bg-white px-4`}>
      <View style={tw`items-center`}>
        <Text style={tw`text-xl font-bold text-red-600 mb-2`}>Session Error</Text>
        <Text style={tw`text-base text-gray-600 text-center`}>
          {session?.message || 'Failed to load session'}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={tw`flex-1 items-center justify-center bg-white px-4`}>
      <View style={tw`items-center`}>
        <Text style={tw`text-lg text-gray-600 text-center`}>
          No questions available in this session
        </Text>
      </View>
    </View>
  );

  const renderProgressSection = () => (
    <View style={tw`flex-row items-center gap-3`}>
      {/* Progress Bar */}
      <View style={tw`flex-row items-center gap-2 flex-1`}>
        <View style={tw`flex-1 max-w-36`}>
          <Progress value={progressPercentage} />
        </View>
        <Text style={tw`text-sm font-medium text-gray-600`}>
          {attemptedQuestions.size}/{questions.length}
        </Text>
      </View>

      {/* Next Unattempted Button */}
      {hasNextUnattempted && !session?.data?.isCompleted && (
        <TouchableOpacity
          onPress={goToNextUnattempted}
          disabled={isSubmitting}
          style={[
            tw`flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-md`,
            tw`bg-blue-50`,
            isSubmitting && tw`opacity-50`,
          ]}
          activeOpacity={0.7}
        >
          <SkipForward size={16} color="#2563eb" />
          <Text style={tw`text-xs font-medium text-blue-600 hidden sm:flex`}>
            Next Unattempted
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderNavigationButtons = () => (
    <View style={tw`flex-row items-center gap-3`}>
      <TouchableOpacity
        onPress={handlePrev}
        disabled={!canGoPrev || isSubmitting}
        style={[
          tw`items-center justify-center w-10 h-10 rounded-md`,
          tw`bg-blue-50`,
          (!canGoPrev || isSubmitting) && tw`opacity-40`,
        ]}
        activeOpacity={0.7}
      >
        <ArrowLeft size={18} color={!canGoPrev || isSubmitting ? '#9ca3af' : '#2563eb'} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleNext}
        disabled={!canGoNext || isSubmitting}
        style={[
          tw`items-center justify-center w-10 h-10 rounded-md`,
          tw`bg-blue-50`,
          (!canGoNext || isSubmitting) && tw`opacity-40`,
        ]}
        activeOpacity={0.7}
      >
        <ArrowRight size={18} color={!canGoNext || isSubmitting ? '#9ca3af' : '#2563eb'} />
      </TouchableOpacity>
    </View>
  );

  const renderBottomNavigation = () => (
    <View
      style={[
        tw`border-t border-gray-100 bg-white`,
        Platform.OS === 'ios' ? tw`pb-6` : tw`pb-3`,
      ]}
    >
      <View style={tw`px-4 py-3`}>
        <View style={tw`flex-row items-center justify-between`}>
          {/* Left Side - Progress and Controls */}
          <View style={tw`flex-1 min-w-0 mr-3`}>
            {renderProgressSection()}
          </View>

          {/* Right Side - Navigation Buttons */}
          <View style={tw`flex-shrink-0`}>
            {renderNavigationButtons()}
          </View>
        </View>
      </View>
    </View>
  );

  const renderMainContent = () => (
    <>
      {currentQuestion && (
        <QuestionUI
          key={`${currentQuestion.id}`}
          question={currentQuestion}
          handleAttempt={handleAttempt}
          answer={currentQuestionAttempt?.answer || null}
          isSolutionShow={(session?.data?.isCompleted || isReviewMode) ?? false}
        />
      )}
    </>
  );

  // ===== MAIN RENDER =====
  if (isLoading) {
    return renderLoadingState();
  }

  if (!session?.success) {
    return renderErrorState();
  }

  if (questions.length === 0) {
    return renderEmptyState();
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      <View style={tw`flex-1`}>
        {renderMainContent()}
      </View>
      {renderBottomNavigation()}
    </View>
  );
}


