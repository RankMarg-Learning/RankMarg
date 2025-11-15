import React from 'react'
import { Button } from '@repo/common-ui'
import Link from 'next/link'

const PracticeTestimonials = () => {
    return (
        <div className="p-6 md:col-span-2 rounded-xl border border-gray-200/30 shadow-sm" id="el-wcvda9co">
            <h3 className="text-lg font-bold text-gray-800 mb-2" id="el-5oq0ffph">Get the Most From Your Practice</h3>
            <p className="text-gray-600 mb-4 text-sm" id="el-xh2sbk8f">Our AI analyzes your learning patterns and offers personalized suggestions to help you improve faster.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4" id="el-ee4s3ehr">
                <div className="flex items-start" id="el-de9rx1rm">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3 mt-0.5" id="el-hpj8r81h">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" id="el-dk4jcye9">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" id="el-k056rqmj"></path>
                        </svg>
                    </div>
                    <div id="el-gdcgl1ht">
                        <h4 className="text-sm font-medium text-gray-800" id="el-yewey3pj">Optimized Learning Schedule</h4>
                        <p className="text-xs text-gray-500" id="el-fqt1pd2t">Practice at your peak performance times</p>
                    </div>
                </div>

                <div className="flex items-start" id="el-7sbzwljo">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3 mt-0.5" id="el-smmrf3nb">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" id="el-7mz7audv">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" id="el-o1blqfnr"></path>
                        </svg>
                    </div>
                    <div id="el-vs26ej0s">
                        <h4 className="text-sm font-medium text-gray-800" id="el-bixzk1ck">Personalized Recommendations</h4>
                        <p className="text-xs text-gray-500" id="el-jmsne1jp">Based on your learning style and progress</p>
                    </div>
                </div>

                <div className="flex items-start" id="el-kmzgp65k">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3 mt-0.5" id="el-17g4x8rn">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" id="el-jfsoix3q">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" id="el-3f2a07vw"></path>
                        </svg>
                    </div>
                    <div id="el-j7j01or4">
                        <h4 className="text-sm font-medium text-gray-800" id="el-z95c8ebc">Progress Tracking</h4>
                        <p className="text-xs text-gray-500" id="el-qos1k66v">Visualize your improvement over time</p>
                    </div>
                </div>

                <div className="flex items-start" id="el-t9lel59v">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3 mt-0.5" id="el-bq5xc7c3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" id="el-mhbe0txf">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" id="el-spvng8i7"></path>
                        </svg>
                    </div>
                    <div id="el-hfti84ub">
                        <h4 className="text-sm font-medium text-gray-800" id="el-cpji5ypy">Weakness Targeting</h4>
                        <p className="text-xs text-gray-500" id="el-b68du57j">Focus on areas that need improvement</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3" id="el-kvkwia5p">
                <Button disabled className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500" id="el-7gv7723l">
                    Analyze My Learning Style
                </Button>
                <Link href={'/analytics'} className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500" id="el-9y8gtyas">
                    View Detailed Reports
                </Link>
            </div>
        </div>
    )
}

export default PracticeTestimonials