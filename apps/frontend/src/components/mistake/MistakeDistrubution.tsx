"use client"

import { Info } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { AnalyticsDashboardProps } from "@/types/mistake.type"

const chartConfig = {
  percentage: {
    label: "percentage",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig



const AnalyticsDashboard = ({ dist }: {dist:AnalyticsDashboardProps}) => {

  const chartData = dist?.distribution?.map((item) => ({
    ...item,
    type: item.type.charAt(0).toUpperCase() + item.type.slice(1).toLowerCase(),
  }))

  return (
    <Card className="border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-3" id="el-2jtf5hfu">
        <div className="flex items-center justify-between mb-3" id="el-c2o67hk0">
          <h3 className="text-base font-semibold text-gray-800" id="el-uamtbmx6">
            Mistake Type Distribution
          </h3>
        </div>

        <div className="mb-3">
          <ChartContainer config={chartConfig} className="h-[160px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="type"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                fontSize={12}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel className="bg-white text-xs" />}
              />
              <Bar
                dataKey="percentage"
                fill="var(--color-percentage)"
                radius={6}
              />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="bg-primary-50 rounded-md p-2 flex gap-2" id="el-bkryjkfh">
          <Info className="h-3 w-3 text-primary-700 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-primary-900 leading-relaxed" id="el-y9l6an94">
            <span className="font-medium" id="el-q3wxpw80">
              {dist?.suggest || "No suggestions available."}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default AnalyticsDashboard
