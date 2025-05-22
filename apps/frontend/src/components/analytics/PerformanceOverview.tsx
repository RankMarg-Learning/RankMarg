import { ArrowUpRight, Clock, ShieldAlert, Target, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { AnalyticsMetricsProps } from '@/types';

export function PerformanceOverview({ metrics }: { metrics: AnalyticsMetricsProps }) {
    return (
        <section className="dashboard-section" id="performance">
            <div className="flex items-center justify-between mb-4">
                <h2 className="section-title flex items-center gap-2">
                    <span className="text-lg font-semibold">Performance Overview</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger><ShieldAlert className='w-3 h-3' /></TooltipTrigger>
                            <TooltipContent className='bg-gray-50' side='bottom' sideOffset={15}>
                                <p>Weekly performance insights coming this weekend. Keep practicing!</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Questions Solved"
                    value={metrics.TOTAL_QUESTIONS.value}
                    change={metrics.TOTAL_QUESTIONS.delta}
                    insight={metrics.TOTAL_QUESTIONS.suggestion}
                    trend={getTrend(metrics.TOTAL_QUESTIONS.delta)}
                    icon={Zap}
                />

                <StatCard
                    title="Correct Attempts"
                    value={metrics.CORRECT_ATTEMPTS.value}
                    change={metrics.CORRECT_ATTEMPTS.delta}
                    insight={metrics.CORRECT_ATTEMPTS.suggestion}
                    trend={getTrend(metrics.CORRECT_ATTEMPTS.delta)}
                    icon={Target}
                />

                <StatCard
                    title="Test Score"
                    value={metrics.TEST_SCORE.value}
                    change={metrics.TEST_SCORE.delta}
                    insight={metrics.TEST_SCORE.suggestion}
                    trend={getTrend(metrics.TEST_SCORE.delta)}
                    icon={Clock}
                />

                <StatCard
                    title="Mastery Level"
                    value={metrics.MASTERY_LEVEL.value}
                    change={metrics.MASTERY_LEVEL.delta}
                    insight={metrics.MASTERY_LEVEL.suggestion}
                    trend={getTrend(metrics.MASTERY_LEVEL.delta)}
                    icon={ArrowUpRight}
                />
            </div>
        </section>
    );
}

function getTrend(delta: string): 'up' | 'down' | 'neutral' {
    if (delta.startsWith('+')) return 'up';
    if (delta.startsWith('-')) return 'down';
    return 'neutral';
}

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    insight?: string;
    trend: 'up' | 'down' | 'neutral';
    icon: React.ElementType;
}

function StatCard({ title, value, change, insight, trend, icon: Icon }: StatCardProps) {
    return (
        <Card className="overflow-hidden glass-card card-hover animate-scale-in">
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{title}</span>
                    <Icon size={18} className="text-muted-foreground" />
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-bold">{value}</span>
                    <span className={
                        trend === 'up'
                            ? 'text-emerald-500 text-xs font-medium'
                            : trend === 'down'
                                ? 'text-red-500 text-xs font-medium'
                                : 'text-gray-500 text-xs font-medium'
                    }>
                        {change}
                    </span>
                </div>
                {insight && (
                    <p className="text-xs text-muted-foreground mb-3">{insight}</p>
                )}
            </CardContent>
        </Card>
    );
}
