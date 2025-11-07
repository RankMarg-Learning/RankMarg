import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
    { name: "Correct", value: 45, fill: "var(--color-correct)" },
    { name: "Incorrect", value: 20, fill: "var(--color-incorrect)" },
    { name: "Skipped", value: 22, fill: "var(--color-skipped)" },
]

const chartConfig = {
    value: {
        label: "Questions",
    },
    correct: {
        label: "Correct",
        color: "hsl(var(--chart-2))",
    },
    incorrect: {
        label: "Incorrect",
        color: "hsl(var(--chart-1))",
    },
    skipped: {
        label: "Skipped",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig

export default function CompactPerformanceChart() {
    const totalQuestions = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.value, 0)
    }, [])

    const correctPercentage = Math.round((chartData[0].value / totalQuestions) * 100)
    const incorrectPercentage = Math.round((chartData[1].value / totalQuestions) * 100)

    return (
        <div className="p-4  ">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                    Attempt Distribution
                </h3>
            </div>

            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[180px]"
            >
                <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel className="bg-white" indicator="line"/>}
                    />
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={75}
                        strokeWidth={2}
                        paddingAngle={2}
                    >
                        <Label
                            content={({ viewBox }) => {
                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                    return (
                                        <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                className="fill-foreground text-2xl font-bold"
                                            >
                                                {totalQuestions}
                                            </tspan>
                                            <tspan
                                                x={viewBox.cx}
                                                y={(viewBox.cy || 0) + 16}
                                                className="fill-muted-foreground text-xs"
                                            >
                                                Total
                                            </tspan>
                                        </text>
                                    )
                                }
                            }}
                        />
                    </Pie>
                </PieChart>
            </ChartContainer>

            <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
                <div className="flex flex-col items-center">
                    <span className="text-muted-foreground">Correct</span>
                    <span className="text-sm font-bold text-green-600">
                        {correctPercentage}%
                    </span>

                </div>
                <div className="flex flex-col items-center">
                    <span className="text-muted-foreground">Incorrect</span>
                    <span className="text-sm font-bold text-red-600">
                        {incorrectPercentage}%
                    </span>

                </div>
                <div className="flex flex-col items-center">
                    <span className="text-muted-foreground">Skipped</span>
                    <span className="text-sm font-bold text-gray-600">
                        {Math.round((chartData[2].value / totalQuestions) * 100)}%
                    </span>

                </div>
            </div>
        </div>
    )
}