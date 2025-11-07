import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface QueryPerformanceMetrics {
  totalQueries: number;
  activeQueries: number;
  staleQueries: number;
  fetchingQueries: number;
  errorQueries: number;
  cacheSize: number;
  averageQueryTime: number;
}

// Hook for monitoring React Query performance
export const useQueryPerformance = () => {
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<QueryPerformanceMetrics>({
    totalQueries: 0,
    activeQueries: 0,
    staleQueries: 0,
    fetchingQueries: 0,
    errorQueries: 0,
    cacheSize: 0,
    averageQueryTime: 0,
  });

  const calculateMetrics = () => {
    const queries = queryClient.getQueryCache().getAll();
    const activeQueries = queries.filter(q => q.isActive());
    const staleQueries = queries.filter(q => q.isStale());
    const fetchingQueries = queries.filter(q => q.state.status === 'pending');
    const errorQueries = queries.filter(q => q.state.status === 'error');

    // Calculate average query time (simplified)
    const completedQueries = queries.filter(q => q.state.status === 'success');
    const totalTime = completedQueries.reduce((sum, q) => {
      // Use dataUpdatedAt as a fallback since startTime is not available in v5
      const fetchTime = q.state.dataUpdatedAt || 0;
      return sum + fetchTime;
    }, 0);
    const averageQueryTime = completedQueries.length > 0 ? totalTime / completedQueries.length : 0;

    setMetrics({
      totalQueries: queries.length,
      activeQueries: activeQueries.length,
      staleQueries: staleQueries.length,
      fetchingQueries: fetchingQueries.length,
      errorQueries: errorQueries.length,
      cacheSize: queries.length,
      averageQueryTime,
    });
  };

  // Update metrics periodically
  useEffect(() => {
    calculateMetrics();
    
    const interval = setInterval(calculateMetrics, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [queryClient]);

  // Get performance insights
  const getPerformanceInsights = () => {
    const insights = [];

    if (metrics.errorQueries > 0) {
      insights.push(`There are ${metrics.errorQueries} queries with errors`);
    }

    if (metrics.fetchingQueries > 5) {
      insights.push(`High number of concurrent requests: ${metrics.fetchingQueries}`);
    }

    if (metrics.cacheSize > 100) {
      insights.push(`Large cache size: ${metrics.cacheSize} queries`);
    }

    if (metrics.averageQueryTime > 2000) {
      insights.push(`Slow average query time: ${Math.round(metrics.averageQueryTime)}ms`);
    }

    return insights;
  };

  // Clear cache
  const clearCache = () => {
    queryClient.clear();
    calculateMetrics();
  };

  // Remove specific queries
  const removeQueries = (queryKey: any[]) => {
    queryClient.removeQueries({ queryKey });
    calculateMetrics();
  };

  // Get slow queries
  const getSlowQueries = () => {
    const queries = queryClient.getQueryCache().getAll();
    return queries
      .filter(q => q.state.status === 'success')
      .map(q => {
        // Use dataUpdatedAt as a fallback since startTime is not available in v5
        const fetchTime = q.state.dataUpdatedAt || 0;
        return {
          queryKey: q.queryKey,
          fetchTime,
          dataUpdatedAt: q.state.dataUpdatedAt,
        };
      })
      .filter(q => q.fetchTime > 1000) // Queries taking more than 1 second
      .sort((a, b) => b.fetchTime - a.fetchTime);
  };

  return {
    metrics,
    insights: getPerformanceInsights(),
    clearCache,
    removeQueries,
    getSlowQueries,
    refreshMetrics: calculateMetrics,
  };
};
