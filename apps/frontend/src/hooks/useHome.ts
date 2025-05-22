import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'

type QueryParams = {
    id?: string
}

const fetchTests = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useHome({ id }: QueryParams = {}) {
    const version = process.env.VERSION || '/v.1.0'

    const queries = useQueries({
        queries: [
            {
                queryKey: ['dashboardBasic', id],
                queryFn: fetchTests(`${version}/dashboard?loc=dashboard_page&id=${id}`),
                enabled: !!id,
            },
            {
                queryKey: ['currentStudies', id],
                queryFn: fetchTests(`${version}/current_curriculum?id=${id}&includeTopic=true&includeSubject=true&isCurrent=true&uniqueSubjects=true`),
                enabled: !!id,
            },
            {
                queryKey: ['session', id],
                queryFn: fetchTests(`${version}/session/subject_practice_session?id=${id}&loc=dashboard_page&_count=3&_type=today`),
                enabled: !!id,
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
