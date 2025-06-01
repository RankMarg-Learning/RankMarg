import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'



const fetchData = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useMistakeDashboard() {
    const version = process.env.VERSION || '/v.1.0'

    const queries = useQueries({
        queries: [
            {
                queryKey: ['distribution'],
                queryFn: fetchData(`${version}/mistakes-tracker/distribution`),
            },
            {
                queryKey: ['overview'],
                queryFn: fetchData(`${version}/mistakes-tracker`),
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
