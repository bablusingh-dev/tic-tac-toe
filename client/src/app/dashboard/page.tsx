'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import { Game } from '@/types';
import CreateGameModal from '@/components/CreateGameModal';
import InvitationNotification from '@/components/InvitationNotification';

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { socket, connected } = useSocket();
  const router = useRouter();
  const [activeGames, setActiveGames] = useState<Game[]>([]);
  const [invitations, setInvitations] = useState<Game[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (!user) {
      router.push('/login');
      return;
    }

    fetchGames();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (socket) {
      socket.on('game:created', handleGameCreated);

      return () => {
        socket.off('game:created', handleGameCreated);
      };
    }
  }, [socket]);

  const fetchGames = async () => {
    try {
      const [activeRes, invitationsRes] = await Promise.all([
        api.get<{ games: Game[] }>('/games/active'),
        api.get<{ invitations: Game[] }>('/games/invitations'),
      ]);

      setActiveGames(activeRes.data.games);
      setInvitations(invitationsRes.data.invitations);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGameCreated = (data: { gameId: string; inviter: string }) => {
    fetchGames();
  };

  const handleGameCreatedSuccess = () => {
    setShowCreateModal(false);
    fetchGames();
  };

  const handleInvitationResponse = () => {
    fetchGames();
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
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome, {user.fullName}!
            </h1>
            <p className="text-primary-200">@{user.username}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  connected ? 'bg-green-500' : 'bg-red-500'
                } animate-pulse`}
              ></div>
              <span className="text-white text-sm">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button onClick={() => router.push('/history')} className="btn-secondary text-sm sm:text-base">
              📜 History
            </button>
            <button onClick={logout} className="btn-danger text-sm sm:text-base">
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card text-center"
          >
            <p className="text-gray-600 dark:text-gray-400 mb-2">Games Played</p>
            <p className="text-4xl font-bold text-primary-600">
              {user.stats.gamesPlayed}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card text-center"
          >
            <p className="text-gray-600 dark:text-gray-400 mb-2">Games Won</p>
            <p className="text-4xl font-bold text-green-600">
              {user.stats.gamesWon}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card text-center"
          >
            <p className="text-gray-600 dark:text-gray-400 mb-2">Games Lost</p>
            <p className="text-4xl font-bold text-red-600">
              {user.stats.gamesLost}
            </p>
          </motion.div>
        </div>

        {/* Invitations */}
        {invitations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Pending Invitations ({invitations.length})
            </h2>
            <div className="space-y-4">
              {invitations.map((game) => (
                <InvitationNotification
                  key={game._id}
                  game={game}
                  onResponse={handleInvitationResponse}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Active Games */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">
              Active Games ({activeGames.length})
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              + New Game
            </button>
          </div>

          {loading ? (
            <div className="card text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : activeGames.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No active games. Create one to start playing!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Game
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeGames.map((game) => (
                <motion.div
                  key={game._id}
                  whileHover={{ scale: 1.02 }}
                  className="card cursor-pointer"
                  onClick={() => router.push(`/game/${game._id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        vs {game.players.player1.username === user.username
                          ? game.players.player2.username
                          : game.players.player1.username}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Best of {game.seriesLength}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        game.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {game.status === 'active' ? 'In Progress' : 'Waiting'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Game {game.currentGame} of {game.seriesLength}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {game.seriesScore.player1Wins} - {game.seriesScore.player2Wins}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Game Modal */}
      {showCreateModal && (
        <CreateGameModal
          onClose={() => setShowCreateModal(false)}
          onGameCreated={handleGameCreatedSuccess}
        />
      )}
    </div>
  );
}
