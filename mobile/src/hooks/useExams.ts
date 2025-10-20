import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';

export type Exam = {
  id: string;
  code: string;
  name: string;
  description?: string;
};

export const useExams = () => {
  const query = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const res = await api.get('/exams');
      // frontend service returns response.data directly, assume same here
      return res.data?.data ?? res.data ?? [];
    },
  });

  return { exams: (query.data as Exam[]) || [], isLoading: query.isLoading, error: query.error };
};


