'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GameBoardProps {
  board: (string | null)[];
  onCellClick: (position: number) => void;
  disabled: boolean;
  winningLine: number[] | null;
}

export default function GameBoard({
  board,
  onCellClick,
  disabled,
  winningLine,
}: GameBoardProps) {
  const isWinningCell = (index: number) => {
    return winningLine?.includes(index);
  };

  return (
    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
      {board.map((cell, index) => (
        <motion.button
          key={index}
          whileHover={!disabled && !cell ? { scale: 1.05 } : {}}
          whileTap={!disabled && !cell ? { scale: 0.95 } : {}}
          onClick={() => !disabled && !cell && onCellClick(index)}
          disabled={disabled || !!cell}
          className={`game-cell aspect-square bg-white dark:bg-gray-800 border-4 ${
            isWinningCell(index)
              ? 'winning-cell border-green-500'
              : 'border-gray-300 dark:border-gray-600'
          } ${
            !disabled && !cell
              ? 'hover:border-primary-500 cursor-pointer'
              : 'cursor-not-allowed'
          }`}
        >
          {cell && (
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={
                cell === 'X'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-red-600 dark:text-red-400'
              }
            >
              {cell}
            </motion.span>
          )}
        </motion.button>
      ))}
    </div>
  );
}
