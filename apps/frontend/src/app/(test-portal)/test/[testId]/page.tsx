import TestPage from '@/components/test/TestPage'
import React from 'react'

const TestHomePage = ({params}:{params:{testId:string}}) => {

  return (
    <>
      <TestPage testId={params.testId} />
    </>
  )
}

export default TestHomePage