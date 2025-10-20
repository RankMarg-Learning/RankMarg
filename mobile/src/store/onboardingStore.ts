import { create } from 'zustand';

export type OnboardingStep = 'phone' | 'exam' | 'grade' | 'year' | 'studyHours' | 'topics';

export type TopicData = {
  id: string;
  name: string;
  subjectId: string;
};

type OnboardingState = {
  currentStep: OnboardingStep;
  isCompleted: boolean;

  phone: string;
  examCode?: string;
  gradeLevel?: string;
  targetYear?: number;
  studyHoursPerDay?: number;
  selectedTopics: TopicData[];

  setPhone: (phone: string) => void;
  setExamCode: (code?: string) => void;
  setGradeLevel: (grade?: string) => void;
  setTargetYear: (year?: number) => void;
  setStudyHoursPerDay: (hours?: number) => void;
  addTopic: (topic: TopicData) => void;
  removeTopic: (topicId: string) => void;
  resetOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  complete: () => void;
};

const steps: OnboardingStep[] = ['phone','exam','grade','year','studyHours','topics'];

const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentStep: 'phone',
  isCompleted: false,

  phone: '',
  examCode: undefined,
  gradeLevel: undefined,
  targetYear: undefined,
  studyHoursPerDay: undefined,
  selectedTopics: [],

  setPhone: (phone) => set({ phone }),
  setExamCode: (code) => set({ examCode: code }),
  setGradeLevel: (grade) => set({ gradeLevel: grade }),
  setTargetYear: (year) => set({ targetYear: year }),
  setStudyHoursPerDay: (hours) => set({ studyHoursPerDay: hours }),
  addTopic: (topic) => {
    const existing = get().selectedTopics;
    const filtered = existing.filter(t => t.subjectId !== topic.subjectId);
    set({ selectedTopics: [...filtered, topic] });
  },
  removeTopic: (topicId) => set({ selectedTopics: get().selectedTopics.filter(t => t.id !== topicId) }),
  resetOnboarding: () => set({
    currentStep: 'phone',
    isCompleted: false,
    phone: '',
    examCode: undefined,
    gradeLevel: undefined,
    targetYear: undefined,
    studyHoursPerDay: undefined,
    selectedTopics: [],
  }),
  nextStep: () => {
    const idx = steps.indexOf(get().currentStep);
    if (idx < steps.length - 1) set({ currentStep: steps[idx + 1] });
    else set({ isCompleted: true });
  },
  previousStep: () => {
    const idx = steps.indexOf(get().currentStep);
    if (idx > 0) set({ currentStep: steps[idx - 1] });
  },
  complete: () => set({ isCompleted: true }),
}));

export default useOnboardingStore;

