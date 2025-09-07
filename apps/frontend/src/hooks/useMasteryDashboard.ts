import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'


const fetchData = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useMasteryDashboard() {
    const version = '/v.1.0'

    const queries = useQueries({
        queries: [
            {
                queryKey: ['masteryBasic'],
                queryFn: fetchData(`${version}/dashboard/mastery`),
            },
            {
                queryKey: ['subjectMastery'],
                queryFn: fetchData(`${version}/dashboard/mastery/subjects?improvementAreasCount=2&topPerformingCount=3`),
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
