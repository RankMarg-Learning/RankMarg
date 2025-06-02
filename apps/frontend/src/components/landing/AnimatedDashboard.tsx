import React, { useEffect, useState } from 'react';
import { Brain,  Zap, Target } from 'lucide-react';
import ProgressTooltip from './ProgressTooltip';
import { Progress } from '../ui/progress';
import { Card, CardContent } from '../ui/card';
import { SubjectBackgroundColor, SubjectCardColor, SubjectTextColor } from '@/constant/SubjectColorCode';
import { SubjectIcons } from '@/constant/SubjectColorCode';

const AnimatedDashboard = () => {
    const [activeSubject, setActiveSubject] = useState(0);
    const [progressVisible, setProgressVisible] = useState(false);

    const subjects = [
        {
            name: 'Physics',
            key: 'physics',
            progress: 85,
            improvement: 15
        },
        {
            name: 'Chemistry',
            key: 'chemistry',
            progress: 78,
            improvement: 12
        },
        {
            name: 'Mathematics',
            key: 'mathematics',
            progress: 92,
            improvement: 8
        },
    ];

    useEffect(() => {
        const timer = setTimeout(() => setProgressVisible(true), 500);
        const subjectTimer = setInterval(() => {
            setActiveSubject(prev => (prev + 1) % subjects.length);
        }, 3000);

        return () => {
            clearTimeout(timer);
            clearInterval(subjectTimer);
        };
    }, []);

    return (
        <Card className="relative bg-card/90 backdrop-blur-sm shadow-2xl max-w-lg mx-auto transform  transition-transform duration-300">
            <CardContent className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">Smart Dashboard</h3>
                            <p className="text-sm text-muted-foreground">Intelligent Learning</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        Live
                    </div>
                </div>

                {/* Subject Cards */}
                <div className="space-y-4 mb-6">
                    {subjects.map((subject, index) => {
                        const IconComponent = SubjectIcons[subject.key] || SubjectIcons.default;
                        const cardColor = SubjectCardColor[subject.key] || SubjectCardColor.default;
                        const textColor = SubjectTextColor[subject.key] || SubjectTextColor.default;
                        const bgColor = SubjectBackgroundColor[subject.key] || SubjectBackgroundColor.default;

                        return (
                            <ProgressTooltip
                                key={subject.name}
                                subject={subject.name}
                                progress={subject.progress}
                                improvement={subject.improvement}
                            >
                                <Card
                                    className={`p-4 transition-all duration-300 cursor-pointer${cardColor} ${cardColor} ${activeSubject === index
                                            ? ` shadow-lg `
                                            : ` hover:shadow-md`
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center`}>
                                                <IconComponent className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="font-semibold text-foreground">{subject.name}</span>
                                        </div>
                                        {subject.progress}%
                                    </div>

                                    <Progress
                                        value={progressVisible ? subject.progress : 0}
                                        className="mb-2 h-2"
                                        indicatorColor={bgColor}
                                    />

                                    {activeSubject === index && (
                                        <div className={`mt-3 flex items-center gap-2 text-sm ${textColor} animate-pulse`}>
                                            <Zap className="w-4 h-4" />
                                            <span>Smart Practice Active</span>
                                        </div>
                                    )}
                                </Card>
                            </ProgressTooltip>
                        );
                    })}
                </div>

                {/* Smart Suggestions */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-5 h-5 text-primary-600" />
                            <span className="font-semibold text-foreground">AI Suggestion</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Focus on "Electromagnetic Waves" - 73% chance of exam appearance
                        </p>
                    </CardContent>
                </Card>

                {/* Floating indicators */}
                <div className="absolute -top-2 -right-2">
                    <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse"></div>
                </div>
                <div className="absolute -bottom-2 -left-2">
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-ping"></div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AnimatedDashboard;