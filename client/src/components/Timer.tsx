'use client';

import React from 'react';

interface TimerProps {
  timeLeft: number;
  isMyTurn: boolean;
}

export default function Timer({ timeLeft, isMyTurn }: TimerProps) {
  const getTimerColor = () => {
    if (timeLeft >= 10) return 'text-timer-green';
    if (timeLeft >= 5) return 'text-timer-yellow';
    return 'text-timer-red';
  };

  const getBackgroundColor = () => {
    if (timeLeft >= 10) return 'bg-timer-green/10';
    if (timeLeft >= 5) return 'bg-timer-yellow/10';
    return 'bg-timer-red/10';
  };

  const getBorderColor = () => {
    if (timeLeft >= 10) return 'border-timer-green';
    if (timeLeft >= 5) return 'border-timer-yellow';
    return 'border-timer-red';
  };

  return (
    <div
      className={`${getBackgroundColor()} ${getBorderColor()} border-4 rounded-2xl p-6 sm:p-8 text-center ${
        timeLeft < 5 ? 'animate-shake' : ''
      }`}
    >
      <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
        {isMyTurn ? 'YOUR TURN' : "OPPONENT'S TURN"}
      </p>
      <div
        className={`text-6xl sm:text-8xl font-bold ${getTimerColor()} min-h-[100px] sm:min-h-[120px] flex items-center justify-center tabular-nums`}
      >
        {timeLeft}
      </div>
      <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
        seconds remaining
      </p>
    </div>
  );
}
