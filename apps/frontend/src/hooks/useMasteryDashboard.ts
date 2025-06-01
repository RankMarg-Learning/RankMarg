import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'


const fetchTests = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useMasteryDashboard() {
    const version = process.env.VERSION || '/v.1.0'

    const queries = useQueries({
        queries: [
            {
                queryKey: ['masteryBasic'],
                queryFn: fetchTests(`${version}/dashboard/mastery?loc=mastery_page`),
            },
            {
                queryKey: ['subjectMastery'],
                queryFn: fetchTests(`${version}/dashboard/mastery/subjects?loc=mastery_page&improvementAreasCount=2&topPerformingCount=3`),
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
