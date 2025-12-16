import api from '@/utils/api'
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

const fetchData = (endpoint: string) => async () => {
    const { data } = await api.get(endpoint)
    return data
}

export function useRevisionDashboard(filter?: string, subjectId?: string) {
    const queryClient = useQueryClient()

    // Build query string properly
    const buildQueryString = () => {
        const params = new URLSearchParams()
        if (filter) params.append('filter', filter)
        if (subjectId) params.append('subjectId', subjectId)
        return params.toString() ? `?${params.toString()}` : ''
    }

    const queries = useQueries({
        queries: [
            {
                queryKey: ['revisionSchedule', filter, subjectId],
                queryFn: fetchData(`/revision${buildQueryString()}`),
            },
            {
                queryKey: ['revisionStatistics'],
                queryFn: fetchData(`/revision/statistics`),
            },
        ],
    })

    const [revisionSchedule, revisionStatistics] = queries

    const markAsReviewedMutation = useMutation({
        mutationFn: async (topicId: string) => {
            const { data } = await api.post('/revision/mark-reviewed', { topicId })
            return data
        },
        onSuccess: () => {
            // Invalidate and refetch revision data
            queryClient.invalidateQueries({ queryKey: ['revisionSchedule'] })
            queryClient.invalidateQueries({ queryKey: ['revisionStatistics'] })
        },
    })

    return {
        revisionSchedule: revisionSchedule.data,
        revisionStatistics: revisionStatistics.data,
        isLoading: queries.some(q => q.isLoading),
        isError: queries.some(q => q.isError),
        isSubscriptionError: queries.some(q => (q.error as AxiosError | undefined)?.response?.status === 403),
        markAsReviewed: (topicId: string, options?: { onSuccess?: () => void; onError?: () => void }) => {
            markAsReviewedMutation.mutate(topicId, options)
        },
        isMarkingReviewed: markAsReviewedMutation.isPending,
    }
}
