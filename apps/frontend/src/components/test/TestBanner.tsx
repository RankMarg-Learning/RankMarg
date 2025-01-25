'use client'

import { useState } from 'react'
import { Clock, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import Countdown from './TestCounter'

interface BannerProps {
    testId: string
    title: string
    marks: number
    duration: string
    totalQuestions: number
    startDate: Date
}

export default function Banner({ testId, title, marks, duration, totalQuestions, startDate }: BannerProps) {
    const [isLive, setIsLive] = useState(false)

    return (
        <div className="bg-gray-800 text-white py-16 px-4">
            <div className="max-w-6xl mx-auto text-center">
                {/* <div className="mb-8">
                    <h1 className="text-4xl font-light mb-2">Rank Marg</h1>
                    <p className="text-gray-400">Participate in tests and improve your score!</p>
                </div> */}

                <div className="grid  gap-6 max-w-4xl mx-auto ">
                    <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
                                {/* Geometric shapes */}
                                <div className="absolute w-40 h-40 bg-white rounded-lg transform rotate-45 -translate-x-1/2 -translate-y-1/2"></div>
                                <div className="absolute w-40 h-40 bg-white rounded-full transform -translate-x-full -translate-y-1/2 opacity-50"></div>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-semibold mb-4">Upcoming Test</h2>
                            {
                                title === "No upcoming test" ? <div className='justify-center items-center flex text-center'>No upcoming test</div> :
                                <>
                                <div className="space-y-2 text-left mb-4">
                                <div className='md:flex items-center justify-center md:justify-between '>
                                    <h1 className='text-2xl font-semibold'> {title}</h1>

                                    <p><span className="text-white">Total Marks:</span> {marks}</p>
                                </div>
                                <span className='text-sm text-gray-50 text-center'>
                                    {startDate.toLocaleString('en-US', {
                                        weekday: 'long', 
                                        hour: 'numeric', 
                                        hour12: true,    
                                    })}
                                </span>
                                <div className="flex items-center text-white">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span>Duration: {duration} mins</span>
                                </div>
                                <div className="flex items-center text-white">
                                    <HelpCircle className="w-4 h-4 mr-2" />
                                    <span>{totalQuestions} Questions</span>
                                </div>


                            </div>
                            {isLive ? (
                                <Link
                                    href={`/test/${testId}/instructions`}
                                    className="inline-block bg-white text-yellow-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300"
                                >
                                    Start Test
                                </Link>
                            ) : (
                                <div className="text-sm flex justify-center">
                                    <Countdown targetDate={startDate} onComplete={() => setIsLive(true)} />
                                </div>
                            )}
                            </>
                            }
                            
                        </div>
                    </div>


                </div>
            </div>
        </div>
    )
}

