"use client"
import React from 'react'
import { Card, CardContent, CardFooter } from '@repo/common-ui';
import { ArrowRight, Crown, RotateCcw, History } from 'lucide-react';
import { Button } from '@repo/common-ui';
import { Badge } from '@repo/common-ui';
import { Progress } from '@repo/common-ui';
import { SubjectBackgroundColor, SubjectCardColor } from '@/constant/SubjectColorCode';
import { PracticeSession } from '@/types/dashboard.types';
import { useRouter } from 'next/navigation';



const TodaySession = ({ sessions }: { sessions: PracticeSession[] }) => {

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sessions?.map((session) => (
                <OngoingSessionCard
                    session={session}
                    isPremiumLocked={false}
                />
            ))}
        </div>
    )
}

export default TodaySession

interface OngoingSessionProps {
    session: PracticeSession
    isPremiumLocked: boolean;
}

function OngoingSessionCard({ session, isPremiumLocked }: OngoingSessionProps) {
    const router = useRouter();
    const handleStart = () => {
        router.push(`/ai-session/${session.id}`);
    };


    return (
        <Card className={`overflow-hidden relative ${SubjectCardColor[session.title.toLowerCase() as keyof typeof SubjectCardColor] || SubjectCardColor.default}`}>
            {isPremiumLocked && (
                <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-4">
                    <Crown className="h-8 w-8 text-amber-400 mb-2" />
                    <h3 className="text-white font-medium text-lg mb-1">Premium Feature</h3>
                    <p className="text-gray-200 text-sm mb-3 text-center">
                        Upgrade to premium to continue your practice sessions
                    </p>
                    <Button className="bg-amber-500 hover:bg-amber-600">
                        Upgrade Now
                    </Button>
                </div>
            )}

            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium ">{session?.title}</h3>
                    <Badge variant="outline" className="text-xs truncate">
                        {session?.questionsAttempted}/{session?.totalQuestions} Questions
                    </Badge>
                </div>


                <div className="space-y-3 mb-4">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{Math.round((session?.questionsAttempted / session?.totalQuestions)*100)}%</span>
                        </div>
                        <Progress value={(session?.questionsAttempted / session?.totalQuestions)*100} className="h-1.5 " indicatorColor={` ${SubjectBackgroundColor[session?.title.toLowerCase() as keyof typeof SubjectBackgroundColor] || SubjectBackgroundColor.default}`} />
                    </div>


                </div>
                <div>
                    <div className="text-sm font-medium mb-2">Key Topics:</div>
                    <div className="flex flex-wrap gap-1">
                        {session?.keySubtopics.map((subtopic, i) => (
                            <Badge key={i} variant="outline" className="bg-white truncate">
                                {subtopic}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-0 px-4 pb-4">
                <Button onClick={handleStart} className="gap-1" variant='outline'>
                    {!session?.lastAttempt ? <RotateCcw className="h-4 w-4" /> : <History className="h-4 w-4" />}
                    {!session?.lastAttempt ? "Start Session" : "Resume Session"}
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}


