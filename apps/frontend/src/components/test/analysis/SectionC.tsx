import { Card, CardContent, CardHeader, CardTitle } from '@repo/common-ui'
import { Progress } from '@repo/common-ui'
import React from 'react'
import { TimeSpendChart } from './TImeSpendChart'
import { AnalysisSectionC } from '@/types/typeTest'
import { SubjectBackgroundColor, SubjectCardColor, SubjectTextColor } from '@/constant/SubjectColorCode'
import { Clock } from 'lucide-react'

const SectionC = ({ analysis }: { analysis: AnalysisSectionC }) => {
    return (
        <Card className="border-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Clock className="w-5 h-5" />
                    Time Distribution Analysis
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>

                <div className="grid md:grid-cols-3 gap-4">
                    {
                        analysis?.sectionTimings.map((section, index) => (
                            <>
                                <Card key={index} className={`space-y-1 rounded-lg shadow-none border p-2 ${section.totalTime ? "" : "hidden"} ${SubjectCardColor[section.name.toLowerCase() as keyof typeof SubjectCardColor] || SubjectCardColor.default}`}>
                                    <div className="flex justify-between">
                                        <span className={`font-medium ${SubjectTextColor[section.name.toLowerCase() as keyof typeof SubjectTextColor] || SubjectTextColor.default}`}>{section.name}</span>
                                        <span className="text-sm">{(section.totalTime / 60).toFixed(1)} minutes</span>
                                    </div>
                                    <Progress value={(section.totalTime / 60) / section.maxTime * 100 || 0} className="h-2 bg-gray-100" indicatorColor={`${SubjectBackgroundColor[section.name.toLowerCase() as keyof typeof SubjectBackgroundColor] || SubjectBackgroundColor.default}`} />
                                    <div className={`text-sm ${SubjectTextColor[section.name.toLowerCase() as keyof typeof SubjectTextColor] || SubjectTextColor.default}`}>Spent {(section.totalTime / 60).toFixed(1)}/{section.maxTime} min</div>
                                </Card>
                            </>
                        ))
                    }
                </div>
                <TimeSpendChart data={analysis?.questionTimings} />
            </CardContent>
        </Card>
    )
}

export default SectionC