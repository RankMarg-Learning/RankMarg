import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'



const fetchData = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useMistakeDashboard() {

    const queries = useQueries({
        queries: [
            {
                queryKey: ['distribution'],
                queryFn: fetchData(`/mistake-tracker/distribution?range=30`),
            },
            {
                queryKey: ['overview'],
                queryFn: fetchData(`/mistake-tracker`),
            },
            {
                queryKey: ['insight'],
                queryFn: fetchData(`/mistake-tracker/insight?range=30`),
            },
            
        ],
    })

    const [distribution, overview,insight] = queries

    return {
        distribution: distribution.data,
        insight: insight.data?.insights || [],
        overview: overview.data,
        isLoading: queries.some(q => q.isLoading),
        isError: queries.some(q => q.isError),
    }
}
