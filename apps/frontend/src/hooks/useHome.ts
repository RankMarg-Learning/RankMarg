import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'


const fetchTests = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useHome() {
    const version = process.env.VERSION || '/v.1.0'

    const queries = useQueries({
        queries: [
            {
                queryKey: ['dashboardBasic'],
                queryFn: fetchTests(`${version}/dashboard?loc=dashboard_page`),
            },
            {
                queryKey: ['currentStudies'],
                queryFn: fetchTests(`${version}/current_curriculum?includeTopic=true&includeSubject=true&isCurrent=true&uniqueSubjects=true`),
            },
            {
                queryKey: ['session'],
                queryFn: fetchTests(`${version}/session/subject_practice_session?loc=dashboard_page&_count=3&_type=today`),
            },
        ],
    })

    const [dashboardBasic, currentStudies, session] = queries

    return {
        dashboardBasic: dashboardBasic.data,
        currentStudies: currentStudies.data,
        session: session.data,
        isLoading: queries.some(q => q.isLoading),
        isError: queries.some(q => q.isError),
    }
}
