import TestPage from '@/components/test/TestPage'
import { Metadata } from 'next';
import React from 'react'

export async function generateMetadata({ params }: { params: { testId: string } }): Promise<Metadata> {
  return {
    title: `Test - ${params.testId} | RankMarg`,
    description: `Attempt the test with ID ${params.testId} on RankMarg. Prepare for JEE and NEET with our mock tests.`,
  };
}

const TestHomePage = ({params}:{params:{testId:string}}) => {

  return (
    <>
      <TestPage testId={params.testId} />
    </>
  )
}

export default TestHomePage