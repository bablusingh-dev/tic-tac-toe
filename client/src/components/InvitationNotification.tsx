'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import { Game } from '@/types';

interface InvitationNotificationProps {
  game: Game;
  onResponse: () => void;
}

export default function InvitationNotification({
  game,
  onResponse,
}: InvitationNotificationProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    setLoading(true);
    try {
      await api.post(`/games/${game._id}/accept`);
      onResponse();
      router.push(`/game/${game._id}`);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await api.post(`/games/${game._id}/decline`);
      onResponse();
    } catch (error) {
      console.error('Error declining invitation:', error);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="card bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-2 border-primary-300 dark:border-primary-700"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Game Invitation
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{game.players.player1.username}</span>{' '}
            invited you to play a best of {game.seriesLength} series
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            disabled={loading}
            className="btn-danger disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Accepting...' : 'Accept'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
