import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'

type QueryParams = {
    id?: string
}

const fetchTests = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useMasteryDashboard({ id }: QueryParams = {}) {
    const version = process.env.VERSION || '/v.1.0'

    const queries = useQueries({
        queries: [
            {
                queryKey: ['masteryBasic', id],
                queryFn: fetchTests(`${version}/dashboard/mastery?loc=mastery_page&id=${id}`),
                enabled: !!id,
            },
            {
                queryKey: ['subjectMastery', id],
                queryFn: fetchTests(`${version}/dashboard/mastery/subjects?id=${id}&loc=mastery_page&improvementAreasCount=2&topPerformingCount=3`),
                enabled: !!id,
            },
            
        ],
    })

    const [masteryBasic, subjectMastery] = queries

    return {
        masteryBasic: masteryBasic.data,
        subjectMastery: subjectMastery.data,
        isLoading: queries.some(q => q.isLoading),
        isError: queries.some(q => q.isError),
    }
}
