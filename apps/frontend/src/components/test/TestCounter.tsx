import { useState, useEffect, useCallback } from 'react'

interface CountdownProps {
  targetDate: Date
  onComplete: () => void
}

export default function Countdown({ targetDate, onComplete }: CountdownProps) {
  const calculateTimeLeft = useCallback(() => {
    const difference = targetDate.getTime() - new Date().getTime()
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }, [targetDate])

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = calculateTimeLeft()
      setTimeLeft(newTime)
      
      if (Object.values(newTime).every(v => v === 0)) {
        onComplete()
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, calculateTimeLeft, onComplete])

  return (
    <div className="flex items-center justify-center bg-white/10 p-2 rounded-lg">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center mx-2">
          <span className="text-xl font-bold text-white">{String(value).padStart(2, '0')}</span>
          <span className="text-sm font-medium text-white capitalize">{unit}</span>
        </div>
      ))}
    </div>
  )
}
