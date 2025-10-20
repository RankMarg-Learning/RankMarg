export const STUDY_HOURS_OPTIONS = [2, 4, 6, 8, 10] as const;

export const GRADE_LEVELS = [
  { value: '9', label: 'Class 9', description: 'Starting your foundation' },
  { value: '10', label: 'Class 10', description: 'Strengthen core concepts' },
  { value: '11', label: 'Class 11', description: 'Build exam readiness' },
  { value: '12', label: 'Class 12', description: 'Master problem solving' },
] as const;

export const getTargetYears = () => {
  const year = new Date().getFullYear();
  return [year, year + 1, year + 2];
};


