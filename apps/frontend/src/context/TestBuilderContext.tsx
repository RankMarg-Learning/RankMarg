"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { test, ExamType, TestStatus, Visibility, FormStep, testQuestion } from '@/types/typeAdmin';

export interface TestSection {
  id: string;
  name: string;
  isOptional: boolean;
  maxQuestions?: number;
  correctMarks: number;
  negativeMarks: number;
  testQuestion: testQuestion[];
}

export interface TestBuilderState {
  // Basic Info
  title: string;
  description: string;
  examCode: string;
  duration: number;
  examType: ExamType;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  
  // Sections
  testSections: TestSection[];
  
  // Review & Settings
  startTime: Date | null;
  endTime: Date | null;
  visibility: Visibility;
  status: TestStatus;
  
  // UI State
  currentStep: FormStep;
  loading: boolean;
  errors: Record<string, string>;
  
  // Other
  initialTest?: test;
  isEditing: boolean;
}

type TestBuilderAction =
  | { type: 'SET_BASIC_INFO'; payload: Partial<Pick<TestBuilderState, 'title' | 'description' | 'examCode' | 'duration' | 'examType' | 'difficulty'>> }
  | { type: 'SET_SECTIONS'; payload: TestSection[] }
  | { type: 'ADD_SECTION'; payload: TestSection }
  | { type: 'UPDATE_SECTION'; payload: { index: number; section: Partial<TestSection> } }
  | { type: 'REMOVE_SECTION'; payload: number }
  | { type: 'SET_SECTION_QUESTIONS'; payload: { sectionIndex: number; questions: testQuestion[] } }
  | { type: 'SET_REVIEW_INFO'; payload: Partial<Pick<TestBuilderState, 'startTime' | 'endTime' | 'visibility' | 'status'>> }
  | { type: 'SET_CURRENT_STEP'; payload: FormStep }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'RESET_FORM'; payload?: test }
  | { type: 'INITIALIZE'; payload: { initialTest?: test } };

const initialState: TestBuilderState = {
  title: '',
  description: '',
  examCode: '',
  duration: 60,
  examType: ExamType.FULL_LENGTH,
  difficulty: 'MEDIUM',
  testSections: [],
  startTime: new Date(),
  endTime: null,
  visibility: Visibility.PRIVATE,
  status: TestStatus.DRAFT,
  currentStep: FormStep.BASIC_INFO,
  loading: false,
  errors: {},
  isEditing: false,
};

function testBuilderReducer(state: TestBuilderState, action: TestBuilderAction): TestBuilderState {
  switch (action.type) {
    case 'SET_BASIC_INFO':
      return { ...state, ...action.payload };
      
    case 'SET_SECTIONS':
      return { ...state, testSections: action.payload };
      
    case 'ADD_SECTION':
      return { ...state, testSections: [...state.testSections, action.payload] };
      
    case 'UPDATE_SECTION':
      return {
        ...state,
        testSections: state.testSections.map((section, index) =>
          index === action.payload.index
            ? { ...section, ...action.payload.section }
            : section
        ),
      };
      
    case 'REMOVE_SECTION':
      return {
        ...state,
        testSections: state.testSections.filter((_, index) => index !== action.payload),
      };
      
    case 'SET_SECTION_QUESTIONS':
      return {
        ...state,
        testSections: state.testSections.map((section, index) =>
          index === action.payload.sectionIndex
            ? { ...section, testQuestion: action.payload.questions }
            : section
        ),
      };
      
    case 'SET_REVIEW_INFO':
      return { ...state, ...action.payload };
      
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
      
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
      
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
      
    case 'RESET_FORM':
      const resetData = action.payload;
      return {
        ...initialState,
        ...(resetData && {
          title: resetData.title || '',
          description: resetData.description || '',
          examCode: resetData.examCode || '',
          duration: resetData.duration || 60,
          examType: resetData.examType || ExamType.FULL_LENGTH,
          difficulty: (resetData.difficulty as 'EASY' | 'MEDIUM' | 'HARD') || 'MEDIUM',
          testSections: resetData.testSection?.map(section => ({
            id: `section-${Date.now()}-${Math.random()}`,
            name: section.name,
            isOptional: section.isOptional,
            maxQuestions: section.maxQuestions,
            correctMarks: section.correctMarks,
            negativeMarks: section.negativeMarks,
            testQuestion: section.testQuestion || [],
          })) || [],
          startTime: resetData.startTime ? new Date(resetData.startTime) : new Date(),
          endTime: resetData.endTime ? new Date(resetData.endTime) : null,
          visibility: resetData.visibility || Visibility.PRIVATE,
          status: resetData.status || TestStatus.DRAFT,
          isEditing: true,
          initialTest: resetData,
        }),
      };
      
    case 'INITIALIZE':
      return {
        ...initialState,
        ...action.payload,
        isEditing: !!action.payload.initialTest,
      };
      
    default:
      return state;
  }
}

interface TestBuilderContextType {
  state: TestBuilderState;
  dispatch: React.Dispatch<TestBuilderAction>;
  
  // Convenience functions
  setBasicInfo: (info: Partial<Pick<TestBuilderState, 'title' | 'description' | 'examCode' | 'duration' | 'examType' | 'difficulty'>>) => void;
  addSection: () => void;
  updateSection: (index: number, section: Partial<TestSection>) => void;
  removeSection: (index: number) => void;
  setSectionQuestions: (sectionIndex: number, questions: testQuestion[]) => void;
  setReviewInfo: (info: Partial<Pick<TestBuilderState, 'startTime' | 'endTime' | 'visibility' | 'status'>>) => void;
  nextStep: () => void;
  previousStep: () => void;
  setCurrentStep: (step: FormStep) => void;
  setLoading: (loading: boolean) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  reset: (initialTest?: test) => void;
  
