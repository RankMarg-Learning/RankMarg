import TestDetail from '@/components/test/TestDetail'
import React from 'react'

const TestPanelPage = ({params}:{
  params:{
    testId:string
  }
}) => {
  return (
    <TestDetail testId={params.testId} />
  )
}

export default TestPanelPage