'use client';

import React from 'react';
import { Game } from '@/types';

interface GameInfoProps {
  game: Game;
  currentPlayer: 'X' | 'O';
  mySymbol: 'X' | 'O';
}

export default function GameInfo({ game, currentPlayer, mySymbol }: GameInfoProps) {
  const isMyTurn = currentPlayer === mySymbol;
  const currentGameNumber = game.games[game.games.length - 1]?.gameNumber || game.currentGame;

  return (
    <div className="space-y-6">
      {/* Turn Indicator */}
      <div className="card text-center">
        <div
          className={`text-2xl font-bold mb-2 ${
            isMyTurn
              ? 'text-green-600 dark:text-green-400'
              : 'text-orange-600 dark:text-orange-400'
          }`}
        >
          {isMyTurn ? '🎯 YOUR TURN' : '⏳ OPPONENT\'S TURN'}
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          You are playing as{' '}
          <span className="font-bold text-primary-600 dark:text-primary-400">
            {mySymbol}
          </span>
        </p>
      </div>

      {/* Series Score */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          Series Score
        </h3>
        <div className="flex justify-around items-center">
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {game.players.player1.username}
            </div>
            <div className="text-4xl font-bold text-primary-600">
              {game.seriesScore.player1Wins}
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-400">-</div>
          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {game.players.player2.username}
            </div>
            <div className="text-4xl font-bold text-red-600">
              {game.seriesScore.player2Wins}
            </div>
          </div>
        </div>
        {game.seriesScore.ties > 0 && (
          <div className="text-center mt-3 text-sm text-gray-600 dark:text-gray-400">
            Ties: {game.seriesScore.ties}
          </div>
        )}
      </div>

      {/* Game Progress */}
      <div className="card text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Game Progress
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          Game {currentGameNumber} of {game.seriesLength}
        </p>
      </div>

      {/* Players */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Players
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <span className="font-medium text-gray-900 dark:text-white">
              {game.players.player1.username}
            </span>
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              X
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <span className="font-medium text-gray-900 dark:text-white">
              {game.players.player2.username}
            </span>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              O
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
