import { Progress } from '@/components/ui/progress'
import { FormStep } from '@/types/typeAdmin'
import { CheckIcon } from 'lucide-react'
import React from 'react'

const StepIndicator = ({currentStep}:{currentStep:number}) => {
    const totalSteps = 2; // Basic Info, Sections, Review
    const progress = ((currentStep ) / totalSteps) * 100;
  return (
    <div className="mb-8">
    <div className="flex justify-between mb-2">
      <div className="flex items-center">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= FormStep.BASIC_INFO ? 'bg-primary' : 'bg-secondary'} text-white mr-2`}>
          {currentStep > FormStep.BASIC_INFO ? <CheckIcon className="h-4 w-4" /> : "1"}
        </div>
        <span className={currentStep === FormStep.BASIC_INFO ? "font-medium" : ""}>Basic Info</span>
      </div>
      <div className="flex items-center">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= FormStep.SECTIONS ? 'bg-primary' : 'bg-secondary'} text-white mr-2`}>
          {currentStep > FormStep.SECTIONS ? <CheckIcon className="h-4 w-4" /> : "2"}
        </div>
        <span className={currentStep === FormStep.SECTIONS ? "font-medium" : ""}>Sections</span>
      </div>
      <div className="flex items-center">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= FormStep.REVIEW ? 'bg-primary' : 'bg-secondary'} text-white mr-2`}>
          3
        </div>
        <span className={currentStep === FormStep.REVIEW ? "font-medium" : ""}>Review</span>
      </div>
    </div>
    <Progress value={progress} className="h-2" indicatorColor="bg-primary" />
  </div>
  )
}

export default StepIndicator