import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import React from 'react'
import { TimeSpendChart } from './TImeSpendChart'
import { AnalysisSectionC } from '@/types/typeTest'

const SectionC = ({analysis}:{analysis:AnalysisSectionC}) => {
    console.log(analysis)
    return (
        <Card className="rounded-md p-3">
            <CardHeader>
                <h2 className="text-xl font-semibold">Time Distribution Analysis</h2>
            </CardHeader>
            <CardContent className='space-y-2'>
            <Card className="rounded-md ">
                <CardHeader>
                    <h3 className="text-xl font-semibold">Subject-wise Time Distribution</h3>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                        {
                            analysis?.sectionTimings.map((section,index)=>(
                                <>
                                <Card key={index} className={`space-y-1 rounded-md bg-blue-50 p-2 ${section.totalTime ?"":"hidden"}`}>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-blue-600">{section.name}</span>
                                        <span className="text-sm">{(section.totalTime/60).toFixed(1)} minutes</span>
                                    </div>
                                    <Progress value={(section.totalTime/60)/section.maxTime*100 || 0} className="h-2 bg-gray-100" indicatorColor="bg-blue-500" />
                                    <div className="text-sm text-muted-foreground">Spent {(section.totalTime/60).toFixed(1)}/{section.maxTime} min</div>
                                </Card>
                                </>
                            ))
                        }
                        

                    </div>
                </CardContent>
            </Card>
            <TimeSpendChart data={analysis?.questionTimings} />
            </CardContent>
        </Card>
    )
}

export default SectionC