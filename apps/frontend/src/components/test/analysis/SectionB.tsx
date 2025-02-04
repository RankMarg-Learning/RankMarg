import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { AnalysisSectionB } from '@/types/typeTest'
import React from 'react'

const SectionB = ({ analysis }: { analysis: AnalysisSectionB }) => {
    return (
        <Card className="space-y-6 p-6 rounded-md">
            <h1 className="text-xl font-bold">Performance Metrics</h1>

            {/* Question Attempt Analysis */}
            <section className="md:space-y-3 space-y-2 ">
                <h2 className="text-lg font-semibold">Question Attempt Analysis</h2>
                <div className="grid gap-3 md:grid-cols-2">
                    <Card className="rounded-md">
                        <CardHeader className="hidden">
                            <CardTitle className="text-base font-medium">Question Attempt Pattern</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 md:py-5 py-3">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm w-20">Correct</span>
                                <Progress value={analysis?.statistics?.correct / analysis?.statistics?.totalQuestions * 100} className="flex-1 h-4 bg-gray-100" indicatorColor="bg-yellow-300" />
                                <span className="text-sm w-16 text-right">{analysis?.statistics?.correct}/{analysis?.statistics?.totalQuestions}</span>
                            </div>

                            <div className="flex items-center space-x-4">
                                <span className="text-sm w-20">Incorrect</span>
                                <Progress value={analysis?.statistics?.incorrect / analysis?.statistics?.totalQuestions * 100} className="flex-1 h-4 bg-gray-100" indicatorColor="bg-yellow-300" />
                                <span className="text-sm w-16 text-right">{analysis?.statistics?.incorrect}/{analysis?.statistics?.totalQuestions}</span>
                            </div>

                            <div className="flex items-center space-x-4">
                                <span className="text-sm w-20">Unattempted</span>
                                <Progress value={analysis?.statistics?.unattempted / analysis?.statistics?.totalQuestions * 100} className="flex-1 h-4 bg-gray-100" indicatorColor="bg-yellow-300" />
                                <span className="text-sm w-16 text-right">{analysis?.statistics?.unattempted}/{analysis?.statistics?.totalQuestions}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-md">
                        <CardContent className="space-y-4 py-3">
                            <CardTitle>Question Attempt Analysis - AI</CardTitle>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    <TextGenerateEffect words={analysis?.feedback}
                                    />
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </section>

            {/* Accuracy Analysis */}
            <div className=" justify-between md:gap-4 gap-2  mt-10 hidden">
                {/* Easy Questions */}
                <div className="bg-green-100 p-4 rounded-lg shadow-md text-center flex-1 min-h-[130px]">
                    <h2 className="md:text-md text-sm font-semibold text-green-600">Easy Questions</h2>
                    <p className="md:text-2xl text-xl font-bold text-green-600 mt-2">95%</p>
                    <p className="text-gray-600 mt-1 md:text-sm text-xs">19/20 Correct</p>
                </div>

                {/* Medium Questions */}
                <div className="bg-yellow-100 p-4 rounded-lg shadow-md text-center flex-1 min-h-[130px]">
                    <h2 className="md:text-md text-sm font-semibold text-yellow-600">Medium Questions</h2>
                    <p className="md:text-2xl text-xl font-bold text-yellow-600 mt-2">75%</p>
                    <p className="text-gray-600 mt-1 md:text-sm text-xs">15/20 Correct</p>
                </div>

                {/* Hard Questions */}
                <div className="bg-red-100 p-4 rounded-lg shadow-md text-center flex-1 min-h-[130px]">
                    <h2 className="md:text-md text-sm font-semibold text-red-600">Hard Questions</h2>
                    <p className="md:text-2xl text-xl font-bold text-red-600 mt-2">55%</p>
                    <p className="text-gray-600 mt-1 md:text-sm text-xs">11/20 Correct</p>
                </div>
            </div>
        </Card>
    )
}

export default SectionB