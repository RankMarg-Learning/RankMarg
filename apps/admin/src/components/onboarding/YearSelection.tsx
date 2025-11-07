import React from 'react';
import { cn } from '@/lib/utils';
import { getTargetYears } from '@/utils/constants';
import useOnboardingStore from '@/store/onboardingStore';
import Motion from '@/components/ui/motion';
import OnboardingLayout from './OnboardingLayout';
import { Card } from '@/components/ui/card';

const YearSelection: React.FC = () => {
  const { targetYear, setTargetYear, examCode } = useOnboardingStore();
  const targetYears = getTargetYears();
  const currentYear = new Date().getFullYear();

  const handleSelectYear = (year: number) => {
    setTargetYear(year);
  };

  return (
    <OnboardingLayout
      title="Target Exam Year"
      subtitle={`When do you plan to take the ${examCode} exam?`}
      nextDisabled={!targetYear}
    >
      <div className="max-w-xl mx-auto w-full">
        <div className="grid grid-cols-3  gap-3">
          {targetYears.map((year, index) => (
            <Motion
              key={year}
              animation="scale-in"
              delay={150 + index * 50}
            >
              <Card
                className={cn(
                  "border-2 cursor-pointer transition-all duration-200 hover:shadow-md p-4 text-center h-full flex flex-col items-center justify-center",
                  targetYear === year
                    ? "border-primary ring-0 ring-primary/20 bg-primary/5"
                    : "border-border hover:border-primary/30",
                )}
                onClick={() => handleSelectYear(year)}
              >
                <div className="relative">
                  <p className="text-2xl font-bold mb-1">{year}</p>
                  <p className="text-xs text-muted-foreground">
                    {year === currentYear
                      ? "This Year"
                      : year === currentYear + 1
                      ? "Next Year"
                      : `In ${year - currentYear} Years`}
                  </p>
                </div>
              </Card>
            </Motion>
          ))}
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default YearSelection;