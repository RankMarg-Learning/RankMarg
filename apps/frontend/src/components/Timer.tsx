import React, { useEffect } from "react";

interface TimerProps {
  time: number;          
  isRunning: boolean;   
  onTimeChange: (time: number) => void; 
  className?: string;    
}

const Timer: React.FC<TimerProps> = ({ time, isRunning, onTimeChange, className }) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        onTimeChange(time + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning, time, onTimeChange]);

  return (
    <div className={`text-lg font-mono px-2 rounded-sm ${className}`}>
      {Math.floor(time / 60).toString().padStart(2, "0")}:
      {(time % 60).toString().padStart(2, "0")}
    </div>
  );
};

export default Timer;
