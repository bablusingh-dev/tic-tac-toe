import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Game } from '../models/Game';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// Validation rules
export const createGameValidation = [
  body('seriesLength')
    .isInt({ min: 3, max: 7 })
    .custom((value) => [3, 5, 7].includes(value))
    .withMessage('Series length must be 3, 5, or 7'),
  body('opponentUsername')
    .trim()
    .notEmpty()
    .withMessage('Opponent username is required'),
];

// Create game and send invitation
export const createGame = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { seriesLength, opponentUsername } = req.body;
    const userId = req.userId!;
    const user = req.user!;

    // Check if opponent exists
    const opponent = await User.findOne({ username: opponentUsername });

    if (!opponent) {
      res.status(404).json({ error: 'Opponent not found' });
      return;
    }

    if (opponent._id.toString() === userId) {
      res.status(400).json({ error: 'Cannot play against yourself' });
      return;
    }

    // Create game
    const game = new Game({
      seriesLength,
      players: {
        player1: {
          userId: user._id,
          username: user.username,
          symbol: 'X',
        },
        player2: {
          userId: opponent._id,
          username: opponent.username,
          symbol: 'O',
        },
      },
      invitedPlayer: opponentUsername,
      status: 'pending',
    });

    await game.save();

    res.status(201).json({
      message: 'Game created successfully',
      game: {
        id: game._id,
        seriesLength: game.seriesLength,
        players: game.players,
        status: game.status,
        invitedPlayer: game.invitedPlayer,
      },
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ error: 'Server error creating game' });
  }
};

// Accept game invitation
export const acceptInvitation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const userId = req.userId!;

    const game = await Game.findById(gameId);

    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    // Check if user is the invited player
    if (game.players.player2.userId.toString() !== userId) {
      res.status(403).json({ error: 'You are not invited to this game' });
      return;
    }

    if (game.status !== 'pending') {
      res.status(400).json({ error: 'Game already started or completed' });
      return;
    }

    // Update game status to active
    game.status = 'active';
    await game.save();

    res.status(200).json({
      message: 'Invitation accepted',
      game: {
        id: game._id,
        seriesLength: game.seriesLength,
        players: game.players,
        status: game.status,
      },
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Server error accepting invitation' });
  }
};

// Decline game invitation
export const declineInvitation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const userId = req.userId!;

    const game = await Game.findById(gameId);

    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    // Check if user is the invited player
    if (game.players.player2.userId.toString() !== userId) {
      res.status(403).json({ error: 'You are not invited to this game' });
      return;
    }

    if (game.status !== 'pending') {
      res.status(400).json({ error: 'Game already started or completed' });
      return;
    }

    // Delete the game
    await Game.findByIdAndDelete(gameId);

    res.status(200).json({ message: 'Invitation declined' });
  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({ error: 'Server error declining invitation' });
  }
};

// Get user's active games
export const getActiveGames = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const games = await Game.find({
      $or: [
        { 'players.player1.userId': userId },
        { 'players.player2.userId': userId },
      ],
      status: { $in: ['pending', 'active'] },
    }).sort({ createdAt: -1 });

    res.status(200).json({ games });
  } catch (error) {
    console.error('Get active games error:', error);
    res.status(500).json({ error: 'Server error fetching games' });
  }
};

// Get game by ID
export const getGameById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    const userId = req.userId!;

    const game = await Game.findById(gameId);

    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    // Check if user is a player in this game
    const isPlayer =
      game.players.player1.userId.toString() === userId ||
      game.players.player2.userId.toString() === userId;

    if (!isPlayer) {
      res.status(403).json({ error: 'You are not a player in this game' });
      return;
    }

    res.status(200).json({ game });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ error: 'Server error fetching game' });
  }
};

// Get pending invitations
export const getPendingInvitations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const invitations = await Game.find({
      'players.player2.userId': userId,
      status: 'pending',
    }).sort({ createdAt: -1 });

    res.status(200).json({ invitations });
  } catch (error) {
    console.error('Get pending invitations error:', error);
    res.status(500).json({ error: 'Server error fetching invitations' });
  }
};
