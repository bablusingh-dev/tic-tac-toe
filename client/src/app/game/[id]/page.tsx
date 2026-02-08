'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { motion } from 'framer-motion';
import api from '@/utils/api';
import { Game } from '@/types';
import GameBoard from '@/components/GameBoard';
import Timer from '@/components/Timer';
import GameInfo from '@/components/GameInfo';
import GameResultModal from '@/components/GameResultModal';
import SeriesWinnerModal from '@/components/SeriesWinnerModal';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  const gameId = params.id as string;

  const [game, setGame] = useState<Game | null>(null);
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [timeLeft, setTimeLeft] = useState(15);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | 'tie' | 'timeout' | null>(null);
  const [showSeriesWinner, setShowSeriesWinner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  const mySymbol = game?.players.player1.userId === user?.id ? 'X' : 'O';
  const isMyTurn = currentPlayer === mySymbol;

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (!user) {
      router.push('/login');
      return;
    }

    fetchGame();
  }, [user, authLoading, gameId]);

  useEffect(() => {
    if (!socket || !game) return;

    // Join game room
    socket.emit('game:join', { gameId });

    // Listen for events
    socket.on('game:joined', handleGameJoined);
    socket.on('game:started', handleGameStarted);
    socket.on('move:made', handleMoveMade);
    socket.on('timer:tick', handleTimerTick);
    socket.on('timer:expired', handleTimerExpired);
    socket.on('game:ended', handleGameEnded);
    socket.on('series:completed', handleSeriesCompleted);
    socket.on('error', handleError);

    return () => {
      socket.off('game:joined', handleGameJoined);
      socket.off('game:started', handleGameStarted);
      socket.off('move:made', handleMoveMade);
      socket.off('timer:tick', handleTimerTick);
      socket.off('timer:expired', handleTimerExpired);
      socket.off('game:ended', handleGameEnded);
      socket.off('series:completed', handleSeriesCompleted);
      socket.off('error', handleError);
    };
  }, [socket, game]);

  const fetchGame = async () => {
    try {
      const response = await api.get<{ game: Game }>(`/games/${gameId}`);
      setGame(response.data.game);

      // If game is active and has started, set board state
      if (response.data.game.status === 'active' && response.data.game.games.length > 0) {
        const currentGame = response.data.game.games[response.data.game.games.length - 1];
        setBoard(currentGame.board);
        setCurrentPlayer(currentGame.currentPlayer);
        setGameStarted(true);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching game:', error);
      router.push('/dashboard');
    }
  };

  const handleStartGame = () => {
    if (socket) {
      socket.emit('game:start', { gameId });
    }
  };

  const handleGameJoined = (data: { gameId: string; player: string }) => {
    console.log('Player joined:', data.player);
  };

  const handleGameStarted = (data: any) => {
    setBoard(data.game.board);
    setCurrentPlayer(data.game.currentPlayer);
    setGameStarted(true);
    setWinningLine(null);
    setGameResult(null);
    fetchGame(); // Refresh game data
  };

  const handleMoveMade = (data: any) => {
    setBoard(data.board);
    setCurrentPlayer(data.currentPlayer);
  };

  const handleTimerTick = (data: { timeLeft: number; currentPlayer: 'X' | 'O' }) => {
    setTimeLeft(data.timeLeft);
  };

  const handleTimerExpired = (data: { player: 'X' | 'O' }) => {
    console.log('Timer expired for:', data.player);
  };

  const handleGameEnded = (data: any) => {
    if (data.winningLine) {
      setWinningLine(data.winningLine);
    }

    // Determine result for current player
    let result: 'win' | 'lose' | 'tie' | 'timeout';
    if (data.result === 'tie') {
      result = 'tie';
    } else if (data.result === 'timeout') {
      result = data.timedOutPlayer === mySymbol ? 'timeout' : 'win';
    } else {
      result = data.winner === mySymbol ? 'win' : 'lose';
    }

    setGameResult(result);
    fetchGame(); // Refresh game data
  };

  const handleSeriesCompleted = (data: any) => {
    fetchGame(); // Refresh game data
    setTimeout(() => {
      setShowSeriesWinner(true);
    }, 4000);
  };

  const handleError = (data: { message: string }) => {
    console.error('Socket error:', data.message);
  };

  const handleCellClick = (position: number) => {
    if (!isMyTurn || !gameStarted) return;

    if (socket) {
      socket.emit('move:make', { gameId, position });
    }
  };

  const handleResultModalClose = () => {
    setGameResult(null);
    setWinningLine(null);

    // Check if series is complete
    if (game && game.currentGame >= game.seriesLength) {
      setShowSeriesWinner(true);
    } else {
      // Start next game
      if (socket) {
        socket.emit('game:next', { gameId });
      }
    }
  };

  const handleSeriesWinnerClose = () => {
    router.push('/dashboard');
  };

  if (authLoading || loading || !game || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-secondary text-sm sm:text-base order-1"
          >
            ← Back
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white order-2 sm:order-2">
            Best of {game.seriesLength} Series
          </h1>
          <div className="w-20 sm:w-40 order-3"></div>
        </div>

        {!gameStarted ? (
          /* Waiting Room */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card max-w-2xl mx-auto text-center py-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Waiting for Game to Start
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {game.status === 'pending'
                ? 'Waiting for opponent to accept invitation...'
                : 'Both players are ready. Click start to begin!'}
            </p>
            {game.status === 'active' && (
              <button onClick={handleStartGame} className="btn-primary text-xl px-12 py-4">
                Start Game
              </button>
            )}
          </motion.div>
        ) : (
          /* Game Board */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Game Info */}
            <div className="lg:col-span-1">
              <GameInfo game={game} currentPlayer={currentPlayer} mySymbol={mySymbol} />
            </div>

            {/* Center: Board and Timer */}
            <div className="lg:col-span-2 space-y-8">
              <Timer timeLeft={timeLeft} isMyTurn={isMyTurn} />
              <GameBoard
                board={board}
                onCellClick={handleCellClick}
                disabled={!isMyTurn}
                winningLine={winningLine}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {gameResult && (
        <GameResultModal result={gameResult} onClose={handleResultModalClose} />
      )}

      {showSeriesWinner && game && (
        <SeriesWinnerModal
          game={game}
          myUsername={user.username}
          onClose={handleSeriesWinnerClose}
        />
      )}
    </div>
  );
}
