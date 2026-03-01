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
import { getTopics } from '@/services/topic.service';

const BasicInfoForm: React.FC = () => {
  const { state, setBasicInfo, setErrors } = useTestBuilder();
  const { exams, isLoading: isExamsLoading } = useExams();

  const { subjects, isLoading: isSubjectsLoading } = useSubjects(
    state.examCode || undefined
  );

  const [chapterSubjectId, setChapterSubjectId] = React.useState<string>('');

  const { topics, isLoading: isTopicsLoading } = useTopics(
    chapterSubjectId || undefined
  );

  const didAutoResolve = React.useRef(false);

  React.useEffect(() => {
    if (!state.isEditing) return;
    if (state.examType !== ExamType.CHAPTER_WISE) return;
    if (!state.referenceId) return;
    if (didAutoResolve.current) return;

    const resolveChapterSubject = async () => {
      try {
        const result = await getTopics();
        const allTopics: any[] = result?.data ?? [];
        const matchedTopic = allTopics.find(
          (t: any) => t.id === state.referenceId
        );
        if (matchedTopic?.subjectId) {
          setChapterSubjectId(matchedTopic.subjectId);
          didAutoResolve.current = true;
        }
      } catch {
      }
    };

    resolveChapterSubject();
  }, [state.isEditing, state.examType, state.referenceId]);


  const userChangedExamType = React.useRef(false);
  React.useEffect(() => {
    if (!userChangedExamType.current) return;
    userChangedExamType.current = false;
    setBasicInfo({ referenceId: '' });
    setChapterSubjectId('');
    didAutoResolve.current = false;
  }, [state.examType, setBasicInfo]);

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
    return exams.map((exam: any) => ({
      value: exam.code,
      label: exam.name || exam.code,
    }));
  }, [exams, isExamsLoading]);

  const subjectOptions = React.useMemo(() => {
    if (isSubjectsLoading || !subjects) return [];
    return (subjects as any[]).map((s: any) => ({
      value: s.id,
      label: s.name,
    }));
  }, [subjects, isSubjectsLoading]);

  const topicOptions = React.useMemo(() => {
    if (isTopicsLoading || !topics) return [];
    return (topics as any[]).map((t: any) => ({
      value: t.id,
      label: t.name,
    }));
  }, [topics, isTopicsLoading]);

  const handleFieldChange = React.useCallback(
    (field: string, value: any) => {
      setBasicInfo({ [field]: value });
    },
    [setBasicInfo]
  );

  const validateFields = React.useCallback(() => {
    const errors: Record<string, string> = {};
    if (!state.title.trim()) errors.title = 'Title is required';
    if (!state.examCode) errors.examCode = 'Exam code is required';
    if (!state.duration || state.duration < 1)
      errors.duration = 'Duration must be at least 1 minute';
    if (!state.examType) errors.examType = 'Exam type is required';
    if (state.examType === ExamType.SUBJECT_WISE && !state.referenceId)
      errors.referenceId = 'Subject is required for Subject-wise test';
    if (state.examType === ExamType.CHAPTER_WISE && !state.referenceId)
      errors.referenceId = 'Topic is required for Chapter-wise test';
    return errors;
  }, [state.title, state.examCode, state.duration, state.examType, state.referenceId]);

  React.useEffect(() => {
    setErrors(validateFields());
  }, [validateFields, setErrors]);

  const isSubjectWise = state.examType === ExamType.SUBJECT_WISE;
  const isChapterWise = state.examType === ExamType.CHAPTER_WISE;
  const needsSubjectPicker = isSubjectWise || isChapterWise;

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
          placeholder={isExamsLoading ? 'Loading...' : 'Select exam code'}
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
            onChange={(value) => {
              userChangedExamType.current = true;
              handleFieldChange('examType', value);
            }}
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
        <FormGrid cols={isChapterWise ? 2 : 1} gap={4}>
          {isSubjectWise && (
            <SelectField
              label="Subject"
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

          {isChapterWise && (
            <>
              <SelectField
                label="Subject"
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
                error={
                  !chapterSubjectId
                    ? 'Select a subject to load topics'
                    : undefined
                }
                id="chapter-subject"
              />

              <SelectField
                label="Topic (Chapter)"
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
            <span>
              📋 <strong>Full Length</strong> — no scope restriction.
              referenceId will not be stored.
            </span>
          )}
          {isSubjectWise && (
            <span>
              📚 <strong>Subject-wise</strong> — the selected subject&apos;s ID
              will be stored as referenceId.
            </span>
          )}
          {isChapterWise && (
            <span>
              📖 <strong>Chapter-wise</strong> — the selected topic&apos;s ID
              will be stored as referenceId.
            </span>
          )}
          {![
            ExamType.FULL_LENGTH,
            ExamType.SUBJECT_WISE,
            ExamType.CHAPTER_WISE,
          ].includes(state.examType as any) && (
              <span>
                ℹ️ <strong>{TextFormator(state.examType)}</strong> — referenceId
                is optional for this type.
              </span>
            )}
        </div>
      )}
    </FormSection>
  );
};

export default BasicInfoForm;
