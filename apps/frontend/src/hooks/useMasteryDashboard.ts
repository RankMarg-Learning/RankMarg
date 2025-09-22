import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'
import type { AxiosError } from 'axios'


const fetchData = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useMasteryDashboard() {

    const queries = useQueries({
        queries: [
            {
                queryKey: ['masteryBasic'],
                queryFn: fetchData(`/mastery`),
            },
            {
                queryKey: ['subjectMastery'],
                queryFn: fetchData(`/mastery/subjects?improvementAreasCount=2&topPerformingCount=3`),
            },
            
        ],
    })

    const [masteryBasic, subjectMastery] = queries
 

    return {
        masteryBasic: masteryBasic.data,
        subjectMastery: subjectMastery.data,
        isLoading: queries.some(q => q.isLoading),
        isError: queries.some(q => q.isError),
        isSubscriptionError: queries.some(q => (q.error as AxiosError | undefined)?.response?.status === 403),
    }
}
