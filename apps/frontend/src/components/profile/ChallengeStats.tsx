"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"

// Sample data to match the component requirements
const initialParams = [
  { updatedAt: "2024-10-01T10:00:00Z", rankChanges: 5, attemptScore: [1, 1, 0, 1] },
  { updatedAt: "2024-10-02T12:30:00Z", rankChanges: -3, attemptScore: [1, 0, 0, 1] },
  { updatedAt: "2024-10-03T14:15:00Z", rankChanges: 4, attemptScore: [1, 1, 1, 0] },
  { updatedAt: "2024-10-04T08:45:00Z", rankChanges: -2, attemptScore: [1, 0, 1, 0] },
  { updatedAt: "2024-10-05T09:30:00Z", rankChanges: 6, attemptScore: [1, 1, 1, 1] },
  { updatedAt: "2024-10-06T16:20:00Z", rankChanges: 2, attemptScore: [1, 0, 1, 1] },
  { updatedAt: "2024-10-07T18:10:00Z", rankChanges: -1, attemptScore: [1, 1, 0, 0] },
  { updatedAt: "2024-10-08T11:00:00Z", rankChanges: 3, attemptScore: [1, 1, 1, 1] },
  { updatedAt: "2024-10-09T13:25:00Z", rankChanges: -4, attemptScore: [0, 1, 0, 0] },
  { updatedAt: "2024-10-10T15:50:00Z", rankChanges: 1, attemptScore: [1, 1, 0, 1] },
  { updatedAt: "2024-10-11T10:05:00Z", rankChanges: 15, attemptScore: [1, 1, 1, 1] },
  { updatedAt: "2024-10-12T17:45:00Z", rankChanges: -2, attemptScore: [1, 1, 0, 0] },
  { updatedAt: "2024-10-13T14:35:00Z", rankChanges: 5, attemptScore: [1, 1, 1, 0] },
  { updatedAt: "2024-10-14T08:15:00Z", rankChanges: -3, attemptScore: [1, 0, 1, 1] },
  { updatedAt: "2024-10-15T18:30:00Z", rankChanges: 4, attemptScore: [1, 1, 1, 1] },
  { updatedAt: "2024-10-16T16:00:00Z", rankChanges: -10, attemptScore: [1, 0, 1, 0] },
  { updatedAt: "2024-10-17T09:40:00Z", rankChanges: 6, attemptScore: [1, 1, 1, 0] },
  { updatedAt: "2024-10-18T07:55:00Z", rankChanges: -2, attemptScore: [0, 1, 1, 0] },
  { updatedAt: "2024-10-19T20:20:00Z", rankChanges: 30, attemptScore: [1, 1, 1, 1] },
  { updatedAt: "2024-10-20T13:10:00Z", rankChanges: -4, attemptScore: [1, 0, 0, 1] },
];

// Utility function to transform params to chartData
const transformParamsToChartData = (params) => {
  let cumulativeRank = 0;
  return params.map((item) => {
    cumulativeRank += item.rankChanges;
    const correctAttempts = item.attemptScore.filter((score) => score === 1).length;
    return {
      date: item.updatedAt,
      rank: cumulativeRank,
      correctAttempts: `${correctAttempts}/${item.attemptScore.length}`,
    };
  });
};

const initialChartData = transformParamsToChartData(initialParams);

export function ChallengeStats() {
  const [chartData] = React.useState(initialChartData);

  // Get the date 30 days ago from today
  const lastMonthDate = new Date();
  lastMonthDate.setDate(lastMonthDate.getDate() - 30);

  
  const filteredData = chartData.filter((data) => {
    const date = new Date(data.date);
    return date >= lastMonthDate;
  });


  const rank = filteredData[filteredData.length - 1].rank;
 
  
  

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rating</CardTitle>
        <CardDescription
        className="md:text-4xl text-2xl font-bold"
        >{rank}</CardDescription>
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
