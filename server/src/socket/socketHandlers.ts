import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Game } from '../models/Game';
import { User } from '../models/User';
import TimerManager from '../utils/timerManager';
import {
  checkWinner,
  checkTie,
  isValidMove,
  determineNextStarter,
  calculateSeriesWinner,
} from '../utils/gameLogic';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export const setupSocketHandlers = (io: Server): void => {
  const timerManager = new TimerManager(io);

  // Authentication middleware for Socket.io
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, jwtSecret) as { userId: string };

      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.username = user.username;

      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.username} (${socket.id})`);

    // Join game room
    socket.on('game:join', async (data: { gameId: string }) => {
      try {
        const { gameId } = data;
        const game = await Game.findById(gameId);

        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        // Verify user is a player
        const isPlayer =
          game.players.player1.userId.toString() === socket.userId ||
          game.players.player2.userId.toString() === socket.userId;

        if (!isPlayer) {
          socket.emit('error', { message: 'You are not a player in this game' });
          return;
        }

        // Join room
        socket.join(gameId);

        // Notify both players
        io.to(gameId).emit('game:joined', {
          gameId,
          player: socket.username,
        });

        console.log(`${socket.username} joined game ${gameId}`);
      } catch (error) {
        console.error('Join game error:', error);
        socket.emit('error', { message: 'Error joining game' });
      }
    });

    // Start game
    socket.on('game:start', async (data: { gameId: string }) => {
      try {
        const { gameId } = data;
        const game = await Game.findById(gameId);

        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        if (game.status !== 'active') {
          socket.emit('error', { message: 'Game not ready to start' });
          return;
        }

        // Initialize first game
        const firstGame = {
          gameNumber: 1,
          board: Array(9).fill(null),
          currentPlayer: 'X' as 'X' | 'O',
          winner: null,
          result: null,
          startedBy: 'X' as 'X' | 'O',
          moves: [],
          startedAt: new Date(),
        };

        game.games.push(firstGame);
        game.currentGame = 1;
        await game.save();

        // Emit game started
        io.to(gameId).emit('game:started', {
          gameId,
          game: {
            gameNumber: 1,
            board: firstGame.board,
            currentPlayer: firstGame.currentPlayer,
            seriesLength: game.seriesLength,
            seriesScore: game.seriesScore,
            players: game.players,
          },
        });

        // Start timer for first player
        timerManager.startTimer(gameId, 'X', async () => {
          await handleTimeout(gameId, 'X', game, io);
        });

        console.log(`Game ${gameId} started`);
      } catch (error) {
        console.error('Start game error:', error);
        socket.emit('error', { message: 'Error starting game' });
      }
    });

    // Make move
    socket.on('move:make', async (data: { gameId: string; position: number }) => {
      try {
        const { gameId, position } = data;
        const game = await Game.findById(gameId);

        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        const currentGameState = game.games[game.games.length - 1];

        if (!currentGameState) {
          socket.emit('error', { message: 'No active game' });
          return;
        }

        // Determine player symbol
        const playerSymbol =
          game.players.player1.userId.toString() === socket.userId ? 'X' : 'O';

        // Validate move
        const validation = isValidMove(
          currentGameState.board,
          position,
          playerSymbol,
          currentGameState.currentPlayer
        );

        if (!validation.valid) {
          socket.emit('error', { message: validation.error });
          return;
        }

        // Clear timer
        timerManager.clearTimer(gameId);

        // Make move
        currentGameState.board[position] = playerSymbol;
        currentGameState.moves.push({
          player: playerSymbol,
          position,
          timestamp: new Date(),
        });

        // Check for winner
        const winningLine = checkWinner(currentGameState.board);

        if (winningLine) {
          // Game won
          currentGameState.winner = winningLine.player;
          currentGameState.result = 'win';
          currentGameState.endedAt = new Date();

          // Update series score
          if (winningLine.player === 'X') {
            game.seriesScore.player1Wins += 1;
          } else {
            game.seriesScore.player2Wins += 1;
          }

          // Update user stats
          const winnerId =
            winningLine.player === 'X'
              ? game.players.player1.userId
              : game.players.player2.userId;
          const loserId =
            winningLine.player === 'X'
              ? game.players.player2.userId
              : game.players.player1.userId;

          await User.findByIdAndUpdate(winnerId, {
            $inc: { 'stats.gamesPlayed': 1, 'stats.gamesWon': 1 },
          });
          await User.findByIdAndUpdate(loserId, {
            $inc: { 'stats.gamesPlayed': 1, 'stats.gamesLost': 1 },
          });

          await game.save();

          // Emit game ended
          io.to(gameId).emit('game:ended', {
            result: 'win',
            winner: winningLine.player,
            winningLine: winningLine.positions,
            seriesScore: game.seriesScore,
            currentGame: game.currentGame,
            seriesLength: game.seriesLength,
          });

          // Check if series is complete
          if (game.currentGame >= game.seriesLength) {
            const seriesWinner = calculateSeriesWinner(
              game.seriesScore.player1Wins,
              game.seriesScore.player2Wins,
              game.players.player1.username,
              game.players.player2.username
            );

            game.status = 'completed';
            game.winner = seriesWinner;
            game.completedAt = new Date();
            await game.save();

            io.to(gameId).emit('series:completed', {
              winner: seriesWinner,
              finalScore: game.seriesScore,
            });
          }
        } else if (checkTie(currentGameState.board)) {
          // Game tied
          currentGameState.result = 'tie';
          currentGameState.endedAt = new Date();
          game.seriesScore.ties += 1;

          await User.findByIdAndUpdate(game.players.player1.userId, {
            $inc: { 'stats.gamesPlayed': 1 },
          });
          await User.findByIdAndUpdate(game.players.player2.userId, {
            $inc: { 'stats.gamesPlayed': 1 },
          });

          await game.save();

          io.to(gameId).emit('game:ended', {
            result: 'tie',
            seriesScore: game.seriesScore,
            currentGame: game.currentGame,
            seriesLength: game.seriesLength,
          });

          // Check if series is complete
          if (game.currentGame >= game.seriesLength) {
            const seriesWinner = calculateSeriesWinner(
              game.seriesScore.player1Wins,
              game.seriesScore.player2Wins,
              game.players.player1.username,
              game.players.player2.username
            );

            game.status = 'completed';
            game.winner = seriesWinner;
            game.completedAt = new Date();
            await game.save();

            io.to(gameId).emit('series:completed', {
              winner: seriesWinner,
              finalScore: game.seriesScore,
            });
          }
        } else {
          // Continue game - switch player
          currentGameState.currentPlayer = currentGameState.currentPlayer === 'X' ? 'O' : 'X';
          await game.save();

          // Emit move made
          io.to(gameId).emit('move:made', {
            position,
            player: playerSymbol,
            board: currentGameState.board,
            currentPlayer: currentGameState.currentPlayer,
          });

          // Start timer for next player
          timerManager.startTimer(gameId, currentGameState.currentPlayer, async () => {
            await handleTimeout(gameId, currentGameState.currentPlayer, game, io);
          });
        }
      } catch (error) {
        console.error('Make move error:', error);
        socket.emit('error', { message: 'Error making move' });
      }
    });

    // Start next game in series
    socket.on('game:next', async (data: { gameId: string }) => {
      try {
        const { gameId } = data;
        
        // Use atomic operation to prevent race condition
        // Only increment currentGame if the next game doesn't exist yet
        const nextGameNumber = await Game.findById(gameId).then(g => g ? g.currentGame + 1 : 0);
        
        const game = await Game.findOneAndUpdate(
          {
            _id: gameId,
            currentGame: { $lt: nextGameNumber }, // Only update if currentGame hasn't been incremented yet
            'games.gameNumber': { $ne: nextGameNumber }, // And next game doesn't exist
          },
          {
            $inc: { currentGame: 1 },
            $push: {
              games: {
                gameNumber: nextGameNumber,
                board: Array(9).fill(null),
                currentPlayer: 'X', // Temporary, will be updated below
                winner: null,
                result: null,
                startedBy: 'X', // Temporary, will be updated below
                moves: [],
                startedAt: new Date(),
              },
            },
          },
          { new: true }
        );

        if (!game) {
          // Game was already updated by another request, just fetch and emit
          const existingGame = await Game.findById(gameId);
          if (existingGame) {
            const nextGame = existingGame.games.find(g => g.gameNumber === nextGameNumber);
            if (nextGame) {
              io.to(gameId).emit('game:started', {
                gameId,
                game: {
                  gameNumber: nextGame.gameNumber,
                  board: nextGame.board,
                  currentPlayer: nextGame.currentPlayer,
                  seriesLength: existingGame.seriesLength,
                  seriesScore: existingGame.seriesScore,
                  players: existingGame.players,
                },
              });
              
              // Start timer
              timerManager.startTimer(gameId, nextGame.currentPlayer, async () => {
                await handleTimeout(gameId, nextGame.currentPlayer, existingGame, io);
              });
            }
          }
          return;
        }

        if (game.currentGame >= game.seriesLength) {
          socket.emit('error', { message: 'Series already completed' });
          return;
        }

        // Get the previous game to determine starter
        const previousGame = game.games[game.games.length - 2]; // -2 because we just pushed a new game
        const nextStarter = determineNextStarter(
          previousGame.result!,
          previousGame.winner,
          previousGame.startedBy
        );

        // Update the newly created game with correct starter
        const updatedGame = await Game.findOneAndUpdate(
          {
            _id: gameId,
            'games.gameNumber': nextGameNumber,
          },
          {
            $set: {
              'games.$.currentPlayer': nextStarter,
              'games.$.startedBy': nextStarter,
            },
          },
          { new: true }
        );

        if (!updatedGame) {
          socket.emit('error', { message: 'Error updating game' });
          return;
        }

        const nextGame = updatedGame.games.find(g => g.gameNumber === nextGameNumber);
        if (!nextGame) {
          socket.emit('error', { message: 'Error finding next game' });
          return;
        }

        // Emit next game started
        io.to(gameId).emit('game:started', {
          gameId,
          game: {
            gameNumber: nextGame.gameNumber,
            board: nextGame.board,
            currentPlayer: nextGame.currentPlayer,
            seriesLength: updatedGame.seriesLength,
            seriesScore: updatedGame.seriesScore,
            players: updatedGame.players,
          },
        });

        // Start timer
        timerManager.startTimer(gameId, nextStarter, async () => {
          await handleTimeout(gameId, nextStarter, updatedGame, io);
        });

        console.log(`Next game started in series ${gameId}`);
      } catch (error) {
        console.error('Next game error:', error);
        socket.emit('error', { message: 'Error starting next game' });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.username} (${socket.id})`);
    });
  });

  // Handle timeout
  const handleTimeout = async (
    gameId: string,
    timedOutPlayer: 'X' | 'O',
    game: any,
    io: Server
  ) => {
    try {
      const currentGameState = game.games[game.games.length - 1];

      if (!currentGameState || currentGameState.result) {
        return; // Game already ended
      }

      // Determine winner (opponent of timed out player)
      const winner = timedOutPlayer === 'X' ? 'O' : 'X';

      currentGameState.winner = winner;
      currentGameState.result = 'timeout';
      currentGameState.endedAt = new Date();

      // Update series score
      if (winner === 'X') {
        game.seriesScore.player1Wins += 1;
      } else {
        game.seriesScore.player2Wins += 1;
      }

      // Update user stats
      const winnerId =
        winner === 'X' ? game.players.player1.userId : game.players.player2.userId;
      const loserId =
        winner === 'X' ? game.players.player2.userId : game.players.player1.userId;

      await User.findByIdAndUpdate(winnerId, {
        $inc: { 'stats.gamesPlayed': 1, 'stats.gamesWon': 1 },
      });
      await User.findByIdAndUpdate(loserId, {
        $inc: { 'stats.gamesPlayed': 1, 'stats.gamesLost': 1 },
      });

      await game.save();

      // Emit game ended
      io.to(gameId).emit('game:ended', {
        result: 'timeout',
        winner,
        timedOutPlayer,
        seriesScore: game.seriesScore,
        currentGame: game.currentGame,
        seriesLength: game.seriesLength,
      });

      // Check if series is complete
      if (game.currentGame >= game.seriesLength) {
        const seriesWinner = calculateSeriesWinner(
          game.seriesScore.player1Wins,
          game.seriesScore.player2Wins,
          game.players.player1.username,
          game.players.player2.username
        );

        game.status = 'completed';
        game.winner = seriesWinner;
        game.completedAt = new Date();
        await game.save();

        io.to(gameId).emit('series:completed', {
          winner: seriesWinner,
          finalScore: game.seriesScore,
        });
      }
    } catch (error) {
      console.error('Handle timeout error:', error);
    }
  };
};
