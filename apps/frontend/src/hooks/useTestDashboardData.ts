// hooks/useTestDashboardData.ts
import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'

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
    const version = process.env.VERSION || '/v.1.0'

    const queries = useQueries({
        queries: [
            {
                queryKey: ['tests', 'available', availableLimit, availableType],
                queryFn: fetchTests(`${version}/tests/available?limit=${availableLimit}&type=${availableType}`),
            },
            {
                queryKey: ['tests', 'recommended'],
                queryFn: fetchTests(`${version}/tests/recommended`),
            },
            {
                queryKey: ['tests', 'results', resultsLimit],
                queryFn: fetchTests(`${version}/tests/results?limit=${resultsLimit}`),
            },
            {
                queryKey: ['tests', 'schedule'],
                queryFn: fetchTests(`${version}/tests/scheduled`),
            }
        ]
    })

    const [available, recommended, results, schedule] = queries

    return {
        available: available.data,
        recommended: recommended.data,
        results: results.data,
        schedule: schedule.data,
        isLoading: queries.some(q => q.isLoading),
        isError: queries.some(q => q.isError),
    }
}
