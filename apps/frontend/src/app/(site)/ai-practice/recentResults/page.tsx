'use client'

import RecentPracticeResults from '@/components/ai-practice/RecentPracticeResults'
import Loading from '@/components/Loading'
import api from '@/utils/api'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useRef, useCallback } from 'react'

const PAGE_SIZE = 20

const SessionPage = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['results'],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const { data } = await api.get(
          `/v.1.0/session/subject_practice_session?loc=ai_practice&_done_item=true&_type=all&_count=${PAGE_SIZE}&_page=${pageParam}`
        )

        const responseData = data?.data || []
        
        return {
          data: responseData,
          nextPage: pageParam + 1,
          hasNextPage: Array.isArray(responseData) && responseData.length === PAGE_SIZE,
        }
      } catch (error) {
        console.error('Error fetching results:', error)
        throw error
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextPage : undefined,
  })

  const observerRef = useRef<IntersectionObserver | null>(null)

  const loadMoreRef = useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingNextPage) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  )

  if (isLoading) return <Loading />
  
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="text-red-500 text-lg font-medium mb-2">
          Error loading data
        </div>
        <div className="text-gray-600 text-sm text-center">
          {error?.message || 'Something went wrong while loading your practice results.'}
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  const allResults = data?.pages?.flatMap((page) => page?.data || []) || []

  return (
    <>
      <RecentPracticeResults results={allResults} allResults />
      <div ref={loadMoreRef} className="h-12" />
      {isFetchingNextPage && (
        <div className="flex justify-center my-4">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      )}
    </>
  )
}

export default SessionPage