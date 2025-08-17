import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubjects, addSubject, updateSubject, deleteSubject } from '@/services/subject.service';

export const useSubjects = (examCode?: string) => {
  const queryClient = useQueryClient();

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn:()=> getSubjects(examCode),
  });
  

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
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  // Delete subject
  const removeSubject = useMutation({
    mutationFn: async (id: string) => deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  return {
    subjects,
    isLoading,
    saveSubject,
    removeSubject,
  };
};
