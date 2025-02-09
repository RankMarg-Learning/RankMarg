'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { useTestContext } from '@/context/TestContext'
import { ScrollArea } from '../ui/scroll-area'
import Loading from '../Loading'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { TestStatus } from '@prisma/client'



export default function TestDetail({ testId }: { testId: string }) {
  const [testKey, setTestKey] = useState('')
  const router = useRouter()
  const [step, setStep] = useState<"instructions" | "details">("instructions")
  const [agreed, setAgreed] = useState(false)

  const { setQuestions, setTestId, setTestSection, setTestInfo, setIsLoaded } = useTestContext()



  const { data: test, isLoading } = useQuery({
    queryKey: ["testId", testId],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/test/${testId}`)
        return response.data
      } catch (error) {
        console.error(error)
        router.push("/tests")
      }
    },
  })



  useEffect(() => {
    if(test?.testStatus === TestStatus.COMPLETED){
      router.push(`/analysis/${testId}`)
    }
    setTestId(testId)
    if (test) {
      setTestInfo({
        testId: test?.testId,
        totalMarks: test?.totalMarks,
        duration: test?.duration,
        testTitle: test?.title,
      })
      setTestId(test?.testId)
      setQuestions(test?.questions)
      setTestSection(() => {
        let questionStartIndex = 1
        return test?.section?.reduce((acc, curr) => {
          const questionCount = curr.TestQuestion.length
          const keyName = `${curr.name}_${questionStartIndex}-${questionStartIndex + questionCount - 1}`

          acc[keyName] = {
            correctMarks: +curr.correctMarks,
            negativeMarks: curr.negativeMarks > 0 ? curr.negativeMarks : 0,
            isOptional: curr.isOptional,
            maxQuestions: curr.maxQuestions,
          }

          questionStartIndex += questionCount
          return acc
        }, {})
      })
    }
    setIsLoaded(false)
  }, [test, setTestId, setQuestions, setTestSection,setTestInfo,setIsLoaded,testId,router])

  const handleTestStart = () => {
    if (test.testKey && test.testKey !== testKey) {
      setAgreed(false)
      return
    }
    router.push(`/test/${testId}`)
  };





  if (isLoading) {
    return <Loading />
  }
 

  return (
    <div className=" w-full">
      <header className="sticky top-0 z-50 w-full border-b  text-white">
        <nav className="h-14 bg-white border-b border-gray-200">
          <div className="h-full max-w-7xl  px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center">
                <Image src={'https://utfs.io/f/DbhgrrAIqRoKWCwFFv4kujRo2cBDzhfSAtQ1p0ZrLwxy9lHG'} alt="Acme Inc" width={120} height={120} priority />
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-gray-900 text-base font-medium">{test?.title}</h1>
            </div>
          </div>
        </nav>
      </header>
      <div>
        <Card className='px-2 mb-16'>
          {step === "instructions" ? (
            <>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">General Instructions:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ol className="list-decimal pl-5 space-y-4">
                  <li>
                    The clock will be set at the server. The countdown timer at the top right corner of screen will display the
                    remaining time available for you to complete the examination. When the timer reaches zero, the examination
                    will end by itself. You need not terminate the examination or submit your paper.
                  </li>
                  <li>
                    The Question Palette displayed on the right side of screen will show the status of each question using one of
                    the following symbols:
                    <div className="mt-4 space-y-3 pl-5">

                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-sm bg-gray-200" />
                        <span>You have not answered the question.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-500  rounded-sm" />
                        <span>You have answered the question.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-sm bg-purple-500" />
                        <span>You have NOT answered the question, but have marked the question for review.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-sm bg-purple-700 " />
                        <span>You have answered the question, but marked it for review.</span>
                      </div>
                    </div>
                  </li>
                </ol>

                <div className="pl-5">
                  The <span className="font-medium">Mark For Review</span> status for a question simply indicates that you would
                  like to look at that question again. If a question is answered, but marked for review, then the answer will be
                  considered for evaluation unless the status is modified by the candidate.
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Navigating to a Question:</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>To answer a question, do the following:</li>
                    <ol className="list-decimal pl-8 space-y-2">
                      <li>
                        Click on the question number in the Question Palette at the right of your screen to go to that numbered
                        question directly. Note that using this option does NOT save your answer to the current question.
                      </li>
                      <li>Click on Save & Next to save your answer for the current question and then go to the next question.</li>
                      <li>
                        Click on Mark for Review & Next to save your answer for the current question, mark it for review, and
                        then go to the next question.
                      </li>
                    </ol>
                  </ol>
                </div>

                <div>
                  Note that your answer for the current question will not be saved, if you navigate to another question directly
                  by clicking on a question number without saving the answer to the previous question.
                </div>

                <div>
                  You can view all the questions by clicking on the <span className="font-medium">Question Paper</span> button.{" "}
                  <span className="text-red-500">
                    This feature is provided, so that if you want you can just see the entire question paper at a glance.
                  </span>
                </div>


              </CardContent>
            </>
          ) : (
            <div >
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center mb-4">
                  {test.examType} - {test.title}
                </CardTitle>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Duration: {test.duration} Mins</span>
                  <span>Total Marks: {test.totalMarks}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 rounded-none">
                <ScrollArea className="h-[calc(100vh-1.5rem)]space-y-4" >
                  <h2 className="font-medium">Read the following instructions carefully.</h2>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>The test contains a total of {test.totalQuestions} questions.</li>
                    <li>
                      Each question has{" "}
                      {test?.section[0]?.TestQuestion[0]?.options?.length || 4} options (if applicable),
                      out of which only one is correct.
                    </li>
                    <li>You have to finish the test in {test.duration} minutes.</li>
                    {test.section.length > 1 ? (
                      test.section.map((section, idx) => (
                        <li key={idx}>
                          For the "{section.name}" section:
                          <ul className="pl-5 list-disc space-y-1">
                            <li>
                              {section.isOptional
                                ? `You can answer up to ${section.maxQuestions} questions in this optional section.`
                                : "All questions in this section are mandatory."}
                            </li>
                            <li>
                              You will be awarded {section.correctMarks} marks for each correct answer.
                            </li>
                            {section.negativeMarks ? (
                              <li>
                                {Math.abs(section.negativeMarks)} marks will be deducted for each incorrect
                                answer.
                              </li>
                            ) : (
                              <li>There is no negative marking in this section.</li>
                            )}
                          </ul>
                        </li>
                      ))
                    ) : (
                      <>
                        <li>
                          You will be awarded {test.section[0]?.correctMarks} marks for each correct answer.
                        </li>
                        {test.section[0]?.negativeMarks ? (
                          <li>
                            {Math.abs(test.section[0].negativeMarks)} marks will be deducted for each
                            incorrect answer.
                          </li>
                        ) : (
                          <li>There is no negative marking in this test.</li>
                        )}
                      </>
                    )}
                    <li>
                      You can only write this test once. Ensure you complete the test before submitting or
                      closing the browser.
                    </li>
                  </ol>
                </ScrollArea>

                {test.testKey && (
                  <div className="space-y-2">
                    <Label htmlFor="test-key">Test Key :</Label>
                    <Input
                      id="test-key"
                      type="text"
                      placeholder="Enter test key"
                      value={testKey}
                      onChange={(e) => setTestKey(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <h2 className="font-medium">Declaration:</h2>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="declaration"
                      checked={agreed}
                      onCheckedChange={(checked) => setAgreed(checked as boolean)}
                    />
                    <label htmlFor="declaration" className="text-sm">
                      I have read all the instructions carefully and have understood them. I agree not to
                      cheat or use unfair means in this examination. I understand that using unfair means of
                      any sort for my own or someone else&apos;s advantage will lead to my immediate
                      disqualification. The decision of rankmarg.com will be final in these matters and
                      cannot be appealed.
                    </label>
                  </div>
                </div>
              </CardContent>
            </div>
          )}
        </Card>
      </div>
      <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-md border-t p-4 z-50">
        <>
          {step === 'details' ? (
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('instructions')}>
                Previous
              </Button>
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button disabled={!agreed} >I am ready to begin</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                      <DialogTitle>Important Notice</DialogTitle>
                      <DialogDescription>
                        Please ensure that your device's display timeout is set to at least
                        30 minutes to avoid interruptions during the test.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-between gap-2">
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Close
                        </Button>

                      </DialogClose>
                      <Button onClick={() => {
                        handleTestStart()
                      }}>
                        Start
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button className='w-20' onClick={() => setStep("details")}>Next</Button>
            </div>
          )}
        </>
      </footer>
    </div>
  )
}

