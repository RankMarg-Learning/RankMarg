import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'


const fetchTests = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useAiPractice() {

    const queries = useQueries({
        queries: [
            {
                queryKey: ['overview'],
                queryFn: fetchTests(`/dashboard/ai-practice?loc=ai_practice`),
            },
            {
                queryKey: ['results'],
                queryFn: fetchTests(`/practice-sessions?loc=ai_practice&_count=4&_done_item=true&_type=all`),
            },
            {
                queryKey: ['sessions'],
                queryFn: fetchTests(`/practice-sessions?loc=ai_practice&_count=3&_type=today&_subtopic_limit=3`),
            },
            {
                queryKey:['suggestions'],
                queryFn: fetchTests(`/suggestion?status=ACTIVE&triggerType=DAILY_ANALYSIS&limit=3&duration=2&sort=desc`),
            }
        ],
    })

    const [overview, results, sessions,suggestions] = queries

    return {
        overview: overview.data,
        results: results.data,
        sessions: sessions.data,
        suggestions: suggestions.data,
        isLoading: queries.some(q => q.isLoading),
        isError: queries.some(q => q.isError),
    }
}
