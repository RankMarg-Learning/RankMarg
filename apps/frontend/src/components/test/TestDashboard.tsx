'use client'

import Link from 'next/link'
import React from 'react'
import TestsCard from './Tests-Card'
import Banner from './TestBanner'
import Image from 'next/image'
import { Button } from '../ui/button'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Skeleton } from '../ui/skeleton'

// const upcomingTest = {
//   title: "Advanced Mathematics Exam",
//   marks: 100,
//   duration: "3 hours",
//   totalQuestions: 50,
//   startDate: new Date(Date.now() + 100000), // Set to 10 seconds from now for demonstration
// }



const TestDashboard = () => {

  const { data: tests, isLoading, error } = useQuery({
    queryKey: ["tests", "subject-wise"],
    queryFn: async () => {
      const { data } = await axios.get("/api/test/examtype", { params: { examType: "Mock-Test" } });
      return data;
    },
  });

  const upcomingTest = () => {
    if (!tests) return {
      testId: "",
      title: "No upcoming test",
      marks: 0,
      duration: 0,
      totalQuestions: 0,
      startDate: new Date()
    }

    const test = tests.find((test) => test.endTime && new Date(test.endTime) > new Date())
    return test ? {
      testId: test.testId,
      title: test.title,
      marks: test.totalMarks,
      duration: test.duration,
      totalQuestions: test.totalQuestions,
      startDate: new Date(test.startTime)
    } : {
      testId: "",
      title: "No upcoming test",
      marks: 0,
      duration: 0,
      totalQuestions: 0,
      startDate: new Date()
    }
  }

  if (error) return <div>Error loading tests</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Banner {...upcomingTest()} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Ads Section */}
          <aside className="md:w-1/6 space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hidden">
              <Image src={"/images/test-banner.png"} alt={"test-banner"} width={300} height={200} className="w-full object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">JEE Main 2024 Mock Test #1</h3>
                <p className="text-gray-600 mb-4">This is a test</p>
                <Link
                  href={"/tests/1"}
                  className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-300"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </aside>

          <section className="md:w-3/4">
            <div className='flex justify-between items-center'>
              <h2 className="text-2xl font-semibold mb-6">Available Tests</h2>
              <div className='space-x-4'>
                <Link href="/tests/topic-wise">
                  <Button variant="outline">Topic-wise Tests</Button>
                </Link>
                <Link href="/tests/chapter-wise">
                  <Button variant="outline">Chapter-wise Tests</Button>
                </Link>
              </div>
              
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className='h-13 w-60 ' />
                ))
              ) : tests?.length > 0 ? tests.map((test, index) => {
                if(new Date(test.endTime) > new Date()) {
                  return null;
                }
                return (
                  <TestsCard key={index}
                    testId={test.testId}
                    hasAttempted={test.hasAttempted}
                    title={test.title}
                    description={test.description}
                    duration={test.duration}
                    totalQuestions={test.totalQuestions}
                  />
                );
              }) : <div>No tests found</div>}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default TestDashboard

{/* <div className='mx-auto p-3 h-screen'>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Practice Popular {session?.user?.stream} Tests</h2>
        <div className="space-x-4">
          <Link href="/tests/topic-wise">
            <Button variant="outline">Topic-wise Tests</Button>
          </Link>
          <Link href="/tests/chapter-wise">
            <Button variant="outline">Chapter-wise Tests</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {mainTests.map((test,idx) => (
          <TestsCard
            key={idx}
            title={test.title}
            description={test.description}
            duration={test.duration}
            totalQuestions={test.totalMarks}
          />
        ))}
      </div>
    </div> */}