import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'

type QueryParams = {
    id?: string
}

const fetchData = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useMistakeDashboard({ id }: QueryParams = {}) {
    const version = process.env.VERSION || '/v.1.0'

    const queries = useQueries({
        queries: [
            {
                queryKey: ['distribution', id],
                queryFn: fetchData(`${version}/mistakes-tracker/distribution?id=${id}`),
                enabled: !!id,
            },
            {
                queryKey: ['overview', id],
                queryFn: fetchData(`${version}/mistakes-tracker?id=${id}`),
                enabled: !!id,
            },
            
        ],
    })

    const [distribution, overview] = queries

    return {
        distribution: distribution.data,
        overview: overview.data,
        isLoading: queries.some(q => q.isLoading),
        isError: queries.some(q => q.isError),
    }
}