  // Computed values
  isValid: boolean;
  canProceed: boolean;
  totalQuestions: number;
  totalMarks: number;
}

const TestBuilderContext = createContext<TestBuilderContextType | undefined>(undefined);

export const useTestBuilder = () => {
  const context = useContext(TestBuilderContext);
  if (!context) {
    throw new Error('useTestBuilder must be used within a TestBuilderProvider');
  }
  return context;
};

interface TestBuilderProviderProps {
  children: ReactNode;
  initialTest?: test;
}

export const TestBuilderProvider: React.FC<TestBuilderProviderProps> = ({ 
  children, 
  initialTest 
}) => {
  const [state, dispatch] = useReducer(testBuilderReducer, initialState);

  React.useEffect(() => {
    dispatch({ type: 'INITIALIZE', payload: { initialTest } });
    if (initialTest) {
      dispatch({ type: 'RESET_FORM', payload: initialTest });
    }
  }, [initialTest]);

  // Convenience functions - memoized to prevent infinite re-renders
  const setBasicInfo = React.useCallback((info: Partial<Pick<TestBuilderState, 'title' | 'description' | 'examCode' | 'duration' | 'examType' | 'difficulty'>>) => {
    dispatch({ type: 'SET_BASIC_INFO', payload: info });
  }, []);

  const addSection = React.useCallback(() => {
    const newSection: TestSection = {
      id: `section-${Date.now()}-${Math.random()}`,
      name: `Section ${state.testSections.length + 1}`,
      isOptional: false,
      maxQuestions: 0,
      correctMarks: 4,
      negativeMarks: 1,
      testQuestion: [],
    };
    dispatch({ type: 'ADD_SECTION', payload: newSection });
  }, [state.testSections.length]);

  const updateSection = React.useCallback((index: number, section: Partial<TestSection>) => {
    dispatch({ type: 'UPDATE_SECTION', payload: { index, section } });
  }, []);

  const removeSection = React.useCallback((index: number) => {
    dispatch({ type: 'REMOVE_SECTION', payload: index });
  }, []);

  const setSectionQuestions = React.useCallback((sectionIndex: number, questions: testQuestion[]) => {
    dispatch({ type: 'SET_SECTION_QUESTIONS', payload: { sectionIndex, questions } });
  }, []);

  const setReviewInfo = React.useCallback((info: Partial<Pick<TestBuilderState, 'startTime' | 'endTime' | 'visibility' | 'status'>>) => {
    dispatch({ type: 'SET_REVIEW_INFO', payload: info });
  }, []);

  const nextStep = React.useCallback(() => {
    const nextStepValue = Math.min(state.currentStep + 1, FormStep.REVIEW) as FormStep;
    dispatch({ type: 'SET_CURRENT_STEP', payload: nextStepValue });
  }, [state.currentStep]);

  const previousStep = React.useCallback(() => {
    const prevStepValue = Math.max(state.currentStep - 1, FormStep.BASIC_INFO) as FormStep;
    dispatch({ type: 'SET_CURRENT_STEP', payload: prevStepValue });
  }, [state.currentStep]);

  const setCurrentStep = React.useCallback((step: FormStep) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  }, []);

  const setLoading = React.useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setErrors = React.useCallback((errors: Record<string, string>) => {
    dispatch({ type: 'SET_ERRORS', payload: errors });
  }, []);

  const clearErrors = React.useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const reset = React.useCallback((initialTest?: test) => {
    dispatch({ type: 'RESET_FORM', payload: initialTest });
  }, []);

  // Computed values
  const isValid = React.useMemo(() => {
    switch (state.currentStep) {
      case FormStep.BASIC_INFO:
        return !!(state.title && state.examCode && state.duration > 0);
      case FormStep.SECTIONS:
        return state.testSections.length > 0 && 
               state.testSections.every(section => 
                 section.name && 
                 section.correctMarks > 0 && 
                 section.negativeMarks >= 0 &&
                 section.testQuestion.length > 0
               );
      case FormStep.REVIEW:
        return true;
      default:
        return false;
    }
  }, [state]);

  const canProceed = isValid && !state.loading;

  const totalQuestions = React.useMemo(() => {
    return state.testSections.reduce((total, section) => total + section.testQuestion.length, 0);
  }, [state.testSections]);

  const totalMarks = React.useMemo(() => {
    return state.testSections.reduce((total, section) => 
      total + (section.testQuestion.length * section.correctMarks), 0);
  }, [state.testSections]);

  const contextValue: TestBuilderContextType = React.useMemo(() => ({
    state,
    dispatch,
    setBasicInfo,
    addSection,
    updateSection,
    removeSection,
    setSectionQuestions,
    setReviewInfo,
    nextStep,
    previousStep,
    setCurrentStep,
    setLoading,
    setErrors,
    clearErrors,
    reset,
    isValid,
    canProceed,
    totalQuestions,
    totalMarks,
  }), [
    state,
    dispatch,
    setBasicInfo,
    addSection,
    updateSection,
    removeSection,
    setSectionQuestions,
    setReviewInfo,
    nextStep,
    previousStep,
    setCurrentStep,
    setLoading,
    setErrors,
    clearErrors,
    reset,
    isValid,
    canProceed,
    totalQuestions,
    totalMarks,
  ]);

  return (
    <TestBuilderContext.Provider value={contextValue}>
      {children}
    </TestBuilderContext.Provider>
  );
};
