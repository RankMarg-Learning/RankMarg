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
    () => availableSubjects.reduce((acc, subject) => ({
      ...acc,
      [subject]: data?.reduce((sum, curr) => sum + (curr[subject] || 0), 0) as number,
    }), {} as Record<string, number>),
    [data, availableSubjects]
  );

  return (
    <Card className="rounded-md shadow-sm">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Question Time Analysis</CardTitle>
          <CardDescription>
            Time taken per question in each subject
          </CardDescription>
        </div>
        <div className="flex flex-wrap ">
          {availableSubjects.map((subject) => {
            const chart = subject as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeSubject === chart}
                className={`relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-yellow-300/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6 ${total[chart] === 0 ? 'hidden' : ''}`}
                onClick={() => setActiveSubject(chart)}
              >
                <span className="text-sm font-semibold text-muted-foreground">
                  {chartConfig[chart]?.label}
                </span>
                <span className="text-base font-bold leading-none ">
                  {`${(((total[chart] as number)/60) / (data?.length || 1)).toFixed(1)} min`}
                </span>
                <span className="text-xs text-muted-foreground">
                  avg. time
                </span>
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
              data={data}
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
                content={({ payload, label }) => (
                  <div className="rounded-lg border bg-background p-2 shadow-sm bg-white">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Question
                        </span>
                        <span className="font-bold">
                          {`${label}`}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Time
                        </span>
                        <span className="font-bold">
                          {((payload?.[0]?.value as number)/60).toFixed(1)} minutes
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              />
              <Bar dataKey={activeSubject} fill={`var(--color-${activeSubject})`} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
