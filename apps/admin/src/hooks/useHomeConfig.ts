import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys';
import { getQueryConfig } from '@/lib/queryConfig';
import api from '@/utils/api';
import { toast } from "@repo/common-ui";

const fetchHomeConfig = async () => {
    const { data } = await api.get('/m/admin/config')
    return data?.data
}

const updateHomeConfig = async (config: any) => {
    const { data } = await api.post('/m/admin/config', { config })
    return data
}

export function useHomeConfig() {
    const queryClient = useQueryClient();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: queryKeys.homeConfig.all,
        queryFn: fetchHomeConfig,
        ...getQueryConfig('DYNAMIC'),
    });

    const mutation = useMutation({
        mutationFn: updateHomeConfig,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.homeConfig.all });
            toast({
                title: "Success",
                description: "Configuration updated on S3",
            });
        },
        onError: (err: any) => {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to update configuration",
                variant: "destructive",
            });
        }
    });

    return {
        config: data,
        isLoading,
        isError,
        error,
        updateConfig: mutation.mutate,
        isUpdating: mutation.isPending
    }
}
