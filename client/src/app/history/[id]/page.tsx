'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import { Game } from '@/types';

export default function SeriesDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const seriesId = params.id as string;

  const [series, setSeries] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    fetchSeriesDetails();
  }, [user, authLoading, seriesId]);

  const fetchSeriesDetails = async () => {
    try {
      const response = await api.get<{ series: Game }>(`/history/${seriesId}`);
      setSeries(response.data.series);
    } catch (error) {
      console.error('Error fetching series details:', error);
      router.push('/history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getGameResult = (game: any, mySymbol: 'X' | 'O') => {
    if (game.result === 'tie') return 'Tie';
    if (game.winner === mySymbol) return 'Won';
    return 'Lost';
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Won':
        return 'text-green-600 dark:text-green-400';
      case 'Lost':
        return 'text-red-600 dark:text-red-400';
      case 'Tie':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (authLoading || loading || !series || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const isPlayer1 = series.players.player1.userId === user.id;
  const mySymbol = isPlayer1 ? 'X' : 'O';
  const opponent = isPlayer1 ? series.players.player2 : series.players.player1;
  const myWins = isPlayer1 ? series.seriesScore.player1Wins : series.seriesScore.player2Wins;
  const opponentWins = isPlayer1 ? series.seriesScore.player2Wins : series.seriesScore.player1Wins;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Series vs {opponent.username}
            </h1>
            <p className="text-primary-200">
              Completed on {formatDate(series.completedAt || series.updatedAt)}
            </p>
          </div>
          <button onClick={() => router.push('/history')} className="btn-secondary">
            ← Back to History
          </button>
        </div>

        {/* Series Summary */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Series Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Series Length</p>
              <p className="text-4xl font-bold text-primary-600">
                Best of {series.seriesLength}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Final Score</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {myWins} - {opponentWins}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Result</p>
              <p className="text-4xl font-bold">
                {series.winner === user.username ? (
                  <span className="text-green-600">🏆 Won</span>
                ) : series.winner === null ? (
                  <span className="text-gray-600">🤝 Draw</span>
                ) : (
                  <span className="text-red-600">😔 Lost</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Game-by-Game Breakdown */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Game-by-Game Breakdown
          </h2>
          <div className="space-y-4">
            {series.games.map((game, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Game {game.gameNumber}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Started by {game.startedBy === mySymbol ? 'You' : opponent.username}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {game.moves.length} moves
                    </p>
                    <p className={`text-xl font-bold ${getResultColor(getGameResult(game, mySymbol))}`}>
                      {getGameResult(game, mySymbol)}
                      {game.result === 'timeout' && ' (Timeout)'}
                    </p>
                  </div>
                </div>

                {/* Mini Board */}
                <div className="grid grid-cols-3 gap-2 mt-4 max-w-xs">
                  {game.board.map((cell, cellIndex) => (
                    <div
                      key={cellIndex}
                      className="aspect-square bg-white dark:bg-gray-800 rounded flex items-center justify-center text-2xl font-bold"
                    >
                      {cell === 'X' ? (
                        <span className="text-primary-600 dark:text-primary-400">X</span>
                      ) : cell === 'O' ? (
                        <span className="text-red-600 dark:text-red-400">O</span>
                      ) : (
                        <span className="text-gray-300">·</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
