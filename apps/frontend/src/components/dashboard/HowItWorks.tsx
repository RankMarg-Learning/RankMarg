"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@repo/common-ui'
import { Badge } from '@repo/common-ui'
import { Button } from '@repo/common-ui'
import {
    BrainCircuit,
    Target,
    TrendingUp,
    Calendar,
    Lightbulb,
    BookOpen,
    BarChart3,
    ChevronDown,
    ChevronUp
} from 'lucide-react'

const HowItWorks = () => {
    const [isExpanded, setIsExpanded] = useState(false)

    const features = [
        {
            icon: BrainCircuit,
            title: "Adaptive Learning System",
            description: "AI-powered system adapts to your performance in real-time",
            bgColor: "bg-purple-50",
            iconColor: "text-purple-600",
            borderColor: "border-purple-100"
        },
        {
            icon: Target,
            title: "Performance-Based",
            description: "Question difficulty adjusts based on your accuracy",
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
            borderColor: "border-blue-100"
        },
        {
            icon: Calendar,
            title: "Daily Sessions",
            description: "Fresh personalized sessions generated every day",
            bgColor: "bg-amber-50",
            iconColor: "text-amber-600",
            borderColor: "border-amber-100"
        }
    ]

    const sessionBreakdown = [
        {
            percentage: "60-70%",
            label: "Current Topics",
            description: "Focus on what you're studying now",
            icon: Lightbulb,
            bgColor: "bg-green-50",
            textColor: "text-green-700",
            barColor: "bg-green-500"
        },
        {
            percentage: "30-40%",
            label: "Weak & Revision",
            description: "Strengthen and reinforce past learning",
            icon: TrendingUp,
            bgColor: "bg-orange-50",
            textColor: "text-orange-700",
            barColor: "bg-orange-500"
        }
    ]

    return (
        <Card className="border border-primary-100 bg-white shadow-sm m-2 md:mb-2 mb-20">
            <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {/* Header - Always Visible */}
                <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="p-1.5 sm:p-2 bg-primary-50 rounded-lg flex-shrink-0">
                            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-medium text-sm sm:text-base text-primary-800 truncate">
                                How Smart Sessions Work
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                                Learn about our adaptive practice system
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0 h-7 sm:h-8 px-2 text-xs sm:text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                <span className="hidden sm:inline">Hide</span>
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                <span className="hidden sm:inline">Learn More</span>
                            </>
                        )}
                    </Button>
                </div>

                {/* Expandable Content */}
                {isExpanded && (
                    <div className="space-y-3 sm:space-y-4 pt-2 border-t border-gray-100">
                        {/* Core Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`${feature.bgColor} border ${feature.borderColor} rounded-lg p-3 sm:p-3.5`}
                                >
                                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center mb-2`}>
                                        <feature.icon className={`h-4 w-4 sm:h-4.5 sm:w-4.5 ${feature.iconColor}`} />
                                    </div>
                                    <h4 className={`font-medium text-xs sm:text-sm mb-0.5 sm:mb-1 ${feature.iconColor}`}>
                                        {feature.title}
                                    </h4>
                                    <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Session Breakdown */}
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-3.5">
                                <BarChart3 className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-primary-600" />
                                <h4 className="font-medium text-xs sm:text-sm text-gray-900">
                                    Daily Session Composition
                                </h4>
                            </div>

                            <div className="space-y-2.5 sm:space-y-3">
                                {sessionBreakdown.map((item, index) => (
                                    <div key={index} className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${item.bgColor} border ${item.bgColor === 'bg-green-50' ? 'border-green-100' : 'border-orange-100'} flex items-center justify-center flex-shrink-0`}>
                                                <item.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${item.textColor}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-sm sm:text-base text-gray-900">
                                                        {item.percentage}
                                                    </span>
                                                    <span className="font-medium text-xs sm:text-sm text-gray-700">
                                                        {item.label}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-white rounded-full h-1.5 sm:h-2 border border-gray-200">
                                            <div
                                                className={`h-full ${item.barColor} rounded-full transition-all duration-700`}
                                                style={{ width: item.percentage.split('-')[0] }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pro Tip */}
                            <div className="mt-3 sm:mt-3.5 pt-3 sm:pt-3.5 border-t border-gray-200">
                                <div className="flex items-start gap-2">
                                    <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200 text-[10px] sm:text-xs mt-0.5 flex-shrink-0">
                                        💡 Tip
                                    </Badge>
                                    <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
                                        Weak and revision topics appear on <span className="font-medium text-gray-900">alternate days</span> for balanced learning.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default HowItWorks
