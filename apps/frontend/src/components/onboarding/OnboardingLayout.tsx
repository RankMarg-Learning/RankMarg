import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useOnboardingStore, { OnboardingStep } from '@/store/onboardingStore';
import { useToast } from '@/hooks/use-toast';
import Motion from '../ui/motion';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  nextDisabled?: boolean;
  previousDisabled?: boolean;
  hideProgress?: boolean;
  onNext?: () => Promise<boolean | void>;
  onPrevious?: () => void;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  subtitle,
  className,
  nextDisabled = false,
  previousDisabled = false,
  onNext,
  onPrevious,
}) => {
  const { currentStep, nextStep, previousStep } = useOnboardingStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleNext = async () => {
    if (nextDisabled) return;
    
    setIsSubmitting(true);
    try {
      if (onNext) {
        const result = await onNext();
        if (result === true) {
          nextStep();
        }
      } else {
        nextStep();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "There was an error proceeding to the next step",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (previousDisabled) return;
    
    if (onPrevious) {
      onPrevious();
    }
    previousStep();
  };

  const steps: OnboardingStep[] = ['phone','stream', 'grade', 'year', 'studyHours', 'topics'];
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-2 py-12 yellow-gradient ">
      <Motion
        animation="scale-in"
        className={cn("bg-white/90 backdrop-blur-sm max-w-5xl w-full mx-auto rounded-2xl p-6 shadow-md border border-border/30 relative flex flex-col", className)}
      >
    
        
        <div className="text-center mb-6 pt-2">
          <Motion animation="slide-in-up" delay={100}>
            <h1 className="text-2xl font-bold tracking-tight mb-1">{title}</h1>
          </Motion>
          
          {subtitle && (
            <Motion animation="slide-in-up" delay={150}>
              <p className="text-muted-foreground max-w-lg mx-auto text-sm">{subtitle}</p>
            </Motion>
          )}
        </div>
        
        <Motion animation="slide-in-up" delay={200} className="flex-grow w-full">
          {children}
        </Motion>
        
        <Motion animation="slide-in-up" delay={250}>
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/30">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={previousDisabled || isSubmitting}
              className={cn(
                "rounded-full px-4 py-2 transition-all duration-200",
                previousDisabled && "opacity-0 pointer-events-none"
              )}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1 w-1 rounded-full transition-all duration-200",
                    index === currentStepIndex
                      ? "bg-primary w-4"
                      : index < currentStepIndex
                      ? "bg-primary"
                      : "bg-secondary/70"
                  )}
                />
              ))}
            </div>
            
            <Button
              onClick={handleNext}
              disabled={nextDisabled || isSubmitting}
              className="rounded-full px-4 py-2 transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              ) : currentStep === 'topics' ? (
                <>
                  Complete
                  <Check className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </Motion>
      </Motion>
    </div>
  );
};

export default OnboardingLayout;