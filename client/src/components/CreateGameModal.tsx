'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

interface CreateGameModalProps {
  onClose: () => void;
}

export default function CreateGameModal({ onClose }: CreateGameModalProps) {
  const router = useRouter();
  const [seriesLength, setSeriesLength] = useState<3 | 5 | 7>(3);
  const [opponentUsername, setOpponentUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post<{ game: { _id: string } }>('/games/create', {
        seriesLength,
        opponentUsername,
      });

      // Redirect to the created game
      router.push(`/game/${response.data.game._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create game');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card max-w-md w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Game
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Series Length
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[3, 5, 7].map((length) => (
                <button
                  key={length}
                  type="button"
                  onClick={() => setSeriesLength(length as 3 | 5 | 7)}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    seriesLength === length
                      ? 'bg-primary-600 text-white shadow-lg scale-105'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Best of {length}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="opponentUsername"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Opponent Username
            </label>
            <input
              id="opponentUsername"
              type="text"
              value={opponentUsername}
              onChange={(e) => setOpponentUsername(e.target.value)}
              className="input-field"
              placeholder="Enter opponent's username"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Game'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
