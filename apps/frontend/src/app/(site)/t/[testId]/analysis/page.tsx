import TestAnalysisPage from '@/components/test/TestAnalysis'
import { Metadata } from 'next';
import React from 'react'

export async function generateMetadata({ params }: { params: { testId: string } }): Promise<Metadata> {
  return {
    title: `Test Analytics - ${params.testId} | RankMarg`,
    description: `View detailed analytics for test ID ${params.testId} on RankMarg. Analyze your performance and improve your JEE/NEET preparation.`,
  };
}

const TestAnalytics = ({ params }: { params: { testId: string } }) => {
  const { testId } = params
  return (
    <TestAnalysisPage testId={testId} />
  )
}

export default TestAnalytics

