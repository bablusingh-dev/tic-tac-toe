import { Response } from 'express';
import { Game } from '../models/Game';
import { AuthRequest } from '../middleware/authMiddleware';

// Get series history for the current user
export const getSeriesHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // Find all completed games where user was a player
    const completedSeries = await Game.find({
      status: 'completed',
      $or: [
        { 'players.player1.userId': userId },
        { 'players.player2.userId': userId },
      ],
    })
      .sort({ completedAt: -1, updatedAt: -1 }) // Most recent first
      .limit(50); // Limit to last 50 series

    // Format the response with additional stats
    const formattedHistory = completedSeries.map((series) => {
      const isPlayer1 = series.players.player1.userId.toString() === userId;
      const opponent = isPlayer1 ? series.players.player2 : series.players.player1;
      const myWins = isPlayer1 ? series.seriesScore.player1Wins : series.seriesScore.player2Wins;
      const opponentWins = isPlayer1 ? series.seriesScore.player2Wins : series.seriesScore.player1Wins;
      const didIWin = series.winner === (isPlayer1 ? series.players.player1.username : series.players.player2.username);

      return {
        _id: series._id,
        opponent: opponent.username,
        seriesLength: series.seriesLength,
        myWins,
        opponentWins,
        ties: series.seriesScore.ties,
        result: didIWin ? 'won' : series.winner === null ? 'draw' : 'lost',
        totalGames: series.games.length,
        completedAt: series.completedAt || series.updatedAt,
        createdAt: series.createdAt,
      };
    });

    res.json({
      history: formattedHistory,
      total: completedSeries.length,
    });
  } catch (error) {
    console.error('Error fetching series history:', error);
    res.status(500).json({ error: 'Failed to fetch series history' });
  }
};

// Get detailed series information
export const getSeriesDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { seriesId } = req.params;
    const userId = req.userId;

    const series = await Game.findById(seriesId);

    if (!series) {
      res.status(404).json({ error: 'Series not found' });
      return;
    }

    // Verify user was part of this series
    const isPlayer1 = series.players.player1.userId.toString() === userId;
    const isPlayer2 = series.players.player2.userId.toString() === userId;

    if (!isPlayer1 && !isPlayer2) {
      res.status(403).json({ error: 'You are not authorized to view this series' });
      return;
    }

    res.json({ series });
  } catch (error) {
    console.error('Error fetching series details:', error);
    res.status(500).json({ error: 'Failed to fetch series details' });
  }
};
