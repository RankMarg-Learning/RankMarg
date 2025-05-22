import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'

type QueryParams = {
    id?: string
}

const fetchTests = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useAnalyticsDashboard({ id }: QueryParams = {}) {
    const version = process.env.VERSION || '/v.1.0'

    const queries = useQueries({
        queries: [
            {
                queryKey: ['analytics', id],
                queryFn: fetchTests(`${version}/analytics?loc=analytics_page&id=${id}`),
                enabled: !!id,
            }
            
        ],
    })

    const [analytics] = queries

    return {
        analytics: analytics.data,
        isLoading: queries.some(q => q.isLoading),
        isError: queries.some(q => q.isError),
    }
}
