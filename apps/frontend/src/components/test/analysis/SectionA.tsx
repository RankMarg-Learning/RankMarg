import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AnalysisSectionA } from '@/types/typeTest'
import { BarChart3, CheckCircle2, Clock } from 'lucide-react'
import React from 'react'

const SectionA = ({analysis}:{analysis:AnalysisSectionA}) => {

    const timeFormat = (time:number) =>{
        if(time === null) return "0h 0m"
        const hours = Math.floor(time / 60)
        const minutes = time % 60
        return `${hours}h ${minutes}m`
    }


    return (
        <Card className="space-y-3 md:p-8 p-3 rounded-md shadow-sm">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold">{analysis?.testTitle}</h1>
                {
                    analysis?.stream === "JEE" ?
                
                <div className="flex gap-2">
                    <span className="text-yellow-600">Physics</span>
                    <span>•</span>
                    <span className="text-yellow-600">Chemistry</span>
                    <span>•</span>
                    <span className="text-yellow-600">Mathematics</span>
                </div>:
                <div className="flex gap-2">
                    <span className="text-yellow-600">Physics</span>
                    <span>•</span>
                    <span className="text-yellow-600">Chemistry</span>
                    <span>•</span>
                    <span className="text-yellow-600">Biology</span>
                </div>
}
            </div>

            {/* Score Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="rounded-md shadow-sm">
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-muted-foreground">Total Score</span>
                            </div>
                            <div className="text-2xl font-bold">{analysis?.participantScore}/{analysis?.totalMarks}</div>
                            <div className="text-sm text-muted-foreground">{(analysis?.participantScore/analysis?.totalMarks*100).toFixed(2)}% Score</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-md shadow-sm">
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-muted-foreground">Time Duration</span>
                            </div>
                            <div className="text-2xl font-bold">{timeFormat(analysis?.testDuration)}</div>
                            <div className="text-sm text-green-600">Total Duration</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-md shadow-sm">
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-600" />
                                <span className="text-sm text-muted-foreground">Time Taken</span>
                            </div>
                            <div className="text-2xl font-bold">{timeFormat(Math.floor((analysis?.timeTaken)/60))}</div>
                            <div className="text-sm text-purple-600">{analysis?.testDuration - (Math.floor((analysis?.timeTaken)/60))} mins saved</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-md">
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-orange-600" />
                                <span className="text-sm text-muted-foreground">Accuracy</span>
                            </div>
                            <div className="text-2xl font-bold">{analysis?.accuracy?.toFixed(2)}%</div>
                            <div className="text-sm text-orange-600 hidden">Above Average</div>
                        </div>
                    </CardContent>
                </Card>
            </div>


            {/* Subject Performance */}
            <Card className="rounded-md space-y-3 bg-gray-100">
                <CardHeader className="hidden">
                    Section-wise Performance
                </CardHeader>
                <h2 className="text-lg font-semibold pl-2">Section-wise Performance</h2>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {
                        analysis?.sectionPerformance.map((section,index)=>(
                            <Card key={index} className="p-3 md:p-4 rounded-sm">
                                <div className="flex justify-between">
                                    <span>{section.sectionName}</span>
                                    <span className="text-yellow-600">{section?.participantScore}/{section?.totalMarks}</span>
                                </div>
                                <Progress value={section?.participantScore/section?.totalMarks*100} className="h-2 bg-gray-100" indicatorColor="bg-yellow-300" />
                            </Card>
                        ))
                    }
                    
                </CardContent>
            </Card>
        </Card>
    )
}

export default SectionA