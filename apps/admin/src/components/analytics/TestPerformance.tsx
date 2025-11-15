"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/common-ui"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/common-ui"
import { Info } from "lucide-react"
import { RecentTestScoresProps } from "@/types"

type Props = {
  txScore: RecentTestScoresProps[],
  recommendation: string
}

const chartConfig = {
  accuracy: {
    label: "Accuracy (%)",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function TestPerformance({ txScore ,recommendation}: Props) {

  const chartData = txScore?.map((test, index) => ({
    test: formatDate(test.date),
    accuracy: parseFloat(test.accuracy.toFixed(1)), 
  }))

  return (
    <div className="p-4" id="test-performance">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Test Performance
        </h3>
      </div>

      <Card className="border-0 shadow-none">
        <CardHeader className="hidden">
          <CardTitle>Line Chart - Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart
              data={chartData}
              margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="test"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="accuracy"
                type="monotone"
                stroke="var(--color-accuracy)"
                strokeWidth={2}
                dot={{ fill: "var(--color-accuracy)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="bg-indigo-50 rounded-md p-3 flex gap-1 mt-4">
        <Info className="h-4 w-4 text-blue-500" />
        <div className="text-xs text-indigo-800 dark:text-indigo-200">
          <span className="font-medium">Tip:</span> {recommendation}
        </div>
      </div>
    </div>
  )
}
