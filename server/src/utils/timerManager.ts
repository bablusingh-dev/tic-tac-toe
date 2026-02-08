import { Server } from 'socket.io';

interface TimerState {
  gameId: string;
  currentPlayer: 'X' | 'O';
  timeLeft: number;
  interval: NodeJS.Timeout | null;
}

class TimerManager {
  private timers: Map<string, TimerState> = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  startTimer(gameId: string, currentPlayer: 'X' | 'O', onTimeout: () => void): void {
    // Clear existing timer if any
    this.clearTimer(gameId);

    const timerState: TimerState = {
      gameId,
      currentPlayer,
      timeLeft: 15,
      interval: null,
    };

    // Emit initial timer state
    this.io.to(gameId).emit('timer:tick', {
      timeLeft: 15,
      currentPlayer,
    });

    // Start countdown
    timerState.interval = setInterval(() => {
      timerState.timeLeft -= 1;

      // Emit tick to both players
      this.io.to(gameId).emit('timer:tick', {
        timeLeft: timerState.timeLeft,
        currentPlayer: timerState.currentPlayer,
      });

      // Check if time expired
      if (timerState.timeLeft <= 0) {
        this.clearTimer(gameId);
        this.io.to(gameId).emit('timer:expired', {
          player: currentPlayer,
        });
        onTimeout();
      }
    }, 1000);

    this.timers.set(gameId, timerState);
  }

  clearTimer(gameId: string): void {
    const timer = this.timers.get(gameId);
    if (timer && timer.interval) {
      clearInterval(timer.interval);
      this.timers.delete(gameId);
    }
  }

  getTimeLeft(gameId: string): number | null {
    const timer = this.timers.get(gameId);
    return timer ? timer.timeLeft : null;
  }

  clearAllTimers(): void {
    this.timers.forEach((timer) => {
      if (timer.interval) {
        clearInterval(timer.interval);
      }
    });
    this.timers.clear();
  }
}

export default TimerManager;
