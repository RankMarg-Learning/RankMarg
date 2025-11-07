import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'

type QueryParams = {
    username?: string
}

const fetchTests = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useProfileData({ username }: QueryParams = {}) {

    const queries = useQueries({
        queries: [
            {
                queryKey: ['userBasic', username],
                queryFn: fetchTests(`/user/profile?username=${username}`),
            },
            {
                queryKey: ['currentStudies'],
                queryFn: fetchTests(`/current-topic?includeTopic=true&includeSubject=true&isCurrent=true`),
            },
            {
                queryKey: ['activities'],
                queryFn: fetchTests(`/user/activity?limit=4`),
            },
        ],
    })

    const [userBasic, currentStudies, activities] = queries

    return {
        userBasic: userBasic.data,
        currentStudies: currentStudies.data,
        activities: activities.data,
        isLoading: queries.some(q => q.isLoading),
        isError: queries.some(q => q.isError),
    }
}
