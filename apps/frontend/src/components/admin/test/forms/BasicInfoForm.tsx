"use client";

import React from 'react';
import { Clock } from 'lucide-react';
import { useTestBuilder } from '../../../../context/TestBuilderContext';
import { 
  TextField, 
  NumberField, 
  TextareaField, 
  SelectField, 
  FormSection, 
  FormGrid 
} from '../components/FormField';
import { ExamType } from '@/types/typeAdmin';
import { TextFormator } from '@/utils/textFormator';
import { useExams } from '@/hooks/useExams';

const BasicInfoForm: React.FC = () => {
  const { state, setBasicInfo, setErrors } = useTestBuilder();
  const { exams, isLoading: isExamsLoading } = useExams();

  const examTypeOptions = Object.entries(ExamType).map(([key, value]) => ({
    value: key,
    label: TextFormator(value),
  }));

  const difficultyOptions = [
    { value: 'EASY', label: 'Easy' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HARD', label: 'Hard' },
  ];

  const examCodeOptions = React.useMemo(() => {
    if (isExamsLoading || !exams?.data) return [];
    return exams.data.map(exam => ({
      value: exam.code,
      label: exam.name || exam.code,
    }));
  }, [exams?.data, isExamsLoading]);

  const handleFieldChange = React.useCallback((field: string, value: any) => {
    setBasicInfo({ [field]: value });
  }, [setBasicInfo]);

  const validateFields = React.useCallback(() => {
    const errors: Record<string, string> = {};
    
    if (!state.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!state.examCode) {
      errors.examCode = 'Exam code is required';
    }
    
    if (!state.duration || state.duration < 1) {
      errors.duration = 'Duration must be at least 1 minute';
    }
    
    if (!state.examType) {
      errors.examType = 'Exam type is required';
    }

    return errors;
  }, [state.title, state.examCode, state.duration, state.examType]);

  // Validate fields and update errors when relevant fields change
  React.useEffect(() => {
    const errors = validateFields();
    setErrors(errors);
  }, [validateFields, setErrors]);

  return (
    <FormSection 
      title="Basic Information"
      description="Enter the basic details for your test"
    >
      <FormGrid cols={4} gap={4}>
        <div className="col-span-2">
          <TextField
            label="Test Title"
            value={state.title}
            onChange={(value) => handleFieldChange('title', value)}
            placeholder="Enter test title"
            required
            error={state.errors.title}
            id="title"
          />
        </div>
        
        <SelectField
          label="Exam Code"
          value={state.examCode}
          onChange={(value) => handleFieldChange('examCode', value)}
          placeholder={isExamsLoading ? "Loading..." : "Select exam code"}
          options={examCodeOptions}
          required
          error={state.errors.examCode}
          id="examCode"
        />
        
        <div className="relative">
          <NumberField
            label="Duration (min)"
            value={state.duration}
            onChange={(value) => handleFieldChange('duration', value)}
            placeholder="60"
            min={1}
            step={1}
            required
            error={state.errors.duration}
            id="duration"
          />
          <Clock className="absolute right-3 top-8 h-4 w-4 text-gray-500 pointer-events-none" />
        </div>
      </FormGrid>

      <FormGrid cols={3} gap={4}>
        <div className="col-span-2">
          <TextareaField
            label="Description"
            value={state.description}
            onChange={(value) => handleFieldChange('description', value)}
            placeholder="Write a description for this test (optional)"
            rows={2}
            error={state.errors.description}
            id="description"
          />
        </div>
        
        <div className="space-y-3">
          <SelectField
            label="Exam Type"
            value={state.examType}
            onChange={(value) => handleFieldChange('examType', value)}
            placeholder="Select exam type"
            options={examTypeOptions}
            required
            error={state.errors.examType}
            id="examType"
          />
          
          <SelectField
            label="Difficulty"
            value={state.difficulty}
            onChange={(value) => handleFieldChange('difficulty', value)}
            placeholder="Select difficulty"
            options={difficultyOptions}
            required
            error={state.errors.difficulty}
            id="difficulty"
          />
        </div>
      </FormGrid>
    </FormSection>
  );
};

export default BasicInfoForm;
