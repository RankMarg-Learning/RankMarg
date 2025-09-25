import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getExams,
  addExam,
  updateExam,
  deleteExam,
  addSubjectToExam,
  removeSubjectFromExam,
} from '../services/exam.service';
import { queryKeys } from '@/lib/queryKeys';
import { getQueryConfig } from '@/lib/queryConfig';
import { useQueryError } from './useQueryError';
import { Exam } from "@/types/typeAdmin";

export const useExams = () => {
  const queryClient = useQueryClient();
  const { handleMutationError } = useQueryError();

  const { data: response, isLoading, error } = useQuery({
    queryKey: queryKeys.exams.all,
    queryFn: getExams,
    enabled: true,
    ...getQueryConfig('STATIC'),
  });
  const exams = response?.data || [];

  const saveExam = useMutation({
    mutationFn: async (data: Omit<Exam, 'createdAt' | 'updatedAt'>) => {
      return addExam(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exams.all });
    },
    onError: (error) => handleMutationError(error, 'saveExam'),
  });

  const updateExamMutation = useMutation({
    mutationFn: async ({ id, exam }: { id: string; exam: Partial<Exam> }) => {
      return updateExam(id, exam);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exams.all });
    },
    onError: (error) => handleMutationError(error, 'updateExam'),
  });

  const removeExam = useMutation({
    mutationFn: deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exams.all });
    },
    onError: (error) => handleMutationError(error, 'removeExam'),
  });

  const addSubjectToExamMutation = useMutation({
    mutationFn: async ({ examId, subjectId, weightage }: { examId: string; subjectId: string; weightage: number }) => {
      return addSubjectToExam(examId, subjectId, weightage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exams.all });
    },
    onError: (error) => handleMutationError(error, 'addSubjectToExam'),
  });

  const removeSubjectFromExamMutation = useMutation({
    mutationFn: async ({ examId, subjectId }: { examId: string; subjectId: string }) => {
      return removeSubjectFromExam(examId, subjectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exams.all });
    },
    onError: (error) => handleMutationError(error, 'removeSubjectFromExam'),
  });

  return { 
    exams, 
    isLoading, 
    error, 
    saveExam, 
    updateExam: updateExamMutation, 
    removeExam, 
    addSubjectToExam: addSubjectToExamMutation, 
    removeSubjectFromExam: removeSubjectFromExamMutation 
  };
};
