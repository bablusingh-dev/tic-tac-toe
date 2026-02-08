export interface WinningLine {
  positions: number[];
  player: 'X' | 'O';
}

export const checkWinner = (board: (string | null)[]): WinningLine | null => {
  const winPatterns = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal top-left to bottom-right
    [2, 4, 6], // Diagonal top-right to bottom-left
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        positions: pattern,
        player: board[a] as 'X' | 'O',
      };
    }
  }

  return null;
};

export const checkTie = (board: (string | null)[]): boolean => {
  return board.every((cell) => cell !== null);
};

export const isValidMove = (
  board: (string | null)[],
  position: number,
  currentPlayer: 'X' | 'O',
  expectedPlayer: 'X' | 'O'
): { valid: boolean; error?: string } => {
  if (position < 0 || position > 8) {
    return { valid: false, error: 'Invalid position' };
  }

  if (board[position] !== null) {
    return { valid: false, error: 'Position already occupied' };
  }

  if (currentPlayer !== expectedPlayer) {
    return { valid: false, error: 'Not your turn' };
  }

  return { valid: true };
};

export const determineNextStarter = (
  previousResult: 'win' | 'tie' | 'timeout',
  previousWinner: string | null,
  previousStarter: 'X' | 'O'
): 'X' | 'O' => {
  if (previousResult === 'win' && previousWinner) {
    // Winner starts next game
    return previousWinner as 'X' | 'O';
  } else if (previousResult === 'tie') {
    // Alternate starter on tie
    return previousStarter === 'X' ? 'O' : 'X';
  } else if (previousResult === 'timeout' && previousWinner) {
    // Winner (opponent of timeout player) starts
    return previousWinner as 'X' | 'O';
  }
  
  // Default to X
  return 'X';
};

export const calculateSeriesWinner = (
  player1Wins: number,
  player2Wins: number,
  player1Username: string,
  player2Username: string
): string | null => {
  if (player1Wins > player2Wins) {
    return player1Username;
  } else if (player2Wins > player1Wins) {
    return player2Username;
  }
  return null; // Tie in series (shouldn't happen with odd series lengths)
};
