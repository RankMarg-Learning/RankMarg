// hooks/useTestDashboardData.ts
import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'
import { AxiosError } from 'axios'

type QueryParams = {
    availableLimit?: number
    availableType?: string
    resultsLimit?: number
}

const fetchTests = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useTestDashboardData({
    availableLimit = 10,
    availableType = 'FULL_LENGTH',
    resultsLimit = 10
}: QueryParams = {}) {

    const queries = useQueries({
        queries: [
            {
                queryKey: ['tests', 'available', availableLimit, availableType],
                queryFn: fetchTests(`/test/ai/available?limit=${availableLimit}&type=${availableType}`),
            },
            {
                queryKey: ['tests', 'recommended'],
                queryFn: fetchTests(`/test/ai/recommended`),
            },
            {
                queryKey: ['tests', 'results', resultsLimit],
                queryFn: fetchTests(`/test/ai/results?limit=${resultsLimit}`),
            },
            {
                queryKey: ['tests', 'schedule'],
                queryFn: fetchTests(`/test/ai/scheduled`),
            }
        ]
    })

    const [available, recommended, results, schedule] = queries

    const refetch = async () => {
        await Promise.all(queries.map(query => query.refetch()))
    }

    return {
        available: available.data,
        recommended: recommended.data,
        results: results.data,
        schedule: schedule.data,
        isLoading: queries.some(q => q.isLoading),
        isError: queries.some(q => q.isError),
        isSubscriptionError: queries.some(q => (q.error as AxiosError | undefined)?.response?.status === 403),
        refetch,
    }
}
