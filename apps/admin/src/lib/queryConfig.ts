export const QUERY_CONFIG = {
  STALE_TIME: {

    STATIC: 30 * 60 * 1000, // 30 minutes
    USER_PREFERENCES: 5 * 60 * 1000, // 5 minutes
    DYNAMIC: 2 * 60 * 1000, // 2 minutes
    REALTIME: 30 * 1000, // 30 seconds
    SESSION: 1 * 60 * 1000, // 1 minute
  },

  GC_TIME: {
    STATIC: 60 * 60 * 1000, // 1 hour
    DYNAMIC: 10 * 60 * 1000, // 10 minutes
    REALTIME: 5 * 60 * 1000, // 5 minutes
    SESSION: 15 * 60 * 1000, // 15 minutes
  },
  RETRY: {
    shouldRetry: (failureCount: number, error: any) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    delay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },

  REFETCH: {
    STATIC: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
    DYNAMIC: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    REALTIME: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      refetchInterval: 30 * 1000, // 30 seconds
    },
  },
} as const;

export const getQueryConfig = (type: keyof typeof QUERY_CONFIG.STALE_TIME) => ({
  staleTime: QUERY_CONFIG.STALE_TIME[type],
  gcTime: QUERY_CONFIG.GC_TIME[type],
  retry: QUERY_CONFIG.RETRY.shouldRetry,
  retryDelay: QUERY_CONFIG.RETRY.delay,
  ...QUERY_CONFIG.REFETCH[type === 'STATIC' ? 'STATIC' : type === 'REALTIME' ? 'REALTIME' : 'DYNAMIC'],
});
