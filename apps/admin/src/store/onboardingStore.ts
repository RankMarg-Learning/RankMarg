import {  SubjectData, TopicData } from "@/utils/constants";
import { StandardEnum } from "@repo/db/enums";
import { create } from "zustand";

export type OnboardingStep = 'phone' | 'exam' | 'subjects' | 'grade' | 'year' | 'studyHours' | 'topics';

interface OnboardingState {
  currentStep: OnboardingStep;
  isCompleted: boolean;
  phone: string;
  examCode: string | null;
  gradeLevel: StandardEnum | null;
  targetYear: number | null;
  studyHoursPerDay: number | null;
  selectedSubjects: SubjectData[];
  selectedTopics: TopicData[];

  setPhone: (phone: string) => void; 
  setExamCode: (examCode: string) => void;
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
  examCode: null,
  gradeLevel: null,
  targetYear: null,
  studyHoursPerDay: null,
  selectedSubjects: [],
  selectedTopics: [],

  setPhone: (phone) => set({ phone }),
 
  setExamCode: (examCode) => set(() => ({ 
    examCode,
    // Reset subjects and topics when exam changes
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
    if (!subjectExists && state.examCode) {
      const subjects = getSubjectsByExam(state.examCode);
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
    const steps: OnboardingStep[] = ['phone','exam', 'grade', 'year', 'studyHours', 'topics'];
    const currentIndex = steps.indexOf(state.currentStep);
    
    if (currentIndex === steps.length - 1) {
      return { isCompleted: true };
    }
    
    const nextStep = steps[currentIndex + 1];
    return { currentStep: nextStep };
  }),
  
  previousStep: () => set((state) => {

    const steps: OnboardingStep[] = ['phone','exam', 'grade', 'year', 'studyHours', 'topics'];
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
    examCode: null,
    gradeLevel: null,
    targetYear: null,
    studyHoursPerDay: null,
    selectedSubjects: [],
    selectedTopics: []
  })
}));

const getSubjectsByExam = (examCode: string) => {
  return [];
};

export default useOnboardingStore;