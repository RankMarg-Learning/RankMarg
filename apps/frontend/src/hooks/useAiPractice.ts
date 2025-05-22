import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'

type QueryParams = {
    id?: string
}

const fetchTests = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useAiPractice({ id }: QueryParams = {}) {
    const version = process.env.VERSION || '/v.1.0'

    const queries = useQueries({
        queries: [
            {
                queryKey: ['overview', id],
                queryFn: fetchTests(`${version}/ai-practice?loc=ai_practice&id=${id}`),
                enabled: !!id,
            },
            {
                queryKey: ['results', id],
                queryFn: fetchTests(`${version}/session/subject_practice_session?id=${id}&loc=ai_practice&_count=4&_done_item=true&_type=all`),
                enabled: !!id,
            },
            {
                queryKey: ['session', id],
                queryFn: fetchTests(`${version}/session/subject_practice_session?id=${id}&loc=ai_practice&_count=3&_type=today&_subtopic_limit=3`),
                enabled: !!id,
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
