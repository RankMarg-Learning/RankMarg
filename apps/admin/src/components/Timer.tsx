import React, { useEffect, useRef, useState } from "react";

interface TimerProps {
  questionId: string;
  isRunning: boolean;
  onTimeChange?: (time: number) => void;
  className?: string;
  defaultTime?: number;
}

const getToday = () => new Date().toISOString().split("T")[0];

const getStorageKey = () => `rankmarg_timer:${getToday()}`;

const getInitialTime = (questionId: string, defaultTime?: number): number => {
  const raw = localStorage.getItem(getStorageKey());
  if (!raw) return defaultTime ?? 0;

  const data = JSON.parse(raw);
  return data.questions?.[questionId] ?? defaultTime ?? 0;
};

const saveTime = (questionId: string, seconds: number) => {
  const key = getStorageKey();
  const raw = localStorage.getItem(key);
  const data = raw
    ? JSON.parse(raw)
    : { questions: {} };

  data.questions[questionId] = seconds;

  localStorage.setItem(key, JSON.stringify(data));
};

const clearOldTimers = () => {
  const today = getToday();
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("rankmarg_timer:") && !key.includes(today)) {
      localStorage.removeItem(key);
    }
  });
};

const Timer: React.FC<TimerProps> = ({
  questionId,
  isRunning,
  onTimeChange,
  className = "",
  defaultTime,
}) => {
  const [time, setTime] = useState(() => getInitialTime(questionId, defaultTime));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    clearOldTimers();
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 1;
          saveTime(questionId, newTime);
          onTimeChange?.(newTime);
          return newTime;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, questionId, onTimeChange]);

  const minutes = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (time % 60).toString().padStart(2, "0");

  return (
    <div className={`text-lg font-mono px-2 rounded-sm ${className}`}>
      {minutes}:{seconds}
    </div>
  );
};

export default Timer;
