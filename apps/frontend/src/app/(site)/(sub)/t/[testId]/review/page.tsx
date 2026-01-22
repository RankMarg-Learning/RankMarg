import { ReviewTestPage } from '@/components/test/review/ReviewTestPage';
import { Metadata } from 'next';
import React from 'react';

export async function generateMetadata({ params }: { params: { testId: string } }): Promise<Metadata> {
  return {
    title: `Review Test - ${params.testId} | RankMarg`,
    description: `Review your test questions with detailed solutions for test ID ${params.testId} on RankMarg.`,
  };
}

const ReviewTest = ({ params }: { params: { testId: string } }) => {
  const { testId } = params;
  return <ReviewTestPage testId={testId} />;
};

export default ReviewTest;

