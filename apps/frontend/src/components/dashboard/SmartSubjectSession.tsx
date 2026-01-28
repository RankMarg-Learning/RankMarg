"use client"
import { ArrowRight, Clock, History, RotateCcw, Star } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@repo/common-ui';
import { Badge } from '@repo/common-ui';
import { Progress } from '@repo/common-ui';
import { Button } from '@repo/common-ui';
import { SubjectBackgroundColor, SubjectCardColor, SubjectIcons, SubjectTextColor } from '@/constant/SubjectColorCode';
import { PracticeSession } from '@/types/dashboard.types';
import { useRouter } from 'next/navigation';
import { timeFormator } from '@/utils/timeFormatter';

const DynamicSubjectIcon = ({ subject }: { subject: string }) => {
  const Icon = SubjectIcons[subject.toLowerCase() as keyof typeof SubjectIcons] || SubjectIcons.default;
  return (
    <Icon
      className={`w-6 h-6 ${SubjectTextColor[subject.toLowerCase() as keyof typeof SubjectTextColor] ||
        SubjectTextColor.default
        }`}
    />
  );
};

const SubjectPracticeCard = ({
  practice,
  onSessionStart
}: {
  practice: PracticeSession;
  onSessionStart: () => void;
}) => {
  const router = useRouter();

  const handleStart = useCallback(() => {
    onSessionStart();
    router.push(`/ai-session/${practice.id}`);
  }, [practice.id, router, onSessionStart]);

  const progressPercentage = Math.round((practice.questionsAttempted / practice.totalQuestions) * 100);

  const difficultyMap = {
    1: "Easy",
    2: "Medium",
    3: "Hard"
  };

  const difficultyLabel = difficultyMap[practice.difficultyLevel as keyof typeof difficultyMap] || "Unknown";

  return (
    <Card className={`bg-gradient-to-r ${SubjectCardColor[practice.title.toLowerCase() as keyof typeof SubjectCardColor] ||
      SubjectCardColor.default
      } border animate-fade-in overflow-hidden`}>
      <CardContent className="p-3 sm:p-4 md:p-6">
        {/* Header - Stack on mobile, side-by-side on larger screens */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
              <DynamicSubjectIcon subject={practice.title} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base sm:text-lg truncate">{practice.title} Practice</h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Adaptive Question Session</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-white text-xs sm:text-sm self-start sm:self-auto whitespace-nowrap">
            {practice.totalQuestions} Questions
          </Badge>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-1">
              <span>Progress</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-1.5 sm:h-2"
              indicatorColor={`${SubjectBackgroundColor[practice.title.toLowerCase() as keyof typeof SubjectBackgroundColor] ||
                SubjectBackgroundColor.default
                }`}
            />
          </div>


          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm space-y-0.5 sm:space-y-1 xs:col-span-2 sm:col-span-1">
              <div className="text-xs sm:text-sm text-muted-foreground">Difficulty</div>
              <div className='font-normal text-xs sm:text-sm truncate'>
                {difficultyLabel}
              </div>
            </div>
            <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm space-y-0.5 sm:space-y-1">
              <div className="text-xs sm:text-sm text-muted-foreground">Time Required</div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className='font-normal text-xs sm:text-sm truncate'>
                  {timeFormator(Number(practice.timeRequired), { from: 'sec', to: ['min', 'sec'] })}
                </span>
              </div>
            </div>




          </div>

          {/* Key Topics */}
          <div>
            <div className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Key Topics:</div>
            <div className="flex flex-wrap gap-1">
              {practice.keySubtopics.slice(0, 3).map((subtopic, i) => (
                <Badge key={i} variant="outline" className="bg-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                  {subtopic}
                </Badge>
              ))}
              {practice.keySubtopics.length > 3 && (
                <Badge variant="outline" className="bg-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                  +{practice.keySubtopics.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-1 sm:pt-2">
            <Button
              onClick={handleStart}
              className="gap-1 sm:gap-2 w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
              variant='outline'
            >
              {!practice.lastAttempt ? (
                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <History className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
              <span className="truncate">{!practice.lastAttempt ? "Start Session" : "Resume Session"}</span>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Custom hook for carousel functionality
const useCarousel = (totalItems: number, autoplayInterval = 5000) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const startAutoplay = useCallback(() => {
    if (!isAutoplayEnabled) return;

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      setActiveIndex(prev => (prev + 1) % totalItems);
    }, autoplayInterval);
  }, [autoplayInterval, totalItems, isAutoplayEnabled]);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAutoplayEnabled(false);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
    // Only restart autoplay if it's currently enabled
    if (isAutoplayEnabled) {
      startAutoplay();
    }
  }, [startAutoplay, isAutoplayEnabled]);

  useEffect(() => {
    if (isAutoplayEnabled) {
      startAutoplay();
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [startAutoplay, isAutoplayEnabled]);

  return {
    activeIndex,
    goToSlide,
    stopAutoplay,
    isAutoplayEnabled,
    resumeAutoplay: () => setIsAutoplayEnabled(true)
  };
};

const SmartSubjectSession = ({ session }: { session: PracticeSession[] }) => {
  const totalSlides = session?.length || 0;
  const {
    activeIndex,
    goToSlide,
    stopAutoplay,
    isAutoplayEnabled
  } = useCarousel(totalSlides);

  const handleSessionStart = useCallback(() => {

    stopAutoplay();
  }, [stopAutoplay]);

  // Guard against empty session data
  if (!session || session.length === 0) {
    return (
      <div className="p-4 border rounded-md">
        <p className="text-center text-muted-foreground">No practice sessions available</p>
      </div>
    );
  }

  return (
    <div className="relative mx-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <Star className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0" />
          <span className="truncate">Daily Subject Practice Sessions</span>
        </h2>
        {!isAutoplayEnabled && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 text-xs self-start sm:self-auto">
            Autoplay Paused
          </Badge>
        )}
      </div>

      <div className="overflow-hidden relative">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          aria-live="polite"
        >
          {session.map((practice, index) => (
            <div key={practice.id || index} className="w-full flex-shrink-0">
              <SubjectPracticeCard
                practice={practice}
                onSessionStart={handleSessionStart}
              />
            </div>
          ))}
        </div>

        {/* Navigation dots */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-3 sm:mt-4 gap-1.5 sm:gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 sm:h-2.5 rounded-full transition-all touch-manipulation ${activeIndex === index
                  ? 'bg-primary w-6 sm:w-7'
                  : 'bg-gray-300 hover:bg-gray-400 w-2 sm:w-2.5'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={activeIndex === index ? 'true' : 'false'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartSubjectSession;