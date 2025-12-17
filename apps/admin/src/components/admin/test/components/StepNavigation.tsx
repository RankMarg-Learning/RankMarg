"use client";

import React from 'react';
import { Button } from '@repo/common-ui';
import { Progress } from '@repo/common-ui';
import { ArrowLeft, ArrowRight, Save, CheckIcon, AlertTriangle } from 'lucide-react';
import { FormStep } from '@/types/typeAdmin';
import { useTestBuilder } from '../../../../context/TestBuilderContext';
import { cn } from '@/lib/utils';

interface StepNavigationProps {
  onSave: () => void;
  onCancel: () => void;
}

const stepConfig = [
  { step: FormStep.BASIC_INFO, label: 'Basic Info', description: 'Test details' },
  { step: FormStep.SECTIONS, label: 'Sections', description: 'Questions & sections' },
  { step: FormStep.REVIEW, label: 'Review', description: 'Finalize & publish' },
];

const StepNavigation: React.FC<StepNavigationProps> = ({ onSave, onCancel }) => {
  const { 
    state, 
    nextStep, 
    previousStep, 
    setCurrentStep, 
    canProceed, 
    isValid 
  } = useTestBuilder();

  const currentStepIndex = stepConfig.findIndex(s => s.step === state.currentStep);
  const progress = ((currentStepIndex + 1) / stepConfig.length) * 100;

  const handleStepClick = (step: FormStep) => {
    const targetIndex = stepConfig.findIndex(s => s.step === step);
    if (targetIndex <= currentStepIndex) {
      setCurrentStep(step);
    }
  };

  const handleNext = () => {
    if (canProceed) {
      nextStep();
    }
  };

  const handlePrevious = () => {
    if (state.currentStep === FormStep.BASIC_INFO) {
      onCancel();
    } else {
      previousStep();
    }
  };

  const isStepCompleted = (step: FormStep) => {
    const stepIndex = stepConfig.findIndex(s => s.step === step);
    return stepIndex < currentStepIndex;
  };

  const isStepCurrent = (step: FormStep) => {
    return step === state.currentStep;
  };

  const isStepAccessible = (step: FormStep) => {
    const stepIndex = stepConfig.findIndex(s => s.step === step);
    return stepIndex <= currentStepIndex;
  };

  return (
    <div className="space-y-4">
      {/* Simple Step Indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          {stepConfig.map((stepItem, index) => {
            const isCompleted = isStepCompleted(stepItem.step);
            const isCurrent = isStepCurrent(stepItem.step);
            const isAccessible = isStepAccessible(stepItem.step);

            return (
              <button
                key={stepItem.step}
                onClick={() => handleStepClick(stepItem.step)}
                disabled={!isAccessible}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm",
                  "hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500",
                  isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                  isCurrent && "bg-primary-50 border border-primary-200"
                )}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-primary-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-3 w-3" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={cn("font-medium", isCurrent && "text-primary-600")}>
                  {stepItem.label}
                </span>
              </button>
            );
          })}
        </div>
        
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Simple Navigation */}
      <div className="flex justify-between items-center pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          {state.currentStep === FormStep.BASIC_INFO ? "Cancel" : "Previous"}
        </Button>

        <div className="flex items-center gap-3">
          {/* Simple Validation Status */}
          {!isValid && state.currentStep !== FormStep.REVIEW && (
            <div className="text-xs text-orange-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              <span>Complete required fields</span>
            </div>
          )}

          {state.currentStep === FormStep.REVIEW ? (
            <Button
              type="button"
              size="sm"
              onClick={() => onSave()}
              disabled={state.loading || !isValid}
              className="flex items-center gap-1"
            >
              {state.loading ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3" />
                  {state.isEditing ? "Update" : "Create"}
                </>
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center gap-1"
            >
              Next
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepNavigation;
