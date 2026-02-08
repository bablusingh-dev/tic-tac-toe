'use client';

import React from 'react';
import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{
        scale: timeLeft < 5 ? [1, 1.05, 1] : 1,
        opacity: 1,
      }}
      transition={{
        scale: {
          repeat: timeLeft < 5 ? Infinity : 0,
          duration: 0.5,
        },
      }}
      className={`${getBackgroundColor()} ${getBorderColor()} border-4 rounded-2xl p-8 text-center ${
        timeLeft < 5 ? 'animate-shake' : ''
      }`}
    >
      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
        {isMyTurn ? 'YOUR TURN' : "OPPONENT'S TURN"}
      </p>
      <motion.div
        key={timeLeft}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className={`text-8xl font-bold ${getTimerColor()}`}
      >
        {timeLeft}
      </motion.div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">
        seconds remaining
      </p>
    </motion.div>
  );
}
