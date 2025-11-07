import React from 'react';
import { cn } from '@/lib/utils';
import useOnboardingStore from '@/store/onboardingStore';
import OnboardingLayout from './OnboardingLayout';
import { Card } from '@/components/ui/card';
import Motion from '../ui/motion';
import { GRADE_LEVELS } from '@/utils/constants';

const GradeSelection: React.FC = () => {
  const { gradeLevel, setGradeLevel, examCode } = useOnboardingStore();

  const handleSelectGrade = (grade: typeof gradeLevel) => {
    if (grade) {
      setGradeLevel(grade);
    }
  };

  return (
    <OnboardingLayout
      title="Your Current Grade"
      subtitle={`Select your current grade level for ${examCode} preparation`}
      nextDisabled={!gradeLevel}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
        {GRADE_LEVELS.map((grade, index) => (
          <Motion
            key={grade.value}
            animation="scale-in"
            delay={150 + index * 50}
          >
            <Card
              className={cn(
                "border-2 cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden h-full",
                gradeLevel === grade.value
                  ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                  : "border-border hover:border-primary/30"
              )}
              onClick={() => handleSelectGrade(grade.value)}
            >
              <div className="p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{grade.label}</h3>
                 
                </div>
                <p className="text-sm text-muted-foreground">{grade.description}</p>
              </div>
            </Card>
          </Motion>
        ))}
      </div>
    </OnboardingLayout>
  );
};

export default GradeSelection