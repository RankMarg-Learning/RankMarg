"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import {  UserChallengeStats } from "@/types"

type ChallengeStatsProps = {
  stats: UserChallengeStats;  // Use the UserChallengeDetails type here
};

// Utility function to transform params to chartData
const transformParamsToChartData = (params) => {
  let cumulativeRank = 50;
  return params.map((item) => {
    cumulativeRank += item.userScore;
    const correctAttempts = item.attemptScore.filter((score) => score === 1).length;
    return {
      
      date: item.createdAt,
      rank: cumulativeRank,
      correctAttempts: `${correctAttempts}/${item.attemptScore.length}`,
    };
  });
};



export function ChallengeStats({stats}:ChallengeStatsProps) {
  const initialChartData = transformParamsToChartData(stats.recentChallenges);
  const [chartData] = React.useState(initialChartData);

  // Get the date 30 days ago from today
  const lastMonthDate = new Date();
  lastMonthDate.setDate(lastMonthDate.getDate() - 30);

  
  const filteredData = chartData.filter((data) => {
    const date = new Date(data.date);
    return date >= lastMonthDate;
  });


  
 
  
  

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rating</CardTitle>
        <CardDescription
        className="md:text-4xl text-2xl font-bold text-yellow-500"
        >{stats.rank}</CardDescription>
      </CardHeader>
      <CardContent >
        <ChartContainer
          config={{
            views: { label: "Rating" },
            rank: { label: "Cumulative Rating", color: "orange" },
          }}
          className="aspect-auto h-[180px] w-full"
        >
          <LineChart
            data={filteredData}
            margin={{ left: 0, right: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis />
            <Tooltip
              content={({ payload, label }) => {
                if (!payload || !payload.length) return null;
                const { rank, correctAttempts } = payload[0].payload;
                return (
                  <div className="p-2 bg-white shadow-md">
                    <div><strong>{new Date(label).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong></div>
                    <div>Rating: {rank}</div>
                    <div>Correct Attempts: {correctAttempts}</div>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="rank"
              stroke="orange"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
