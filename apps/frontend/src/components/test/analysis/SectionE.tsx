import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react'
import React from 'react'
import { AnalysisSectionE } from '@/types/typeTest'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const SectionE = ({analysis}:{analysis:AnalysisSectionE[]}) => {

    const getStatusDisplay = (status: string) => {
        switch (status) {
            case "correct":
                return (
                    <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Correct</span>
                    </div>
                );
            case "incorrect":
                return (
                    <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span>Incorrect</span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-2 text-gray-600">
                        <MinusCircle className="w-4 h-4" />
                        <span>Unattempted</span>
                    </div>
                );
        }
    }

    return (
        <Card className="rounded-md">
            <CardHeader>
                <h2 className="text-xl font-semibold">Question Analysis</h2>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>QUESTION</TableHead>
                            <TableHead>SUBJECT</TableHead>
                            <TableHead>TOPIC</TableHead>
                            <TableHead>DIFFICULTY</TableHead>
                            <TableHead>STATUS</TableHead>
                            <TableHead>TIME TAKEN</TableHead>
                            <TableHead>ACTION</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            analysis?.map((question,index)=>(
                                <TableRow key={index}>
                                    <TableCell>{`Q${index+1}`}</TableCell>
                                    <TableCell>{question?.subject}</TableCell>
                                    <TableCell>{question?.topic}</TableCell>
                                    <TableCell>{question?.difficulty}</TableCell>
                                    <TableCell>{getStatusDisplay(question?.status)}</TableCell>
                                    <TableCell>{(question?.timeTaken/60).toFixed(1)} min</TableCell>
                                    <TableCell>
                                        <Link href={`/question/${question?.slug}`} target="_blank">
                                        <Button variant="outline">
                                            View
                                        </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                               
                </Table>
            </CardContent>
        </Card>
    )
}

export default SectionE