import TestPage from '@/components/test/TestPage'
import { Metadata } from 'next';
import React, { Suspense } from 'react'

export async function generateMetadata({ params }: { params: { testId: string } }): Promise<Metadata> {
  return {
    title: `Test - ${params.testId} | RankMarg`,
    description: `Attempt the test with ID ${params.testId} on RankMarg. Prepare for JEE and NEET with our mock tests.`,
  };
}

const TestHomePage = ({ params }: { params: { testId: string } }) => {

  return (
    <Suspense fallback={null}>
      <TestPage testId={params.testId} />
    </Suspense>
  )
}

export default TestHomePage