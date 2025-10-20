import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import { HomeApiResponse, CurrentStudies, DashboardBasicData, PracticeSession } from '@/src/types/dashboard.types';

const fetchHomeData = async (): Promise<HomeApiResponse> => {
  const { data } = await api.get('/dashboard?subtopicsCount=3&sessionsCount=3');
  return data as HomeApiResponse;
};

export function useHome(options?: { enabled?: boolean }) {
  const { data, isLoading, isError, error } = useQuery<HomeApiResponse>({
    queryKey: ['mobile', 'dashboard', 'home'],
    queryFn: fetchHomeData,
    staleTime: 1000 * 60, // 1 min
    enabled: options?.enabled ?? true,
  });

  const payload = data?.data;

  return {
    dashboardBasic: (payload?.dashboardData ?? null) as DashboardBasicData | null,
    currentStudies: (payload?.currentStudies ?? []) as CurrentStudies[],
    session: (payload?.sessions ?? []) as PracticeSession[],
    isLoading,
    isError,
    error,
  };
}


