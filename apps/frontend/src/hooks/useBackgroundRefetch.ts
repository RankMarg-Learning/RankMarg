import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { queryKeys } from '@/lib/queryKeys';

// Hook for background refetching of important data
export const useBackgroundRefetch = () => {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout>();

  // Refetch dashboard data in background
  const refetchDashboard = async () => {
    try {
      await queryClient.refetchQueries({ 
        queryKey: queryKeys.dashboard.home(),
        type: 'active' // Only refetch active queries
      });
    } catch (error) {
      console.warn('Background refetch failed:', error);
    }
  };

  // Refetch current topic states
  const refetchCurrentTopics = async (subjectId?: string) => {
    if (!subjectId) return;
    
    try {
      await queryClient.refetchQueries({ 
        queryKey: queryKeys.currentTopic.states(subjectId),
        type: 'active'
      });
    } catch (error) {
      console.warn('Background refetch failed:', error);
    }
  };

  // Refetch user activities
  const refetchActivities = async (userId?: string) => {
    if (!userId) return;
    
    try {
      await queryClient.refetchQueries({ 
        queryKey: queryKeys.activities.byUser(userId),
        type: 'active'
      });
    } catch (error) {
      console.warn('Background refetch failed:', error);
    }
  };

  // Start background refetching
  const startBackgroundRefetch = (intervalMs: number = 5 * 60 * 1000) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      refetchDashboard();
    }, intervalMs);
  };

  // Stop background refetching
  const stopBackgroundRefetch = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBackgroundRefetch();
    };
  }, []);

  return {
    refetchDashboard,
    refetchCurrentTopics,
    refetchActivities,
    startBackgroundRefetch,
    stopBackgroundRefetch,
  };
};
