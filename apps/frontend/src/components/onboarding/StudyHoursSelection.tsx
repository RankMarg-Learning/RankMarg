import React from 'react';
import { cn } from '@/lib/utils';
import { STUDY_HOURS_OPTIONS } from '@/utils/constants';
import useOnboardingStore from '@/store/onboardingStore';
import Motion from '@/components/ui/motion';
import OnboardingLayout from './OnboardingLayout';
import { Card } from '@/components/ui/card';
import { Slider } from '../ui/slider';

const StudyHoursSelection: React.FC = () => {
  const { studyHoursPerDay, setStudyHoursPerDay } = useOnboardingStore();
  
  const handleSelectHours = (hours: number) => {
    setStudyHoursPerDay(hours);
  };

  const handleSliderChange = (value: number[]) => {
    setStudyHoursPerDay(value[0]);
  };

  // Find nearest study hours option for slider
  const sliderValue = studyHoursPerDay || 4;

  return (
    <OnboardingLayout
      title="Daily Study Commitment"
      subtitle="How many hours can you dedicate to study each day?"
      nextDisabled={!studyHoursPerDay}
    >
      <div className="max-w-xl mx-auto w-full">
        <Motion animation="slide-in-up" delay={150} className="w-full mb-6">
          <div className="py-4 px-2">
            <Slider
              value={[sliderValue]}
              min={2}
              max={10}
              step={2}
              onValueChange={handleSliderChange}
              className="w-full"
            />
            
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              {STUDY_HOURS_OPTIONS.map((option) => (
                <div key={option.value} className="text-center">
                  <div className="h-1 w-1 rounded-full bg-muted-foreground mx-auto mb-1" />
                  {option.value}
                </div>
              ))}
            </div>
          </div>
        </Motion>
        
        <Motion animation="scale-in" delay={200} className="w-full">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {STUDY_HOURS_OPTIONS.map((option, index) => (
              <Card
                key={option.value}
                className={cn(
                  "border-2 cursor-pointer transition-all duration-200 hover:shadow-md p-3 text-center h-full flex flex-col justify-center",
                  studyHoursPerDay === option.value
                    ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
                onClick={() => handleSelectHours(option.value)}
              >
                <p className="text-lg font-semibold mb-1">{option.value}h</p>
                <p className="text-xs text-muted-foreground">
                  {option.value === 2
                    ? "Basic"
                    : option.value === 4
                    ? "Regular"
                    : option.value === 6
                    ? "Focused"
                    : option.value === 8
                    ? "Intense"
                    : "Pro"}
                </p>
              </Card>
            ))}
          </div>
        </Motion>
      </div>
    </OnboardingLayout>
  );
};

export default StudyHoursSelection;