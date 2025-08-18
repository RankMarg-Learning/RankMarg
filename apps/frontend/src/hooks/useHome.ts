import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'


const fetchTests = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useHome() {
    const version =  '/v.1.0'

    const { data, isLoading, isError } = useQuery({
        queryKey: ['homeCombined'],
        queryFn: fetchTests(`${version}/home?subtopicsCount=3&sessionsCount=3`),
        staleTime: 60_000,
    });

    const payload = data?.data;

    return {
        dashboardBasic: payload?.dashboardData,
        currentStudies: payload?.currentStudies,
        session: payload?.sessions,
        isLoading,
        isError,
    }
}
