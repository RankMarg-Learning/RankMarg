import {  SubjectData, TopicData } from "@/utils/constants";
import { StandardEnum, Stream } from "@prisma/client";
import { create } from "zustand";

export type OnboardingStep = 'phone' | 'stream' | 'grade' | 'year' | 'studyHours' | 'subjects' | 'topics';

interface OnboardingState {
  currentStep: OnboardingStep;
  isCompleted: boolean;

  // User selections
  phone: string;
  stream: Stream | null;
  gradeLevel: StandardEnum | null;
  targetYear: number | null;
  studyHoursPerDay: number | null;
  selectedSubjects: SubjectData[];
  selectedTopics: TopicData[];

  // Actions
  setPhone: (phone: string) => void; 
  setStream: (stream: Stream) => void;
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
  currentStep: 'phone',
  isCompleted: false,
  phone: '',
  stream: null,
  gradeLevel: null,
  targetYear: null,
  studyHoursPerDay: null,
  selectedSubjects: [],
  selectedTopics: [],

  // Actions
  setPhone: (phone) => set({ phone }),
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
    selectedTopics: state.selectedTopics.filter(t => t.subjectId !== subjectId)
  })),
  
  addTopic: (topic) => set((state) => {
    const subjectExists = state.selectedSubjects.some(s => s.id === topic.subjectId);
    
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
    const steps: OnboardingStep[] = ['phone','stream', 'grade', 'year', 'studyHours', 'topics'];
    const currentIndex = steps.indexOf(state.currentStep);
    
    if (currentIndex === steps.length - 1) {
      return { isCompleted: true };
    }
    
    const nextStep = steps[currentIndex + 1];
    return { currentStep: nextStep };
  }),
  
  previousStep: () => set((state) => {

    const steps: OnboardingStep[] = ['phone','stream', 'grade', 'year', 'studyHours', 'topics'];
    const currentIndex = steps.indexOf(state.currentStep);
    
    if (currentIndex === 0) {
      return {};
    }
    
    const previousStep = steps[currentIndex - 1];
    return { currentStep: previousStep };
  }),
  
  completeOnboarding: () => set({ isCompleted: true }),
  
  resetOnboarding: () => set({
    currentStep: 'phone',
    isCompleted: false,
    stream: null,
    gradeLevel: null,
    targetYear: null,
    studyHoursPerDay: null,
    selectedSubjects: [],
    selectedTopics: []
  })
}));

const getSubjectsByStream = (stream: Stream) => {
  return [];
};

export default useOnboardingStore;