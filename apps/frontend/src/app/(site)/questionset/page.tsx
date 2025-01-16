import Questionset from '@/components/questions/QuestionTable'
// import RandomQuestion from '@/components/questions/RandomQuestion'
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: "Question Bank | RankMarg",
  description: "Question Bank for NEET and JEE aspirants",
};

const QuestionSet = () => {
  return (
    <main className="flex flex-col items-start gap-4 p-4 my-2 sm:px-6 sm:py-0 md:gap-8">
      {/* <RandomQuestion  /> */}
      <Questionset />
    </main>
  )
}

export default QuestionSet