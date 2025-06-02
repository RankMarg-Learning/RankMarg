import {  SubjectData, TopicData } from "@/utils/constants";
import { StandardEnum } from "@prisma/client";
import { create } from "zustand";

export type OnboardingStep = 'stream' | 'grade' | 'year' | 'studyHours' | 'subjects' | 'topics';

interface OnboardingState {
  currentStep: OnboardingStep;
  isCompleted: boolean;

  // User selections
  stream: "JEE" | "NEET" | null;
  gradeLevel: StandardEnum | null;
  targetYear: number | null;
  studyHoursPerDay: number | null;
  selectedSubjects: SubjectData[];
  selectedTopics: TopicData[];

  // Actions
  setStream: (stream: "JEE" | "NEET") => void;
  setGradeLevel: (grade: StandardEnum) => void;
  setTargetYear: (year: number) => void;
  setStudyHoursPerDay: (hours: number) => void;
  addSubject: (subject: SubjectData) => void;
  removeSubject: (subjectId: string) => void;
  addTopic: (topic: TopicData) => void;
  removeTopic: (topicId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 'stream',
  isCompleted: false,
  stream: null,
  gradeLevel: null,
  targetYear: null,
  studyHoursPerDay: null,
  selectedSubjects: [],
  selectedTopics: [],

  // Actions
  setStream: (stream) => set((state) => ({ 
    stream, 
    selectedSubjects: [],
    selectedTopics: [] 
  })),
  
  setGradeLevel: (gradeLevel) => set({ gradeLevel }),
  
  setTargetYear: (targetYear) => set({ targetYear }),
  
  setStudyHoursPerDay: (studyHoursPerDay) => set({ studyHoursPerDay }),
  
  addSubject: (subject) => set((state) => ({
    selectedSubjects: [...state.selectedSubjects, subject]
  })),
  
  removeSubject: (subjectId) => set((state) => ({
    selectedSubjects: state.selectedSubjects.filter(s => s.id !== subjectId),
    // Also remove any topics associated with this subject
    selectedTopics: state.selectedTopics.filter(t => t.subjectId !== subjectId)
  })),
  
  addTopic: (topic) => set((state) => {
    // Check if this topic's subject is already in selectedSubjects
    const subjectExists = state.selectedSubjects.some(s => s.id === topic.subjectId);
    
    // If not, find the subject and add it
    let updatedSubjects = [...state.selectedSubjects];
    if (!subjectExists && state.stream) {
      const subjects = getSubjectsByStream(state.stream);
      const subject = subjects.find(s => s.id === topic.subjectId);
      if (subject) {
        updatedSubjects = [...updatedSubjects, subject];
      }
    }
    
    return {
      selectedTopics: [...state.selectedTopics, topic],
      selectedSubjects: updatedSubjects
    };
  }),
  
  removeTopic: (topicId) => set((state) => ({
    selectedTopics: state.selectedTopics.filter(t => t.id !== topicId)
  })),
  
  nextStep: () => set((state) => {
    // Define the order of steps
    const steps: OnboardingStep[] = ['stream', 'grade', 'year', 'studyHours', 'topics'];
    const currentIndex = steps.indexOf(state.currentStep);
    
    // If we're at the last step, mark as completed
    if (currentIndex === steps.length - 1) {
      return { isCompleted: true };
    }
    
    // Otherwise, move to the next step
    const nextStep = steps[currentIndex + 1];
    return { currentStep: nextStep };
  }),
  
  previousStep: () => set((state) => {
    // Define the order of steps
    const steps: OnboardingStep[] = ['stream', 'grade', 'year', 'studyHours', 'topics'];
    const currentIndex = steps.indexOf(state.currentStep);
    
    // If we're at the first step, do nothing
    if (currentIndex === 0) {
      return {};
    }
    
    const previousStep = steps[currentIndex - 1];
    return { currentStep: previousStep };
  }),
  
  completeOnboarding: () => set({ isCompleted: true }),
  
  resetOnboarding: () => set({
    currentStep: 'stream',
    isCompleted: false,
    stream: null,
    gradeLevel: null,
    targetYear: null,
    studyHoursPerDay: null,
    selectedSubjects: [],
    selectedTopics: []
  })
}));

// Needed for the addTopic action
const getSubjectsByStream = (stream: "JEE" | "NEET") => {
  // This is a simplified version just for the store
  // The actual implementation is in utils/constants.ts
  return [];
};

export default useOnboardingStore;