import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';

export type Topic = {
  id: string;
  name: string;
  subjectId: string;
};

export const useTopics = (subjectId?: string) => {
  const query = useQuery({
    queryKey: ['topics', subjectId ?? 'all'],
    queryFn: async () => {
      const url = subjectId ? `/topics?subjectId=${subjectId}` : '/topics';
      const res = await api.get(url);
      return res.data?.data ?? res.data ?? [];
    },
  });

  return { topics: (query.data as Topic[]) || [], isLoading: query.isLoading, error: query.error };
};


