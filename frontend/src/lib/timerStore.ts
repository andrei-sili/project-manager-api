// frontend/src/lib/timerStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Timer = {
  running: boolean;
  taskId: string | null;
  startTime: number | null; // Timestamp when timer was started
  elapsed: number; // Elapsed seconds (before current running session)
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
        elapsed: 0,
      },
      /** Start timer for a specific task (resets timer if already running) */
      startTimer: (taskId: string) => {
        const now = Date.now();
        set({
          timer: {
            running: true,
            taskId,
            startTime: now,
            elapsed: 0,
          }
        });
      },
      /** Stop timer and add elapsed time to total */
      stopTimer: () => {
        const { timer } = get();
        if (!timer.running) return;
        const now = Date.now();
        const elapsed = timer.elapsed + Math.floor((now - (timer.startTime || now)) / 1000);
        set({
          timer: {
            ...timer,
            running: false,
            startTime: null,
            elapsed,
          }
        });
      },
      /** Reset timer to initial state */
      resetTimer: () => set({
        timer: {
          running: false,
          taskId: null,
          startTime: null,
          elapsed: 0,
        }
      }),
      /** Get total elapsed seconds (includes running interval) */
      getElapsed: () => {
        const { timer } = get();
        if (!timer.taskId) return 0;
        if (timer.running && timer.startTime) {
          return timer.elapsed + Math.floor((Date.now() - timer.startTime) / 1000);
        }
        return timer.elapsed;
      }
    }),
    {
      name: "global-task-timer",
    }
  )
);
