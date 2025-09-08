import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys';
import { getQueryConfig } from '@/lib/queryConfig';
import api from '@/utils/api';

const fetchHomeData = async () => {
    const { data } = await api.get('/v.1.0/home?subtopicsCount=3&sessionsCount=3')
    return data
}

export function useHome() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: queryKeys.dashboard.home(),
        queryFn: fetchHomeData,
        ...getQueryConfig('DYNAMIC'),
    });

    const payload = data?.data?.data;

    return {
        dashboardBasic: payload?.dashboardData,
        currentStudies: payload?.currentStudies,
        session: payload?.sessions,
        isLoading,
        isError,
        error,
    }
}
