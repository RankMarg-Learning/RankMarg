import axios from 'axios'
import { getSession } from 'next-auth/react'

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

// Create axios instance for backend API calls
const backendApi = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api/v2`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
backendApi.interceptors.request.use(
  async (config) => {
    const session = await getSession()
    
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
backendApi.interceptors.response.use(
  (response) => {
    // Extract data from the standardized API response format
    if (response.data && response.data.success) {
      return {
        ...response,
        data: response.data.data || response.data,
        meta: {
          success: response.data.success,
          message: response.data.message,
          timestamp: response.data.timestamp,
          version: response.data.version,
          pagination: response.data.pagination,
        }
      }
    }
    return response
  },
  (error) => {
    // Handle standardized error responses
    if (error.response?.data) {
      const errorData = error.response.data
      
      // Check for subscription required errors
      if (errorData.error === 'SUBSCRIPTION_REQUIRED') {
        // You could redirect to subscription page or show upgrade modal
        console.warn('Subscription required:', errorData.message)
      }
      
      // Check for rate limiting
      if (errorData.error === 'RATE_LIMITED') {
        console.warn('Rate limit exceeded:', errorData.message)
      }
      
      // Enhance error with backend error details
      const enhancedError = new Error(errorData.message || 'Backend API Error')
      ;(enhancedError as any).code = errorData.error
      ;(enhancedError as any).statusCode = error.response.status
      ;(enhancedError as any).details = errorData.details
      
      return Promise.reject(enhancedError)
    }
    
    return Promise.reject(error)
  }
)

export default backendApi

// Utility functions for common API operations
export const profileApi = {
  // Profile operations
  getProfile: (username: string) => 
    backendApi.get(`/profile/username/${username}?includePerformance=true`),
  
  getMyProfile: () => 
    backendApi.get('/profile/me?includePerformance=true&includeSubscription=true'),
  
  updateProfile: (data: any) => 
    backendApi.patch('/profile/me', data),
  
  // Curriculum operations
  getCurrentStudies: (params?: any) => 
    backendApi.get('/profile/me/studies', { params }),
  
  startStudyTopic: (data: { subjectId: number; topicId: number }) =>
    backendApi.post('/profile/me/studies', data),
  
  updateStudyTopic: (studyTopicId: string, data: any) =>
    backendApi.patch(`/profile/me/studies/${studyTopicId}`, data),
  
  getStudyStats: () =>
    backendApi.get('/profile/me/studies/stats'),
  
  // Activity operations
  getActivities: (params?: any) =>
    backendApi.get('/profile/me/activities', { params }),
  
  getActivityStats: () =>
    backendApi.get('/profile/me/activities/stats'),
  
  getActivityInsights: () =>
    backendApi.get('/profile/me/activities/insights'), // Premium feature
}

// Type definitions for API responses
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
  timestamp: string
  version: string
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface ApiError {
  success: false
  message: string
  error: string
  timestamp: string
  version: string
  details?: any
}
