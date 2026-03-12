import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys';
import { getQueryConfig } from '@/lib/queryConfig';
import api from '@/utils/api';

const fetchInteractions = async (type: string, page: number = 1, limit: number = 50) => {
    const { data } = await api.get(`/m/admin/interactions?type=${type}&page=${page}&limit=${limit}`)
    return data
}

export function useInteractionData(type: string = 'ALL', page: number = 1, limit: number = 50) {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: [...queryKeys.interactions.byType(type), page, limit],
        queryFn: () => fetchInteractions(type, page, limit),
        ...getQueryConfig('DYNAMIC'),
    });

    return {
        interactions: data?.data?.interactions || [],
        total: data?.data?.total || 0,
        page: data?.data?.page || 1,
        limit: data?.data?.limit || 50,
        isLoading,
        isError,
        error,
    }
}
