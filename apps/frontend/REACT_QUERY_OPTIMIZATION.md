# React Query Optimization Guide

This document outlines the comprehensive React Query optimizations implemented in the RankMarg frontend application.

## 🚀 Overview

The React Query optimization implementation includes:

- **Enhanced QueryClient Configuration** with optimized defaults
- **React Query DevTools** for development debugging
- **Query Key Factory** for better organization and type safety
- **Optimized Caching Strategies** with different stale times for different data types
- **Background Refetching** for keeping data fresh
- **Prefetching** for better user experience
- **Error Handling** improvements
- **Performance Monitoring** tools

## 📁 File Structure

```
src/
├── context/
│   └── QueryContext.tsx          # Enhanced QueryClient configuration
├── lib/
│   ├── queryKeys.ts              # Query key factory
│   └── queryConfig.ts            # Caching configuration constants
├── hooks/
│   ├── usePrefetch.ts            # Prefetching utilities
│   ├── useQueryError.ts          # Error handling
│   ├── useBackgroundRefetch.ts   # Background refetching
│   ├── useQueryPerformance.ts    # Performance monitoring
│   ├── useSubject.ts             # Optimized subject hook
│   ├── useTopics.ts              # Optimized topics hook
│   ├── useSubtopics.ts           # Optimized subtopics hook
│   └── useHome.ts                # Optimized home hook
└── app/
    └── (site)/
        └── question/
            └── [slug]/
                └── page.tsx      # Optimized question page
```

## 🔧 Configuration

### QueryClient Configuration

The QueryClient is configured with optimized defaults in `QueryContext.tsx`:

```typescript
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes
      gcTime: 10 * 60 * 1000,          // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
```

### Caching Strategies

Different data types have different caching strategies:

- **STATIC**: 30 minutes stale time, 1 hour GC time (subjects, topics, subtopics)
- **DYNAMIC**: 2 minutes stale time, 10 minutes GC time (dashboard, questions)
- **REALTIME**: 30 seconds stale time, 5 minutes GC time (sessions, activities)
- **SESSION**: 1 minute stale time, 15 minutes GC time (user sessions)
- **USER_PREFERENCES**: 5 minutes stale time, 10 minutes GC time (user settings)

## 🎯 Query Key Factory

Centralized query key management in `queryKeys.ts`:

```typescript
export const queryKeys = {
  subjects: {
    all: ['subjects'] as const,
    byExam: (examCode?: string) => ['subjects', examCode] as const,
  },
  topics: {
    all: ['topics'] as const,
    bySubject: (subjectId?: string) => ['topics', subjectId] as const,
  },
  // ... more query keys
};
```

## 🔄 Prefetching

Use the `usePrefetch` hook for better user experience:

```typescript
const { prefetchSubjects, prefetchTopics } = usePrefetch();

// Prefetch data before navigation
useEffect(() => {
  prefetchSubjects(examCode);
}, [examCode]);
```

## 🚨 Error Handling

Enhanced error handling with the `useQueryError` hook:

```typescript
const { handleError, handleMutationError, retryQuery } = useQueryError();

// In your query
const { data, error } = useQuery({
  queryKey: queryKeys.subjects.all,
  queryFn: getSubjects,
  onError: (error) => handleError(error, 'subjects'),
});
```

## 📊 Performance Monitoring

Monitor React Query performance with `useQueryPerformance`:

```typescript
const { metrics, insights, clearCache } = useQueryPerformance();

// Access performance metrics
console.log('Active queries:', metrics.activeQueries);
console.log('Performance insights:', insights);
```

## 🔄 Background Refetching

Keep data fresh with background refetching:

```typescript
const { startBackgroundRefetch, stopBackgroundRefetch } = useBackgroundRefetch();

useEffect(() => {
  startBackgroundRefetch(5 * 60 * 1000); // Refetch every 5 minutes
  return () => stopBackgroundRefetch();
}, []);
```

## 🛠️ Usage Examples

### Optimized Hook Usage

```typescript
// Before
const { data: subjects, isLoading } = useQuery({
  queryKey: ['subjects'],
  queryFn: () => getSubjects(examCode),
});

// After
const { data: subjects, isLoading, error } = useQuery({
  queryKey: queryKeys.subjects.byExam(examCode),
  queryFn: () => getSubjects(examCode),
  ...getQueryConfig('STATIC'),
});
```

### Optimized Mutation Usage

```typescript
const saveSubject = useMutation({
  mutationFn: async (data) => {
    if (data.id) {
      return updateSubject(data.id, data.name, data.shortName);
    } else {
      return addSubject(data.name, data.shortName);
    }
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.subjects.all });
  },
  onError: (error) => handleMutationError(error, 'saveSubject'),
});
```

## 🎨 React Query DevTools

React Query DevTools are automatically included in development mode:

- **Position**: Bottom-right corner
- **Features**: Query inspection, cache management, performance monitoring
- **Access**: Click the floating button in development

## 📈 Performance Benefits

1. **Reduced Network Requests**: Smart caching reduces unnecessary API calls
2. **Better User Experience**: Prefetching and background refetching
3. **Improved Error Handling**: Consistent error messages and retry logic
4. **Type Safety**: Query key factory provides type-safe query keys
5. **Performance Monitoring**: Real-time insights into query performance
6. **Optimized Caching**: Different strategies for different data types

## 🔧 Best Practices

1. **Use Query Key Factory**: Always use `queryKeys` for consistent query key management
2. **Choose Appropriate Cache Strategy**: Use the right `getQueryConfig` for your data type
3. **Handle Errors**: Always implement error handling in queries and mutations
4. **Prefetch Data**: Use prefetching for better user experience
5. **Monitor Performance**: Use performance monitoring in development
6. **Invalidate Queries**: Properly invalidate related queries after mutations

## 🚀 Migration Guide

To migrate existing queries to the optimized version:

1. Replace hardcoded query keys with `queryKeys` factory
2. Add appropriate `getQueryConfig` based on data type
3. Implement error handling with `useQueryError`
4. Add prefetching where appropriate
5. Update mutations to use proper invalidation

## 📝 Notes

- React Query DevTools are only included in development mode
- Background refetching is configurable and can be disabled
- Performance monitoring updates every 5 seconds
- All optimizations are backward compatible
