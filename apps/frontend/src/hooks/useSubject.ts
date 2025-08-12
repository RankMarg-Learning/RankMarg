import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubjects, addSubject, updateSubject, deleteSubject } from '@/services/subject.service';

export const useSubjects = (stream?: string) => {
  const queryClient = useQueryClient();

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects',stream],
    queryFn:()=> getSubjects(stream),
  });
  

  const saveSubject = useMutation({
    mutationFn: async (data: { 
      id?: string; 
      name: string; 
      stream: string;
      shortName?: string;
    }) => {
      if (data.id) {
        return updateSubject(data.id, data.name, data.stream, data.shortName);
      } else {
        return addSubject(data.name, data.stream, data.shortName);
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
