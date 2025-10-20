import React, { useEffect } from 'react';
import { Text } from 'react-native';
import tw from '@/utils/tailwind';

interface TimerProps {
  questionId: string;
  defaultTime?: number;
  isRunning: boolean;
  onTimeChange: React.Dispatch<React.SetStateAction<number>>;
  className?: string;
}

export default function Timer({ defaultTime = 0, isRunning, onTimeChange }: TimerProps) {
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      onTimeChange((t) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, onTimeChange]);

  return <Text style={tw`text-sm text-blue-600`}>{defaultTime}s</Text>;
}


