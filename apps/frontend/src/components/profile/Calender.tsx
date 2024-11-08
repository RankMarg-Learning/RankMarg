"use client";
import { Card } from "@/components/ui/card";
import React from "react";
import Heatmap from "./heatmap/Heatmap";
import { Separator } from "@/components/ui/separator";



const Calender = ({attempts}) => {
  return (
    <Card className="my-3 mx-2">
      <div className="h-[27.8px] p-[9px_12px_0_12px]">
        <div className="font-semibold">{attempts.length} submissions in the last year</div>
      </div>
      <Separator className="my-2" />
      <div className="p-3">
        <Heatmap 
        attempts={attempts}
        />
      </div>
    </Card>
  );
};

export default Calender;
