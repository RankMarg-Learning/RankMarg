"use client"

import { Info, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
    { type: "Conceptual", percentage: 45 },
    { type: "Silly", percentage: 30 },
    { type: "Calculation", percentage: 20 },
    { type: "Misreading", percentage: 5 },
]

const chartConfig = {
  percentage: {
    label: "percentage",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

const AnalyticsDashboard = () => {
  return (
    <div className="  p-4 " id="el-2jtf5hfu">
      <div className="flex items-center justify-between mb-6" id="el-c2o67hk0">
        <h3 className="text-lg font-semibold text-gray-800" id="el-uamtbmx6">Mistake Type Distribution
        </h3>
      </div>
    <Card className="border-0 shadow-none">
      <CardHeader className="hidden">
        <CardTitle>Bar Chart</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px] w-full ">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="type"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel className="bg-white"  />}
            />
            <Bar dataKey="percentage" fill="var(--color-percentage)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      
    </Card>
    <div className="bg-indigo-50  rounded-md p-3 flex gap-1" id="el-bkryjkfh">
        <Info className="h-4 w-4 text-blue-500" />

        <div className="text-xs text-indigo-800 dark:text-indigo-200" id="el-y9l6an94">
          <span className="font-medium" id="el-q3wxpw80">Unit Circle Interactive Practice</span>
          <span className="mx-2" id="el-q9l5zb7i">•</span>
          <span id="el-7m0e65u4">High effectiveness time slot</span>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard