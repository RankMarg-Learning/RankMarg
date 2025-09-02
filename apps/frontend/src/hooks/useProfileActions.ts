import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '@/utils/backend-api'

interface UpdateProfileData {
    name?: string
    avatar?: string
    phone?: string
    location?: string
    standard?: string
    targetYear?: number
    studyHoursPerDay?: number
}

interface StartStudyTopicData {
    subjectId: number
    topicId: number
}

interface UpdateStudyTopicData {
    isCurrent?: boolean
    isCompleted?: boolean
}

export function useUpdateProfile() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: async (updateData: UpdateProfileData) => {
            const response = await profileApi.updateProfile(updateData)
            return response.data
        },
        onSuccess: () => {
            // Invalidate and refetch profile data
            queryClient.invalidateQueries({ queryKey: ['userBasic'] })
            queryClient.invalidateQueries({ queryKey: ['profile'] })
        },
        onError: (error: any) => {
            console.error('Profile update failed:', error)
        },
    })
}

export function useStartStudyTopic() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: async (data: StartStudyTopicData) => {
            const response = await profileApi.startStudyTopic(data)
            return response.data
        },
        onSuccess: () => {
            // Invalidate and refetch curriculum data
            queryClient.invalidateQueries({ queryKey: ['currentStudies'] })
            queryClient.invalidateQueries({ queryKey: ['activities'] })
        },
    })
}

export function useUpdateStudyTopic() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: async ({ studyTopicId, updateData }: { studyTopicId: string, updateData: UpdateStudyTopicData }) => {
            const response = await profileApi.updateStudyTopic(studyTopicId, updateData)
            return response.data
        },
        onSuccess: () => {
            // Invalidate and refetch curriculum and activity data
            queryClient.invalidateQueries({ queryKey: ['currentStudies'] })
            queryClient.invalidateQueries({ queryKey: ['activities'] })
        },
    })
}

// Hook for getting activity stats (premium feature)
export function useActivityStats() {
    return useMutation({
        mutationFn: async () => {
            const response = await profileApi.getActivityStats()
            return response.data
        },
    })
}

// Hook for getting activity insights (premium feature)
export function useActivityInsights() {
    return useMutation({
        mutationFn: async () => {
            const response = await profileApi.getActivityInsights()
            return response.data
        },
    })
}

// Hook for getting study statistics
export function useStudyStats() {
    return useMutation({
        mutationFn: async () => {
            const response = await profileApi.getStudyStats()
            return response.data
        },
    })
}
