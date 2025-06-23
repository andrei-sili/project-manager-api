// frontend/src/lib/timerStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Timer = {
  running: boolean;
  taskId: string | null;
  startTime: number | null; // Timestamp when timer was started
  eElapsed: number; // Elapsed seconds (before current running session)
};

interface TimerStore {
  timer: Timer;
  startTimer: (taskId: string) => void;
  stopTimer: () => void;
  resetTimer: () => void;
  getElapsed: () => number; // total elapsed seconds
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      timer: {
        running: false,
        taskId: null,
        startTime: null,
        eElapsed: 0,
      },
      startTimer: (taskId: string) => {
        const now = Date.now();
        // If timer is already running, stop it and reset before starting a new one
        set({
          timer: {
            running: true,
            taskId,
            startTime: now,
            eElapsed: 0,
          }
        });
      },
      stopTimer: () => {
        const { timer } = get();
        if (!timer.running) return;
        const now = Date.now();
        const elapsed = timer.eElapsed + Math.floor((now - (timer.startTime || now)) / 1000);
        set({
          timer: {
            ...timer,
            running: false,
            startTime: null,
            eElapsed: elapsed,
          }
        });
      },
      resetTimer: () => set({
        timer: {
          running: false,
          taskId: null,
          startTime: null,
          eElapsed: 0,
        }
      }),
      getElapsed: () => {
        const { timer } = get();
        if (!timer.taskId) return 0;
        if (timer.running && timer.startTime) {
          return timer.eElapsed + Math.floor((Date.now() - timer.startTime) / 1000);
        }
        return timer.eElapsed;
      }
    }),
    {
      name: "global-task-timer", // localStorage key
    }
  )
);
