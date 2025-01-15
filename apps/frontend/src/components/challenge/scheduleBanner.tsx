"use client";

import React, { useEffect, useState } from "react";
import { Clock, Calendar } from 'lucide-react';

const ScheduleBanner = () => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
      nextSunday.setHours(18, 0, 0, 0); // Set to 6 PM

      if (now > nextSunday) {
        nextSunday.setDate(nextSunday.getDate() + 7); // Move to next Sunday if it's past 6 PM on Sunday
      }

      const difference = nextSunday.getTime() - now.getTime();
      setTimeLeft(difference);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number) => {
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const { days, hours, minutes, seconds } = formatTime(timeLeft);

  return (
    <div className="relative bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 py-5 px-6 sm:px-12 md:px-24 lg:px-36 rounded-lg shadow-lg text-white text-center overflow-hidden">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-lg rounded-lg"></div>
      <div className="relative z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 noselect">
          Challenges Coming Soon!
        </h1>
        <p className="text-base sm:text-sm mb-5 text-gray-200 noselect">
          Join us every Sunday from 6 PM to 10 PM for exciting challenges!
        </p>
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2 text-lg">
            <Calendar className="w-5 h-5" />
            <span>Next Challenge:</span>
          </div>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-yellow-800 rounded-lg  p-2 md:p-3">
              <div className="text-2xl sm:text-xl font-bold">{days}</div>
              <div className="text-xs md:text-sm ">Days</div>
            </div>
            <div className="bg-yellow-800 rounded-lg  p-2 md:p-3">
              <div className="text-2xl sm:text-xl font-bold">{hours}</div>
              <div className="text-xs md:text-sm ">Hours</div>
            </div>
            <div className="bg-yellow-800 rounded-lg  p-2 md:p-3">
              <div className="text-2xl sm:text-xl font-bold">{minutes}</div>
              <div className="text-xs md:text-sm ">Minutes</div>
            </div>
            <div className="bg-yellow-800 rounded-lg p-2 md:p-3">
              <div className="md:text-2xl text-xl font-bold">{seconds}</div>
              <div className="text-xs md:text-sm text-center">Seconds</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-base">
            <Clock className="w-5 h-5" />
            <span>Every Sunday, 6 PM - 10 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleBanner;

