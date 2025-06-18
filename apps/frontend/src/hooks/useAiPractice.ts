import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'


const fetchTests = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useAiPractice() {
    const version = '/v.1.0'

    const queries = useQueries({
        queries: [
            {
                queryKey: ['overview'],
                queryFn: fetchTests(`${version}/ai-practice?loc=ai_practice`),
            },
            {
                queryKey: ['results'],
                queryFn: fetchTests(`${version}/session/subject_practice_session?loc=ai_practice&_count=4&_done_item=true&_type=all`),
            },
            {
                queryKey: ['sessions'],
                queryFn: fetchTests(`${version}/session/subject_practice_session?loc=ai_practice&_count=3&_type=today&_subtopic_limit=3`),
            },
        ],
    })

    const [overview, results, sessions] = queries

    return {
        overview: overview.data,
        results: results.data,
        sessions: sessions.data,
        isLoading: queries.some(q => q.isLoading),
        isError: queries.some(q => q.isError),
    }
}
