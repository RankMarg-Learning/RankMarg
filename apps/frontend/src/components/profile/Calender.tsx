"use client";
import { Card } from "@/components/ui/card";
import React from "react";
// import CalendarHeatmap from "react-calendar-heatmap";
import Heatmap from "./heatmap/Heatmap";
import { Separator } from "@/components/ui/separator";

const attempts = [

  {
    date: "2021-10-15",
    count: 1,
  },
  {
    date: "2021-10-16",
    count: 2,
  },
  {
    date: "2021-10-17",
    count: 3,
  },
  {
    date: "2021-10-18",
    count: 4,
  },
  {
    date: "2021-10-19",
    count: 5,
  },
  {
    date: "2021-10-20",
    count: 6,
  },
  {
    date: "2021-10-21",
    count: 7,
  },
  {
    date: "2021-10-22",
    count: 8,
  },
  {
    date: "2021-10-23",
    count: 9,
  },
  {
    date: "2021-10-24",
    count: 10,
  },
  {
    date: "2021-10-25",
    count: 11,
  },
  {
    date: "2021-10-26",
    count: 12,
  },
  {
    date: "2021-10-27",
    count: 13,
  },
  {
    date: "2021-10-28",
    count: 14,
  },
  {
    date: "2021-10-29",
    count: 15,
  },
  {
    date: "2021-10-30",
    count: 16,
  },
  {
    date: "2021-10-31",
    count: 17,
  },
  {
    date: "2021-11-01",
    count: 18,
  },
  {
    date: "2021-11-02",
    count: 19,
  },
  {
    date: "2021-11-03",
    count: 20,
  },
  {
    date: "2021-11-04",
    count: 21,
  },
  {
    date: "2021-11-05",
    count: 22,
  },
  {
    date: "2021-11-06",
    count: 23,
  },
  {
    date: "2021-11-07",
    count: 24,
  },
]

const Calender = () => {
  return (
    <Card className="my-3 mx-2">
      <div className="h-[27.8px] p-[9px_12px_0_12px]">
        <div className="font-semibold">1781 submissions in the last year</div>
      </div>
      <Separator className="my-2" />

      <div className="p-3">
        {/* <Heatmap 
        attempts={attempts}
        /> */}
        {/*  // Make this responsive by reducing the months to 6 months */}
      </div>
    </Card>
  );
};

export default Calender;
