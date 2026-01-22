import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys';
import { getQueryConfig } from '@/lib/queryConfig';
import api from '@/utils/api';

const fetchHomeData = async () => {
    const { data } = await api.get('/dashboard?subtopicsCount=3&sessionsCount=3')
    return data
}

const fetchTodayStats = async () => {
    const { data } = await api.get('/dashboard/today-stats')
    return data
}

export function useHome() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: queryKeys.dashboard.home(),
        queryFn: fetchHomeData,
        ...getQueryConfig('DYNAMIC'),
    });

    const payload = data?.data;

    return {
        dashboardBasic: payload?.dashboardData,
        currentStudies: payload?.currentStudies,
        session: payload?.sessions,
        isLoading,
        isError,
        error,
    }
}

export function useTodayStats() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['dashboard', 'today-stats'],
        queryFn: fetchTodayStats,
        ...getQueryConfig('DYNAMIC'),
    });

    const payload = data?.data;

    return {
        stats: payload,
        isLoading,
        isError,
        error,
    }
}

