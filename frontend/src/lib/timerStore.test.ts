import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useTimerStore } from "@/lib/timerStore";

// Realistic epoch base; the store treats a 0 timestamp as "unset" (falsy guards).
const T0 = 1_700_000_000_000;

describe("useTimerStore", () => {
  let nowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    useTimerStore.getState().resetTimer();
    nowSpy = vi.spyOn(Date, "now");
  });

  afterEach(() => {
    nowSpy.mockRestore();
  });

  it("starts a timer for a specific task", () => {
    nowSpy.mockReturnValue(T0);
    useTimerStore.getState().startTimer("task-1");
    const { timer } = useTimerStore.getState();
    expect(timer.running).toBe(true);
    expect(timer.taskId).toBe("task-1");
  });

  it("accumulates elapsed seconds while running", () => {
    nowSpy.mockReturnValue(T0);
    useTimerStore.getState().startTimer("task-1");
    nowSpy.mockReturnValue(T0 + 5_000); // +5s
    expect(useTimerStore.getState().getElapsed()).toBe(5);
  });

  it("stops the timer and keeps the accumulated time", () => {
    nowSpy.mockReturnValue(T0);
    useTimerStore.getState().startTimer("task-1");
    nowSpy.mockReturnValue(T0 + 10_000); // +10s
    useTimerStore.getState().stopTimer();

    const { timer } = useTimerStore.getState();
    expect(timer.running).toBe(false);
    expect(timer.elapsed).toBe(10);
    expect(useTimerStore.getState().getElapsed()).toBe(10);
  });

  it("resets to the initial state", () => {
    nowSpy.mockReturnValue(T0);
    useTimerStore.getState().startTimer("task-1");
    useTimerStore.getState().resetTimer();

    const { timer } = useTimerStore.getState();
    expect(timer.running).toBe(false);
    expect(timer.taskId).toBeNull();
    expect(timer.elapsed).toBe(0);
  });

  it("returns 0 elapsed when no task is set", () => {
    expect(useTimerStore.getState().getElapsed()).toBe(0);
  });
});
