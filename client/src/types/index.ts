export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    gamesLost: number;
  };
}

export interface Player {
  userId: string;
  username: string;
  symbol: 'X' | 'O';
}

export interface GameMove {
  player: 'X' | 'O';
  position: number;
  timestamp: string;
}

export interface GameState {
  gameNumber: number;
  board: (string | null)[];
  currentPlayer: 'X' | 'O';
  winner: string | null;
  result: 'win' | 'tie' | 'timeout' | null;
  startedBy: 'X' | 'O';
  moves: GameMove[];
  startedAt: string;
  endedAt?: string;
}

export interface Game {
  _id: string;
  seriesLength: number;
  players: {
    player1: Player;
    player2: Player;
  };
  currentGame: number;
  games: GameState[];
  seriesScore: {
    player1Wins: number;
    player2Wins: number;
    ties: number;
  };
  status: 'pending' | 'active' | 'completed';
  winner: string | null;
  invitedPlayer: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface GameResponse {
  message: string;
  game: Game;
}

// Socket.io event types
export interface SocketEvents {
  // Client to Server
  'game:join': (data: { gameId: string }) => void;
  'game:start': (data: { gameId: string }) => void;
  'move:make': (data: { gameId: string; position: number }) => void;
  'game:next': (data: { gameId: string }) => void;

  // Server to Client
  'game:created': (data: { gameId: string; inviter: string }) => void;
  'game:joined': (data: { gameId: string; player: string }) => void;
  'game:started': (data: {
    gameId: string;
    game: {
      gameNumber: number;
      board: (string | null)[];
      currentPlayer: 'X' | 'O';
      seriesLength: number;
      seriesScore: Game['seriesScore'];
      players: Game['players'];
    };
  }) => void;
  'move:made': (data: {
    position: number;
    player: 'X' | 'O';
    board: (string | null)[];
    currentPlayer: 'X' | 'O';
  }) => void;
  'timer:tick': (data: { timeLeft: number; currentPlayer: 'X' | 'O' }) => void;
  'timer:expired': (data: { player: 'X' | 'O' }) => void;
  'game:ended': (data: {
    result: 'win' | 'tie' | 'timeout';
    winner?: 'X' | 'O';
    timedOutPlayer?: 'X' | 'O';
    winningLine?: number[];
    seriesScore: Game['seriesScore'];
    currentGame: number;
    seriesLength: number;
  }) => void;
  'series:completed': (data: {
    winner: string | null;
    finalScore: Game['seriesScore'];
  }) => void;
  error: (data: { message: string }) => void;
}

export interface TimerState {
  timeLeft: number;
  currentPlayer: 'X' | 'O' | null;
}
