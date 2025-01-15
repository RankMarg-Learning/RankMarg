import TestAnalysisPage from '@/components/test/TestAnalysis'
import React from 'react'

const TestAnalytics = ({params}:{params:{testId:string}}) => {
    const {testId} = params
  return (
    <TestAnalysisPage testId={testId} />
  )
}

export default TestAnalytics