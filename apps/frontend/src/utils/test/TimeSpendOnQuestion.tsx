import { Badge } from '@repo/common-ui'
import { useTestContext } from '@/context/TestContext';
import React, { useEffect, useState } from 'react'



const TimeSpendOnQuestion = ({ currentQuestion }: { currentQuestion: number }) => {
  const { testId, isTestComplete } = useTestContext();
  const [timings, setTimings] = useState<Record<number, number>>(() => {
    const savedData = sessionStorage.getItem(`question_timer_${testId}`);
    return savedData ? JSON.parse(savedData) : {};
  });

  useEffect(() => {
    if (isTestComplete) return; 

    if (!(currentQuestion in timings)) {
      setTimings((prev) => ({ ...prev, [currentQuestion]: 0 }));
    }

    const timer = setInterval(() => {
      setTimings((prev) => {
        const updatedTimings = {
          ...prev,
          [currentQuestion]: (prev[currentQuestion] || 0) + 1,
        };

        sessionStorage.setItem(`question_timer_${testId}`, JSON.stringify(updatedTimings));
        return updatedTimings;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, testId, timings, isTestComplete]);


  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Badge className="hidden" variant="outline">
      Question time: {formatTime(timings[currentQuestion] || 0)}
    </Badge>
  );
}

export default TimeSpendOnQuestion
