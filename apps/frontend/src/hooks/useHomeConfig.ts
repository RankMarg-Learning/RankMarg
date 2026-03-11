import { useQuery } from '@tanstack/react-query';
import { HomeConfig } from '@/types/homeConfig.types';
import api from '@/utils/api';

const fetchHomeConfig = async (): Promise<HomeConfig | null> => {
    const { data } = await api.get('/dashboard/home-config');
    return (data?.data as HomeConfig) ?? null;
};

export function useHomeConfig() {
    const { data, isLoading, isError } = useQuery<HomeConfig | null>({
        queryKey: ['dashboard', 'home-config'],
        queryFn: fetchHomeConfig,
        staleTime: 0,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        throwOnError: false,
    });

    return { config: data ?? null, isLoading, isError };
}
