"use client";

import React from 'react';
// Removed unused Card imports
import { FormStep, test } from '@/types/typeAdmin';
import { TestBuilderProvider, useTestBuilder } from '../../../context/TestBuilderContext';
import StepNavigation from './components/StepNavigation';
import BasicInfoForm from './forms/BasicInfoForm';
import SectionsForm from './forms/SectionsForm';
import ReviewForm from './forms/ReviewForm';
import { Alert, AlertDescription } from '@repo/common-ui';
import { AlertTriangle } from 'lucide-react';

interface TestBuilderProps {
  initialTest?: test;
  onSave: (test: Partial<test>) => void;
  onCancel: () => void;
  loading?: boolean;
}

// Internal component that uses the context
const TestBuilderContent: React.FC<{
  onSave: (test: Partial<test>) => void;
  onCancel: () => void;
  externalLoading?: boolean;
}> = ({ onSave, onCancel, externalLoading = false }) => {
  const { state, setLoading } = useTestBuilder();

  // Sync external loading state
  React.useEffect(() => {
    setLoading(externalLoading);
  }, [externalLoading, setLoading]);

  const handleSave = () => {
    const testData: Partial<test> = {
      title: state.title,
      description: state.description,
      examCode: state.examCode,
      duration: state.duration,
      examType: state.examType,
      difficulty: state.difficulty,
      startTime: state.startTime,
      endTime: state.endTime,
      visibility: state.visibility,
      status: state.status,
      testSection: state.testSections.map(section => ({
        name: section.name,
        isOptional: section.isOptional,
        maxQuestions: section.maxQuestions,
        correctMarks: section.correctMarks,
        negativeMarks: section.negativeMarks,
        testQuestion: section.testQuestion,
      })),
      // Add metadata
      ...(state.isEditing ? {} : { createdAt: new Date().toISOString() }),
    };

    onSave(testData);
  };

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case FormStep.BASIC_INFO:
        return <BasicInfoForm />;
      case FormStep.SECTIONS:
        return <SectionsForm />;
      case FormStep.REVIEW:
        return <ReviewForm />;
      default:
        return <BasicInfoForm />;
    }
  };

  const hasErrors = Object.keys(state.errors).length > 0;

  return (
    <div className="w-full space-y-4">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {state.isEditing ? 'Edit Test' : 'Create Test'}
        </h1>
        {hasErrors && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>{Object.keys(state.errors).length} error(s) found</span>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {Object.entries(state.errors).slice(0, 3).map(([field, error]) => (
              <div key={field}>{error}</div>
            ))}
            {Object.keys(state.errors).length > 3 && (
              <div className="text-xs mt-1">
                +{Object.keys(state.errors).length - 3} more errors
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="bg-white border rounded-lg">
        {/* Simple Header */}
        <div className="px-6 py-3 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              Step {state.currentStep + 1} of 3
            </div>
            <div className="text-xs text-gray-600">
              {state.currentStep === FormStep.BASIC_INFO && "Basic Information"}
              {state.currentStep === FormStep.SECTIONS && "Sections & Questions"}
              {state.currentStep === FormStep.REVIEW && "Review & Finalize"}
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Current Step Content */}
          <div className="min-h-[400px]">
            {renderCurrentStep()}
          </div>
          
          {/* Step Navigation */}
          <StepNavigation onSave={handleSave} onCancel={onCancel} />
        </div>
      </div>

      {/* Simple Loading Overlay */}
      {state.loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            <span>Saving test...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Main TestBuilder component with provider
const TestBuilder: React.FC<TestBuilderProps> = ({ 
  initialTest, 
  onSave, 
  onCancel, 
  loading = false 
}) => {
  return (
    <TestBuilderProvider initialTest={initialTest}>
      <TestBuilderContent 
        onSave={onSave} 
        onCancel={onCancel} 
        externalLoading={loading}
      />
    </TestBuilderProvider>
  );
};

export default TestBuilder;
