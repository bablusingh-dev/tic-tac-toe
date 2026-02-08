'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import api from '@/utils/api';

interface SeriesHistoryItem {
  _id: string;
  opponent: string;
  seriesLength: number;
  myWins: number;
  opponentWins: number;
  ties: number;
  result: 'won' | 'lost' | 'draw';
  totalGames: number;
  completedAt: string;
  createdAt: string;
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<SeriesHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    fetchHistory();
  }, [user, authLoading, router]);

  const fetchHistory = async () => {
    try {
      const response = await api.get<{ history: SeriesHistoryItem[]; total: number }>('/history');
      setHistory(response.data.history);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'won':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'lost':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'draw':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'won':
        return '🏆';
      case 'lost':
        return '😔';
      case 'draw':
        return '🤝';
      default:
        return '🎮';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Series History</h1>
            <p className="text-primary-200">View all your completed series</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="btn-secondary">
            ← Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No series history yet. Play some games to see your history!
            </p>
            <button onClick={() => router.push('/dashboard')} className="btn-primary">
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((series, index) => (
              <motion.div
                key={series._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className="card cursor-pointer"
                onClick={() => router.push(`/history/${series._id}`)}
              >
                <div className="flex items-center justify-between">
                  {/* Left: Opponent and Result */}
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{getResultIcon(series.result)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        vs {series.opponent}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Best of {series.seriesLength} • {series.totalGames} games played
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDate(series.completedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Center: Score */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary-600">
                        {series.myWins}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">You</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-400">-</div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {series.opponentWins}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {series.opponent}
                      </div>
                    </div>
                    {series.ties > 0 && (
                      <>
                        <div className="text-2xl font-bold text-gray-400">-</div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-600">
                            {series.ties}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Ties
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right: Result Badge */}
                  <div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold uppercase ${getResultColor(
                        series.result
                      )}`}
                    >
                      {series.result}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
