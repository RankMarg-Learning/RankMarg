"use client";
import React from "react";
import Heatmap from "./heatmap/Heatmap";
import { CalenderProps } from "@/types/analytics.type";

const Calender = ({ attempts }: { attempts: CalenderProps[] }) => {
  return (
    <div className="my-3">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Attempt Activities
        </h3>
      </div>
      <Heatmap
        attempts={attempts}
      />
    </div>
  );
};

export default Calender;
