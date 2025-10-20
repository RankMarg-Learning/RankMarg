import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';

export type Subject = {
  id: string;
  name: string;
};

export const useSubjects = (examCode?: string) => {
  const query = useQuery({
    queryKey: ['subjects', examCode ?? 'all'],
    queryFn: async () => {
      const res = await api.get(`/subjects${examCode ? `?examCode=${examCode}` : ''}`);
      return res.data?.data ?? res.data ?? [];
    },
  });

  return { subjects: (query.data as Subject[]) || [], isLoading: query.isLoading, error: query.error };
};


