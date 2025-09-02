import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubjects, addSubject, updateSubject, deleteSubject } from '@/services/subject.service';
import { queryKeys } from '@/lib/queryKeys';
import { getQueryConfig } from '@/lib/queryConfig';
import { useQueryError } from './useQueryError';

export const useSubjects = (examCode?: string) => {
  const queryClient = useQueryClient();
  const { handleMutationError } = useQueryError();

  const { data: response, isLoading, error } = useQuery({
    queryKey: queryKeys.subjects.byExam(examCode),
    queryFn: () => getSubjects(examCode),
    ...getQueryConfig('STATIC'),
  });

  const subjects = response?.data || [];

  const saveSubject = useMutation({
    mutationFn: async (data: { 
      id?: string; 
      name: string; 
      shortName?: string;
    }) => {
      if (data.id) {
        return updateSubject(data.id, data.name, data.shortName);
      } else {
        return addSubject(data.name, data.shortName);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects.all });
    },
    onError: (error) => handleMutationError(error, 'saveSubject'),
  });

  const removeSubject = useMutation({
    mutationFn: async (id: string) => deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects.all });
    },
    onError: (error) => handleMutationError(error, 'removeSubject'),
  });

  return {
    subjects,
    isLoading,
    error,
    saveSubject,
    removeSubject,
  };
};
