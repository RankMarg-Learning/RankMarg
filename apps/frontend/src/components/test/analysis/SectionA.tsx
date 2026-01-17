import { Card, CardContent, CardHeader } from '@repo/common-ui'
import { Progress } from '@repo/common-ui'
import { SubjectBackgroundColor, SubjectCardColor, SubjectTextColor } from '@/constant/SubjectColorCode'
import { AnalysisSectionA } from '@/types/typeTest'
import { CheckCircle2, Clock } from 'lucide-react'
import React from 'react'

const SectionA = ({ analysis }: { analysis: AnalysisSectionA }) => {

    const timeFormat = (time: number) => {
        if (time === null) return "0h 0m"
        const hours = Math.floor(time / 60)
        const minutes = time % 60
        return `${hours}h ${minutes}m`
    }


    return (
        <Card className="space-y-3  p-3 border-none">

            <div className=''>
                <Card className="border border-border/50 bg-gradient-to-br from-white from-50% to-primary-50 rounded-xl ">
                    <CardContent className="p-6 ">
                        <h2 className="text-lg font-medium text-muted-foreground mb-4 ">{analysis?.testTitle}</h2>

                        <div className="flex items-end justify-end gap-6">
                            <div className="pb-2 ">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-semibold text-primary">{(analysis?.participantScore / analysis?.totalMarks * 100).toFixed(2)}</span>
                                    <span className="text-sm text-muted-foreground">/100</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Percentage</p>
                            </div>
                            <div className="flex items-baseline">
                                <span className="text-6xl md:text-7xl font-bold text-primary">
                                    {analysis?.participantScore}
                                </span>
                                <span className="text-2xl text-muted-foreground">/{analysis?.totalMarks}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Score Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                <Card className="rounded-xl  h-full ">
                    <CardContent className="md:p-6 p-4">
                        <div className="flex flex-row items-center justify-between md:flex-col md:items-start md:space-y-2">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-green-600" />
                                <span className="text-base text-muted-foreground font-medium">Time Duration</span>
                            </div>
                            <div className="text-right md:text-left">
                                <div className="text-2xl font-bold text-gray-500">{timeFormat(analysis?.testDuration)}</div>
                                <div className="text-sm text-green-600">Total Duration</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl  h-full">
                    <CardContent className="md:p-6 p-4">
                        <div className="flex flex-row items-center justify-between md:flex-col md:items-start md:space-y-2">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-600" />
                                <span className="text-base text-muted-foreground font-medium">Time Taken</span>
                            </div>
                            <div className="text-right md:text-left">
                                <div className="text-2xl font-bold text-gray-500">{timeFormat(Math.floor((analysis?.timeTaken) / 60))}</div>
                                <div className="text-sm text-purple-600">{analysis?.testDuration - (Math.floor((analysis?.timeTaken) / 60))} mins saved</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl h-full">
                    <CardContent className="md:p-6 p-4">
                        <div className="flex flex-row items-center justify-between md:flex-col md:items-start md:space-y-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-orange-600" />
                                <span className="text-base text-muted-foreground font-medium  ">Accuracy</span>
                            </div>
                            <div className="text-right md:text-left">
                                <div className="text-2xl font-bold text-gray-500">{analysis?.accuracy?.toFixed(2)}%</div>
                                <div className="text-sm text-orange-600 ">{analysis?.accuracy >= 90
                                    ? "Excellent"
                                    : analysis?.accuracy >= 80
                                        ? "Good"
                                        : analysis?.accuracy >= 65
                                            ? "Needs Improvement"
                                            : "Critical"}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>


            {/* Subject Performance */}
            <Card className="border-none space-y-3 ">
                <CardHeader className="hidden">
                    Section-wise Performance
                </CardHeader>
                <h2 className="text-lg font-semibold pl-2">Section-wise Performance</h2>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {
                        analysis?.sectionPerformance.map((section, index) => (
                            <Card key={index} className={`p-4 md:p-6 rounded-xl space-y-3 shadow-none border ${SubjectCardColor[section.sectionName.toLowerCase() as keyof typeof SubjectCardColor] || SubjectCardColor.default}`}>
                                <div className="flex justify-between">
                                    <span className={`text-sm font-medium ${SubjectTextColor[section.sectionName.toLowerCase() as keyof typeof SubjectTextColor] || SubjectTextColor.default}`}>{section.sectionName}</span>
                                    <span className={`text-sm font-medium ${SubjectTextColor[section.sectionName.toLowerCase() as keyof typeof SubjectTextColor] || SubjectTextColor.default}`}>{section?.correctAnswers}/{section?.totalQuestions}</span>
                                </div>
                                <Progress value={section?.accuracy} className="h-2 bg-gray-100" indicatorColor={`${SubjectBackgroundColor[section.sectionName.toLowerCase() as keyof typeof SubjectBackgroundColor] || SubjectBackgroundColor.default}`} />
                            </Card>
                        ))
                    }

                </CardContent>
            </Card>
        </Card>
    )
}

export default SectionA