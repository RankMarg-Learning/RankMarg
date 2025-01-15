import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import React from 'react'
import { AnalysisSectionD } from '@/types/typeTest'

const SectionD = ({analysis}:{analysis:AnalysisSectionD}) => {
    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-semibold">Difficulty Level Analysis</h2>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Overall Difficulty Distribution</h3>
                    <div className="grid gap-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                            <div className="flex justify-between mb-2">
                                <span>Easy ({analysis?.difficultyWiseAnalysis.easy.total} Questions)</span>
                                {/* //parecntage 2 digit in front  */}
                                <span className="text-green-600">
                                    {((analysis?.difficultyWiseAnalysis.easy.correct/analysis?.difficultyWiseAnalysis.easy.total*100) || 0).toFixed(2)}% Success
                                </span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Correct: {analysis?.difficultyWiseAnalysis.easy.correct}</span>
                                <span>Incorrect: {analysis?.difficultyWiseAnalysis.easy.incorrect}</span>
                            </div>
                            <Progress value={analysis?.difficultyWiseAnalysis.easy.correct/analysis?.difficultyWiseAnalysis.easy.total*100 || 0} className="h-2 mt-2 bg-gray-100" indicatorColor="bg-green-500" />
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <div className="flex justify-between mb-2">
                                <span>Medium ({analysis?.difficultyWiseAnalysis.medium.total} Questions)</span>
                                <span className="text-yellow-600">
                                    {((analysis?.difficultyWiseAnalysis.medium.correct/analysis?.difficultyWiseAnalysis.medium.total*100) || 0).toFixed(2)}% Success
                                </span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Correct: {analysis?.difficultyWiseAnalysis.medium.correct}</span>
                                <span>Incorrect: {analysis?.difficultyWiseAnalysis.medium.incorrect}</span>
                            </div>
                            <Progress value={analysis?.difficultyWiseAnalysis.medium.correct/analysis?.difficultyWiseAnalysis.medium.total*100 || 0} className="h-2 mt-2 bg-gray-100" indicatorColor="bg-yellow-500" />
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                            <div className="flex justify-between mb-2">
                                <span>Hard ({analysis?.difficultyWiseAnalysis.hard.total} Questions)</span>
                                <span className="text-red-600">
                                    {((analysis?.difficultyWiseAnalysis.hard.correct/analysis?.difficultyWiseAnalysis.hard.total*100) || 0).toFixed(2)}% Success
                                </span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Correct: {analysis?.difficultyWiseAnalysis.hard.correct}</span>
                                <span>Incorrect: {analysis?.difficultyWiseAnalysis.hard.incorrect}</span>
                            </div>
                            <Progress value={analysis?.difficultyWiseAnalysis.hard.correct/analysis?.difficultyWiseAnalysis.hard.total*100 || 0} className="h-2 mt-2 bg-gray-100" indicatorColor="bg-red-500" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default SectionD