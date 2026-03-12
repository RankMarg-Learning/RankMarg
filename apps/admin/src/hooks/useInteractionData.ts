import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys';
import { getQueryConfig } from '@/lib/queryConfig';
import api from '@/utils/api';

const fetchInteractions = async (type: string) => {
    const { data } = await api.get(`/m/admin/interactions?type=${type}`)
    return data
}

export function useInteractionData(type: string = 'ALL') {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: queryKeys.interactions.byType(type),
        queryFn: () => fetchInteractions(type),
        ...getQueryConfig('DYNAMIC'),
    });

    return {
        data: data?.data,
        isLoading,
        isError,
        error,
    }
}
