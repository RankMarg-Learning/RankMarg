"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/common-ui"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@repo/common-ui"
import { SectioncQuestionTiming } from "@/types/typeTest"


const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds.toFixed(0)}s`;
  }
  return `${(seconds / 60).toFixed(1)} min`;
};

const chartConfig = {
  time: {
    label: "Time (minutes)",
  },
  physics: {
    label: "Physics",
    color: "hsl(var(--chart-1))",
  },
  chemistry: {
    label: "Chemistry",
    color: "hsl(var(--chart-2))",
  },
  mathematics: {
    label: "Mathematics",
    color: "hsl(var(--chart-3))",
  },
  biology: {
    label: "Biology",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function TimeSpendChart({data}:{data:SectioncQuestionTiming[]}) {

  const availableSubjects = React.useMemo(() => {
    const firstItem = data?.[0] || {};
    return Object.keys(firstItem).filter(key => 
      key !== 'question' && firstItem[key as keyof typeof firstItem] !== undefined
    ) as (keyof typeof chartConfig)[];
  }, [data]);


  const [activeSubject, setActiveSubject] = React.useState<keyof typeof chartConfig>(
     data?.[0] ? Object.keys(data[0])?.find(key => data[0][key] > 0) as keyof typeof chartConfig : 'physics'
  );

  const total = React.useMemo(
    () => availableSubjects.reduce((acc, subject) => {
      const subjectData = data?.filter(item => (item[subject] as number) > 0) || [];
      const totalTime = subjectData.reduce((sum, curr) => sum + (curr[subject] || 0), 0);
      const times = subjectData.map(item => item[subject] as number).filter(t => t > 0);
      return {
        ...acc,
        [subject]: {
          total: totalTime,
          count: subjectData.length,
          average: subjectData.length > 0 ? totalTime / subjectData.length : 0,
          max: times.length > 0 ? Math.max(...times) : 0,
          min: times.length > 0 ? Math.min(...times) : 0,
        }
      };
    }, {} as Record<string, { total: number; count: number; average: number; max: number; min: number }>),
    [data, availableSubjects]
  );

  
  const filteredData = React.useMemo(() => {
    if (!data || !activeSubject) return [];
    return data.filter(item => {
      const value = item[activeSubject] as number | undefined;
      return value !== undefined && value !== null && value > 0;
    });
  }, [data, activeSubject]);

  return (
    <Card className="rounded-md shadow-sm">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Question Time Analysis</CardTitle>
          <CardDescription>
            Time taken per question in {chartConfig[activeSubject]?.label || activeSubject}
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-0 border-t sm:border-t-0 sm:border-l">
          {availableSubjects.map((subject) => {
            const chart = subject as keyof typeof chartConfig
            const stats = total[chart];
            if (!stats || stats.count === 0 || stats.total === 0) return null;
            
            const isActive = activeSubject === chart;
            
            return (
              <button
                key={chart}
                data-active={isActive}
                className={`relative flex flex-col justify-center gap-1.5 px-6 py-5 text-left transition-all duration-200 border-l first:border-l-0 sm:first:border-l sm:border-l hover:bg-muted/30 ${
                  isActive 
                    ? 'bg-yellow-300/50 border-yellow-400/50 shadow-sm' 
                    : 'bg-background'
                } min-w-[140px] flex-1 sm:min-w-[160px]`}
                onClick={() => setActiveSubject(chart)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-semibold ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {chartConfig[chart]?.label}
                  </span>
                  {isActive && chartConfig[chart] && 'color' in chartConfig[chart] && (
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: (chartConfig[chart] as { color: string }).color }}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-bold leading-tight text-foreground">
                    {formatTime(stats.average)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Average time
                  </span>
                </div>
               
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <div className="overflow-x-auto">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] min-w-[800px]"
          >
            <BarChart
              accessibilityLayer
              data={filteredData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="question"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                content={({ payload, label, active }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  
                  const value = payload[0].value as number;
                  
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm bg-white">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Question
                          </span>
                          <span className="font-bold">
                            {label}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Subject
                          </span>
                          <span className="font-bold">
                            {chartConfig[activeSubject]?.label || activeSubject}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Time
                          </span>
                          <span className="font-bold">
                            {formatTime(value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar 
                dataKey={activeSubject} 
                fill={`var(--color-${activeSubject})`}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
