import api from '@/utils/api'
import { useQueries } from '@tanstack/react-query'

type QueryParams = {
    id?: string
    username?: string
}

const fetchTests = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useProfileData({ id, username }: QueryParams = {}) {
    const version = process.env.VERSION || '/v.1.0'

    const queries = useQueries({
        queries: [
            {
                queryKey: ['userBasic', username],
                queryFn: fetchTests(`profile/${username}`),
                enabled: !!username,
            },
            {
                queryKey: ['currentStudies', id],
                queryFn: fetchTests(`${version}/current_curriculum?id=${id}&includeTopic=true&includeSubject=true&isCurrent=true`),
                enabled: !!id,
            },
            {
                queryKey: ['activities', id],
                queryFn: fetchTests(`${version}/activity?id=${id}&limit=4`),
                enabled: !!id,
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
