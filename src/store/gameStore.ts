import { create } from "zustand";

export type GameMode = "free-roam" | "collect-mrr";

interface GameState {
  // Game state
  mode: GameMode;
  isPlaying: boolean;
  isCountingDown: boolean;

  // Timer state
  countdown: number;
  timeRemaining: number;

  // Score state
  score: number;

  // Actions
  setMode: (mode: GameMode) => void;
  startGame: () => void;
  endGame: () => void;
  decrementCountdown: () => void;
  decrementTimer: () => void;
  resetCountdown: () => void;
  addScore: (points: number) => void;
  resetScore: () => void;
  setIsCountingDown: (value: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  mode: "free-roam",
  isPlaying: false,
  isCountingDown: false,
  countdown: 3,
  timeRemaining: 60, // 1 minute in seconds
  score: 0,

  // Actions
  setMode: (mode) => set({ mode }),

  startGame: () =>
    set({
      isPlaying: true,
      isCountingDown: true,
      countdown: 3,
      timeRemaining: 60,
      score: 0,
    }),

  endGame: () =>
    set({
      isPlaying: false,
      isCountingDown: false,
      timeRemaining: 0,
    }),

  decrementCountdown: () =>
    set((state) => {
      const newCountdown = Math.max(0, state.countdown - 1);
      // When countdown reaches 0, set isCountingDown to false
      if (newCountdown === 0) {
        return {
          countdown: newCountdown,
          isCountingDown: false,
        };
      }
      return { countdown: newCountdown };
    }),

  decrementTimer: () =>
    set((state) => {
      console.log("Decrementing timer from", state.timeRemaining);
      const newTimeRemaining = Math.max(0, state.timeRemaining - 1);
      // End the game if time runs out
      if (newTimeRemaining === 0) {
        return {
          timeRemaining: 0,
          isPlaying: false,
          isCountingDown: false,
        };
      }
      return { timeRemaining: newTimeRemaining };
    }),

  resetCountdown: () => set({ countdown: 3, isCountingDown: true }),

  addScore: (points) =>
    set((state) => ({
      score: state.score + points,
    })),

  resetScore: () => set({ score: 0 }),

  setIsCountingDown: (value) => set({ isCountingDown: value }),
}));
