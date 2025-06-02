"use client"
import React, { useMemo } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Badge } from '../ui/badge';
import { CheckCircle, Target, BookOpen, Award, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useQuery } from '@tanstack/react-query';
import { getSubjectMastery } from '@/services/mastery.service';
import { SubjectMasteryResponseProps } from '@/types';
import { SubjectBackgroundColor } from '@/constant/SubjectColorCode';
import MasterySubjectSkeleton from '../skeleton/subject.mastery.skeleton';

const getMasteryColor = (mastery) => {
    if (mastery >= 85) return {
        badge: "text-emerald-700 bg-emerald-50 border-emerald-200 font-semibold",
        bg: "bg-emerald-500",
        progress: "bg-emerald-500"
    };
    if (mastery >= 70) return {
        badge: "text-blue-700 bg-blue-50 border-blue-200 font-semibold",
        bg: "bg-blue-500",
        progress: "bg-blue-500"
    };
    if (mastery >= 60) return {
        badge: "text-amber-700 bg-amber-50 border-amber-200 font-semibold",
        bg: "bg-amber-500",
        progress: "bg-amber-500"
    };
    if (mastery >= 40) return {
        badge: "text-orange-700 bg-orange-50 border-orange-200 font-semibold",
        bg: "bg-orange-500",
        progress: "bg-orange-500"
    };
    return {
        badge: "text-red-700 bg-red-50 border-red-200 font-semibold",
        bg: "bg-red-500",
        progress: "bg-red-500"
    };
};

const getMasteryLabel = (mastery) => {
    if (mastery >= 85) return "Excellence";
    if (mastery >= 70) return "Good Grasp";
    if (mastery >= 60) return "On Track";
    if (mastery >= 40) return "Building Skills";
    return "Focus Area";
};

const getMasteryMessage = (mastery) => {
    if (mastery >= 85) return "Keep it up! You're mastering this.";
    if (mastery >= 70) return "Good progress! Continue practicing.";
    if (mastery >= 60) return "You're on the right track!";
    if (mastery >= 40) return "More practice will strengthen this.";
    return "Focus here to improve your rank.";
};

const getMasteryIcon = (mastery) => {
    if (mastery >= 85) return <Award className="h-4 w-4" />;
    if (mastery >= 70) return <CheckCircle className="h-4 w-4" />;
    if (mastery >= 60) return <TrendingUp className="h-4 w-4" />;
    if (mastery >= 40) return <BookOpen className="h-4 w-4" />;
    return <Target className="h-4 w-4" />;
};

