import Questionset from '@/components/questions/QuestionTable'
// import RandomQuestion from '@/components/questions/RandomQuestion'
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: "Question Bank | RankMarg",
  description: "Explore a vast collection of expertly curated questions on RankMarg, tailored specifically for JEE and NEET aspirants. Dive into subject-wise, topic-wise, and chapter-wise questions aligned with the latest syllabus. Each question is designed to challenge your problem-solving skills and boost your preparation. With detailed solutions, difficulty-level tagging, and average time analysis, you can track your progress and focus on mastering weaker areas. Whether it's Physics, Chemistry, or Mathematics, RankMarg's question bank ensures you're fully equipped for success.",
};

const QuestionSet = () => {
  return (
    <main >
      {/* <RandomQuestion  /> */}
      <Questionset 
      />
    </main>
  )
}

export default QuestionSet