import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayer {
  userId: mongoose.Types.ObjectId;
  username: string;
  symbol: 'X' | 'O';
}

export interface IGameState {
  gameNumber: number;
  board: (string | null)[];
  currentPlayer: 'X' | 'O';
  winner: string | null;
  result: 'win' | 'tie' | 'timeout' | null;
  startedBy: 'X' | 'O';
  moves: Array<{
    player: 'X' | 'O';
    position: number;
    timestamp: Date;
  }>;
  startedAt: Date;
  endedAt?: Date;
}

export interface IGame extends Document {
  seriesLength: number;
  players: {
    player1: IPlayer;
    player2: IPlayer;
  };
  currentGame: number;
  games: IGameState[];
  seriesScore: {
    player1Wins: number;
    player2Wins: number;
    ties: number;
  };
  status: 'pending' | 'active' | 'completed';
  winner: string | null;
  invitedPlayer: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const gameSchema = new Schema<IGame>(
  {
    seriesLength: {
      type: Number,
      required: true,
      enum: [3, 5, 7],
    },
    players: {
      player1: {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        symbol: {
          type: String,
          enum: ['X', 'O'],
          default: 'X',
        },
      },
      player2: {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        username: {
          type: String,
        },
        symbol: {
          type: String,
          enum: ['X', 'O'],
          default: 'O',
        },
      },
    },
    currentGame: {
      type: Number,
      default: 0,
    },
    games: [
      {
        gameNumber: {
          type: Number,
          required: true,
        },
        board: {
          type: [String],
          default: () => Array(9).fill(null),
        },
        currentPlayer: {
          type: String,
          enum: ['X', 'O'],
          required: true,
        },
        winner: {
          type: String,
          default: null,
        },
        result: {
          type: String,
          enum: ['win', 'tie', 'timeout', null],
          default: null,
        },
        startedBy: {
          type: String,
          enum: ['X', 'O'],
          required: true,
        },
        moves: [
          {
            player: {
              type: String,
              enum: ['X', 'O'],
              required: true,
            },
            position: {
              type: Number,
              required: true,
            },
            timestamp: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        startedAt: {
          type: Date,
          default: Date.now,
        },
        endedAt: {
          type: Date,
        },
      },
    ],
    seriesScore: {
      player1Wins: {
        type: Number,
        default: 0,
      },
      player2Wins: {
        type: Number,
        default: 0,
      },
      ties: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed'],
      default: 'pending',
    },
    winner: {
      type: String,
      default: null,
    },
    invitedPlayer: {
      type: String,
      required: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Game = mongoose.model<IGame>('Game', gameSchema);