const MasterySubjectPage = ({ subjectId }) => {
    const { data: subjectMastery, isLoading } = useQuery<{data:SubjectMasteryResponseProps,success:true,message:string}>({
        queryKey: ['subjectMastery', subjectId],
        queryFn: () => getSubjectMastery(subjectId),
        enabled: !!subjectId,
        staleTime: 5 * 60 * 1000, 
    });

    console.log(subjectMastery)
    const { overallMastery, topics,  indicatorColorClass, masteryColors } = useMemo(() => {
        const overallMastery = subjectMastery?.data?.overallMastery || 0;
        const topics = subjectMastery?.data?.topics || [];
        const subjectName = subjectMastery?.data?.subject?.name?.toLowerCase() ?? 'default';
        const indicatorColorClass = SubjectBackgroundColor[subjectName] ?? SubjectBackgroundColor.default;
        const masteryColors = getMasteryColor(overallMastery);
        
        return { overallMastery, topics, subjectName, indicatorColorClass, masteryColors };
    }, [subjectMastery]);

    if (isLoading) return <MasterySubjectSkeleton/>

    const renderSubjectHeader = () => (
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <div className="flex flex-row justify-between md:items-start items-end gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">{subjectMastery?.data?.subject?.name}</h2>
                    <p className="text-sm text-gray-500">Mastery Breakdown</p>
                </div>

                <div className="flex flex-col items-end">
                    <Badge className={`text-xs px-2 py-1 rounded-full ${masteryColors.badge}`}>
                        {overallMastery}% - {getMasteryLabel(overallMastery)}
                    </Badge>
                    <span className="text-xs mt-1 text-gray-500">{getMasteryMessage(overallMastery)}</span>
                </div>
            </div>

            <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                    <span>Overall Progress</span>
                    <span className="font-medium">{overallMastery}%</span>
                </div>
                <Progress
                    value={overallMastery}
                    className="h-2 rounded-full"
                    indicatorColor={indicatorColorClass}
                >
                    <div
                        className={`h-full rounded-full ${masteryColors.progress}`}
                        style={{ width: `${overallMastery}%` }}
                    />
                </Progress>
            </div>
        </div>
    );

    const renderStudyTips = () => (
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Study Tips</h3>
            <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Focus on low mastery areas first for maximum rank improvement</span>
                </li>
                <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <span>Regular practice of topics above 70% will help maintain your advantage</span>
                </li>
                <li className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-amber-500 mt-0.5" />
                    <span>Revisit topics every 7-10 days to strengthen memory retention</span>
                </li>
            </ul>
        </div>
    );

    return (
        <div className="space-y-6 ">
            {renderSubjectHeader()}

            {/* Topics accordion */}
            <Accordion type="single" collapsible className="w-full space-y-3">
                {topics.map((topic, topicIdx) => {
                    const topicColors = getMasteryColor(topic.mastery);

                    return (
                        <AccordionItem
                            key={topicIdx}
                            value={`topic-${topicIdx}`}
                            className="border bg-white rounded-lg shadow-sm overflow-hidden"
                        >
                            <AccordionTrigger className="px-4 py-4 hover:no-underline group">
                                <div className="flex items-center justify-between w-full pr-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`md:w-10 md:h-10 w-8 h-8 rounded-full flex items-center justify-center ${topicColors.bg} text-white transition-all`}>
                                        {topic.mastery === 0 ? "00" : topic.mastery < 10 ? `0${Math.round(topic.mastery)}` : Math.round(topic.mastery)}
                                        </div>
                                        <div className="text-left">
                                            <span className="font-semibold text-gray-800 truncate max-w-[160px] block">{topic.name}</span>
                                            <p className="text-xs text-gray-500 hidden sm:block">{getMasteryMessage(topic.mastery)}</p>
                                        </div>
                                    </div>
                                    <Badge className={`${topicColors.badge} whitespace-nowrap text-xs `}>
                                        {getMasteryLabel(topic.mastery)}
                                    </Badge>
                                </div>
                            </AccordionTrigger>

                            <AccordionContent className="px-0 pt-2 pb-0 transition-all data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                                <div className="bg-gray-50 px-4 py-2 text-sm font-medium border-b">
                                    Subtopics Performance
                                </div>
                                <div className="divide-y">
                                    {topic.subtopics.map((subtopic, subtopicIdx) => {
                                        const subtopicColors = getMasteryColor(subtopic.mastery);

                                        return (
                                            <div key={subtopicIdx} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-${subtopicColors.bg.replace('bg-', '')}`}>
                                                            {getMasteryIcon(subtopic.mastery)}
                                                        </span>
                                                        <span className="font-medium text-gray-700">{subtopic.name}</span>
                                                    </div>
                                                    <Badge className={`${subtopicColors.badge} self-start sm:self-auto`}>
                                                        {subtopic.mastery}%
                                                    </Badge>
                                                </div>

                                                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`absolute left-0 top-0 h-full ${subtopicColors.progress} transition-all duration-500`}
                                                        style={{ width: `${subtopic.mastery}%` }}
                                                    />
                                                </div>

                                                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 mt-2">
                                                    {subtopic.lastPracticed && (
                                                        <span>Last practiced: {subtopic.lastPracticed}</span>
                                                    )}
                                                    <span className="text-xs italic">{getMasteryMessage(subtopic.mastery)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="bg-gray-50 px-4 py-3 flex justify-end border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`border-${topicColors.bg.replace('bg-', '')} text-${topicColors.bg.replace('bg-', '')} hover:bg-${topicColors.bg.replace('bg-', '')}/10`}
                                    >
                                        Practice this topic
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>

            {renderStudyTips()}
        </div>
    );
};

export default MasterySubjectPage;