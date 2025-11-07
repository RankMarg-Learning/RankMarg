import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'


const fetchTests = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useAnalyticsDashboard() {

    const queries = useQueries({
        queries: [
            {
                queryKey: ['analytics'],
                queryFn: fetchTests(`/analytics?loc=analytics_page`),
            },
            {
                queryKey: ['attempts'],
                queryFn: fetchTests(`/attempts?loc=attempts_page&type=calendar`),
            }
            
        ],
    })

    const [analytics,attempts] = queries

    return {
        attempts:attempts.data,
        analytics: analytics.data,
        isLoading: queries.some(q => q.isLoading),
        isError: queries.some(q => q.isError),
    }
}
