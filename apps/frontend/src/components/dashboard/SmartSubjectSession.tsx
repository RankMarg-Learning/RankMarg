"use client"
import { ArrowRight, Clock, History, RotateCcw, Star } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { SubjectBackgroundColor, SubjectCardColor, SubjectIcons, SubjectTextColor } from '@/constant/SubjectColorCode';
import { PracticeSession } from '@/types/dashboard.types';
import { useRouter } from 'next/navigation';
import { timeFormator } from '@/utils/timeFormatter';

// Extracted to a separate component for better reusability and cleaner code
const DynamicSubjectIcon = ({ subject }: { subject: string }) => {
  const Icon = SubjectIcons[subject.toLowerCase() as keyof typeof SubjectIcons] || SubjectIcons.default;
  return (
    <Icon 
      className={`w-6 h-6 ${
        SubjectTextColor[subject.toLowerCase() as keyof typeof SubjectTextColor] || 
        SubjectTextColor.default
      }`} 
    />
  );
};

// Extracted to a separate component for maintainability
const SubjectPracticeCard = ({ 
  practice, 
  onSessionStart 
}: { 
  practice: PracticeSession;
  onSessionStart: () => void;
}) => {
  const router = useRouter();
  
  const handleStart = useCallback(() => {
    onSessionStart(); // Signal to parent that session is starting
    router.push(`/ai-session/${practice.id}`);
  }, [practice.id, router, onSessionStart]);

  const progressPercentage = Math.round((practice.questionsAttempted / practice.totalQuestions) * 100);
  const formattedLastAttempt = practice.lastAttempt 
    ? new Date(practice.lastAttempt).toLocaleString() 
    : "Not yet attempted";
  
  const difficultyMap = {
    1: "Easy",
    2: "Medium",
    3: "Hard"
  };
  
  const difficultyLabel = difficultyMap[practice.difficultyLevel as keyof typeof difficultyMap] || "Unknown";

  return (
    <Card className={`bg-gradient-to-r ${
      SubjectCardColor[practice.title.toLowerCase() as keyof typeof SubjectCardColor] || 
      SubjectCardColor.default
    } border animate-fade-in overflow-hidden`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <DynamicSubjectIcon subject={practice.title} />
            </div>
            <div>
              <h3 className="font-medium text-lg">{practice.title} Practice</h3>
              <p className="text-sm text-muted-foreground">Adaptive Question Session</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-white">
            {practice.totalQuestions} Questions
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2" 
              indicatorColor={`${
                SubjectBackgroundColor[practice.title.toLowerCase() as keyof typeof SubjectBackgroundColor] || 
                SubjectBackgroundColor.default
              }`} 
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg shadow-sm space-y-1">
              <div className="text-sm text-muted-foreground">Time Required</div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className='font-normal text-sm truncate'>
                  {timeFormator(Number(practice.timeRequired),{from:'sec',to:['min','sec']})}
                </span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg shadow-sm space-y-1">
              <div className="text-sm text-muted-foreground">Last Active</div>
              <div className="flex items-center gap-1">
                <History className="h-4 w-4" />
                <span className='font-normal text-sm truncate'>
                  {formattedLastAttempt}
                </span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg shadow-sm space-y-1">
              <div className="text-sm text-muted-foreground">Difficulty</div>
              <div className='font-normal text-sm truncate'>
                {difficultyLabel}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Key Topics:</div>
            <div className="flex flex-wrap gap-1">
              {practice.keySubtopics.map((subtopic, i) => (
                <Badge key={i} variant="outline" className="bg-white">
                  {subtopic}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={handleStart} className="gap-1" variant='outline'>
              {!practice.lastAttempt ? (
                <RotateCcw className="h-4 w-4" />
              ) : (
                <History className="h-4 w-4" />
              )}
              {!practice.lastAttempt ? "Start Session" : "Resume Session"}
              <ArrowRight className="h-4 w-4" />
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
    // Stop autoplay when a session starts
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
    <div className="relative">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Star className="h-5 w-5 text-amber-500" />
        Daily Subject Practice Sessions
        {!isAutoplayEnabled && (
          <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700">
            Autoplay Paused
          </Badge>
        )}
      </h2>

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
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeIndex === index
                    ? 'bg-primary w-5'
                    : 'bg-gray-300 hover:bg-gray-400'
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