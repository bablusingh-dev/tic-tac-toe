'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface GameResultModalProps {
  result: 'win' | 'lose' | 'tie' | 'timeout';
  onClose: () => void;
  autoClose?: boolean;
}

export default function GameResultModal({
  result,
  onClose,
  autoClose = true,
}: GameResultModalProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const getResultConfig = () => {
    switch (result) {
      case 'win':
        return {
          title: '🎉 You Win!',
          message: 'Congratulations on your victory!',
          bgColor: 'from-green-500 to-green-600',
          textColor: 'text-white',
        };
      case 'lose':
        return {
          title: '😔 You Lose',
          message: 'Better luck next time!',
          bgColor: 'from-red-500 to-red-600',
          textColor: 'text-white',
        };
      case 'tie':
        return {
          title: '🤝 It\'s a Tie!',
          message: 'Well played by both!',
          bgColor: 'from-gray-500 to-gray-600',
          textColor: 'text-white',
        };
      case 'timeout':
        return {
          title: '⏰ Time\'s Up!',
          message: 'You ran out of time!',
          bgColor: 'from-orange-500 to-orange-600',
          textColor: 'text-white',
        };
    }
  };

  const config = getResultConfig();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className={`bg-gradient-to-br ${config.bgColor} rounded-3xl shadow-2xl p-12 max-w-md w-full text-center`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <h2 className={`text-5xl font-bold ${config.textColor} mb-4`}>
            {config.title}
          </h2>
          <p className={`text-xl ${config.textColor} opacity-90 mb-8`}>
            {config.message}
          </p>
        </motion.div>

        {autoClose && (
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 4, ease: 'linear' }}
            className="h-1 bg-white/30 rounded-full mx-auto"
          />
        )}

        {!autoClose && (
          <button onClick={onClose} className="btn-primary mt-4">
            Continue
          </button>
        )}
      </motion.div>
    </div>
  );
}
