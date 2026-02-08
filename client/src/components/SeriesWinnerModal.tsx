'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Game } from '@/types';

interface SeriesWinnerModalProps {
  game: Game;
  myUsername: string;
  onClose: () => void;
}

export default function SeriesWinnerModal({
  game,
  myUsername,
  onClose,
}: SeriesWinnerModalProps) {
  const iWon = game.winner === myUsername;
  const isDraw = game.winner === null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        className="card max-w-2xl w-full"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="text-8xl mb-6"
          >
            {iWon ? '🏆' : isDraw ? '🤝' : '😔'}
          </motion.div>

          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {iWon ? 'Series Victory!' : isDraw ? 'Series Draw!' : 'Series Complete'}
          </h2>

          <p className="text-2xl text-gray-600 dark:text-gray-400 mb-8">
            {iWon
              ? 'Congratulations! You won the series!'
              : isDraw
              ? 'The series ended in a draw!'
              : `${game.winner} won the series!`}
          </p>

          {/* Final Score */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Final Score
            </h3>
            <div className="flex justify-around items-center">
              <div className="text-center">
                <div className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                  {game.players.player1.username}
                </div>
                <div className="text-6xl font-bold text-primary-600">
                  {game.seriesScore.player1Wins}
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-400">-</div>
              <div className="text-center">
                <div className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                  {game.players.player2.username}
                </div>
                <div className="text-6xl font-bold text-red-600">
                  {game.seriesScore.player2Wins}
                </div>
              </div>
            </div>
            {game.seriesScore.ties > 0 && (
              <div className="text-center mt-4 text-gray-600 dark:text-gray-400">
                Ties: {game.seriesScore.ties}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {game.seriesLength}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Games Played
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {game.games.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Games
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {game.seriesScore.ties}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Ties
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn-primary text-xl px-12 py-4">
            Return to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}
