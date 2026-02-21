import TestDetail from '@/components/test/TestDetail'
import React, { Suspense } from 'react'

const TestPanelPage = ({ params }: {
  params: {
    testId: string
  }
}) => {
  return (
    <Suspense fallback={null}>
      <TestDetail testId={params.testId} />
    </Suspense>
  )
}

export default TestPanelPage