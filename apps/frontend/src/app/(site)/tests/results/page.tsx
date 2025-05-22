'use client'

import Loading from '@/components/Loading'
import RecentTestResults from '@/components/test/RecentTestResults'
import { getTestResults } from '@/services/test.service'
import { useInfiniteQuery } from '@tanstack/react-query'
import React, { useRef, useEffect } from 'react'

const TestResultPage = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['tests', 'results'],
    queryFn: ({ pageParam = 1 }) => getTestResults(pageParam),
    getNextPageParam: (lastPage) => lastPage?.nextPage ?? null,
    initialPageParam: 1,
  });

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || !observerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [hasNextPage, fetchNextPage]);

  if (isLoading) return <Loading />;
  if (error) return <div>Error loading results.</div>;

  const results = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <>
      <RecentTestResults results={results} allResults={true} />
      {isFetchingNextPage && <Loading />}
      <div ref={observerRef} style={{ height: 1 }} />
    </>
  );
};

export default TestResultPage;
