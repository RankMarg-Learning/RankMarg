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
  FormGrid,
} from '../components/FormField';
import { ExamType } from '@/types/typeAdmin';
import { TextFormator } from '@/utils/textFormator';
import { useExams } from '@/hooks/useExams';
import { useSubjects } from '@/hooks/useSubject';
import { useTopics } from '@/hooks/useTopics';

const BasicInfoForm: React.FC = () => {
  const { state, setBasicInfo, setErrors } = useTestBuilder();
  const { exams, isLoading: isExamsLoading } = useExams();

  // Load subjects when examCode is set (needed for SUBJECT_WISE & CHAPTER_WISE)
  const { subjects, isLoading: isSubjectsLoading } = useSubjects(
    state.examCode || undefined
  );

  // Determine the selected subjectId for topic loading:
  //   - If SUBJECT_WISE, referenceId IS the subjectId
  //   - If CHAPTER_WISE, we need a separate local subjectId to cascade the topic dropdown
  const [chapterSubjectId, setChapterSubjectId] = React.useState<string>('');

  // Reset referenceId any time examType changes so stale IDs don't persist
  const prevExamType = React.useRef(state.examType);
  React.useEffect(() => {
    if (prevExamType.current !== state.examType) {
      setBasicInfo({ referenceId: '' });
      setChapterSubjectId('');
      prevExamType.current = state.examType;
    }
  }, [state.examType, setBasicInfo]);

  // Derive subjectId used to fetch topics for CHAPTER_WISE
  const topicSubjectId = chapterSubjectId || undefined;
  const { topics, isLoading: isTopicsLoading } = useTopics(topicSubjectId);

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
    if (isExamsLoading || !exams) return [];
    return exams.map(exam => ({
      value: exam.code,
      label: exam.name || exam.code,
    }));
  }, [exams, isExamsLoading]);

  const subjectOptions = React.useMemo(() => {
    if (isSubjectsLoading || !subjects) return [];
    return subjects.map((s: any) => ({
      value: s.id,
      label: s.name,
    }));
  }, [subjects, isSubjectsLoading]);

  const topicOptions = React.useMemo(() => {
    if (isTopicsLoading || !topics) return [];
    return topics.map((t: any) => ({
      value: t.id,
      label: t.name,
    }));
  }, [topics, isTopicsLoading]);

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

    if (state.examType === ExamType.SUBJECT_WISE && !state.referenceId) {
      errors.referenceId = 'Subject is required for Subject-wise test';
    }

    if (state.examType === ExamType.CHAPTER_WISE && !state.referenceId) {
      errors.referenceId = 'Topic is required for Chapter-wise test';
    }

    return errors;
  }, [state.title, state.examCode, state.duration, state.examType, state.referenceId]);

  // Validate fields and update errors when relevant fields change
  React.useEffect(() => {
    const errors = validateFields();
    setErrors(errors);
  }, [validateFields, setErrors]);

  const needsSubjectPicker =
    state.examType === ExamType.SUBJECT_WISE ||
    state.examType === ExamType.CHAPTER_WISE;

  const needsTopicPicker = state.examType === ExamType.CHAPTER_WISE;

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

      {needsSubjectPicker && (
        <FormGrid cols={2} gap={4}>
          {state.examType === ExamType.SUBJECT_WISE && (
            <SelectField
              label="Subject *"
              value={state.referenceId}
              onChange={(value) => handleFieldChange('referenceId', value)}
              placeholder={
                !state.examCode
                  ? 'Select an exam code first'
                  : isSubjectsLoading
                    ? 'Loading subjects...'
                    : 'Select subject'
              }
              options={subjectOptions}
              required
              error={state.errors.referenceId}
              id="referenceId-subject"
            />
          )}

          {needsTopicPicker && (
            <>
              <SelectField
                label="Subject *"
                value={chapterSubjectId}
                onChange={(value) => {
                  setChapterSubjectId(value);
                  setBasicInfo({ referenceId: '' });
                }}
                placeholder={
                  !state.examCode
                    ? 'Select an exam code first'
                    : isSubjectsLoading
                      ? 'Loading subjects...'
                      : 'Select subject'
                }
                options={subjectOptions}
                required
                error={!chapterSubjectId ? 'Subject is required to pick a topic' : undefined}
                id="chapter-subject"
              />

              <SelectField
                label="Topic (Chapter) *"
                value={state.referenceId}
                onChange={(value) => handleFieldChange('referenceId', value)}
                placeholder={
                  !chapterSubjectId
                    ? 'Select a subject first'
                    : isTopicsLoading
                      ? 'Loading topics...'
                      : 'Select topic'
                }
                options={topicOptions}
                required
                error={state.errors.referenceId}
                id="referenceId-topic"
              />
            </>
          )}
        </FormGrid>
      )}

      {state.examType && (
        <div className="rounded-md border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
          {state.examType === ExamType.FULL_LENGTH && (
            <span>📋 <strong>Full Length</strong> — no scope restriction. referenceId will not be stored.</span>
          )}
          {state.examType === ExamType.SUBJECT_WISE && (
            <span>📚 <strong>Subject-wise</strong> — the selected subject's ID will be stored as referenceId.</span>
          )}
          {state.examType === ExamType.CHAPTER_WISE && (
            <span>📖 <strong>Chapter-wise</strong> — the selected topic's ID will be stored as referenceId.</span>
          )}
          {![ExamType.FULL_LENGTH, ExamType.SUBJECT_WISE, ExamType.CHAPTER_WISE].includes(state.examType as any) && (
            <span>ℹ️ <strong>{TextFormator(state.examType)}</strong> — referenceId is optional for this type.</span>
          )}
        </div>
      )}
    </FormSection>
  );
};

export default BasicInfoForm;
