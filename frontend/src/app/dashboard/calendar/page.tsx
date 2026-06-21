"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getProjects } from "@/lib/api";
import type { Task } from "@/lib/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PRIORITY_CHIP: Record<string, string> = {
  high: "border-rose-500/30 bg-rose-500/15 text-rose-300",
  medium: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  low: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
};

function localYmd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** First Monday of the 6-week grid that contains the given month. */
function gridStart(year: number, month: number) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  return new Date(year, month, 1 - offset);
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    getProjects()
      .then((projects) => setTasks(projects.flatMap((p) => p.tasks ?? [])))
      .catch(() => setTasks([]));
  }, []);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const todayStr = localYmd(new Date());

  const days = useMemo(() => {
    const start = gridStart(year, month);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [year, month]);

  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const t of tasks) {
      if (!t.due_date) continue;
      const key = localYmd(new Date(t.due_date));
      (map[key] ??= []).push(t);
    }
    return map;
  }, [tasks]);

  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">{monthLabel}</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="rounded-lg border border-zinc-800 p-1.5 text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="rounded-lg border border-zinc-800 p-1.5 text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            const now = new Date();
            setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
          }}
          className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
        >
          Today
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/60">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7">
          {days.map((d, i) => {
            const key = localYmd(d);
            const inMonth = d.getMonth() === month;
            const isToday = key === todayStr;
            const items = tasksByDay[key] ?? [];
            return (
              <div
                key={i}
                className={`min-h-[88px] border-b border-r border-zinc-800/60 p-1.5 sm:min-h-[112px] ${
                  inMonth ? "" : "bg-zinc-950/40"
                } ${isToday ? "bg-emerald-500/5" : ""}`}
              >
                <div className="mb-1">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isToday
                        ? "bg-emerald-400 font-bold text-zinc-950"
                        : inMonth
                          ? "text-zinc-400"
                          : "text-zinc-600"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                </div>
                <div className="space-y-1">
                  {items.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      title={t.title}
                      className={`truncate rounded border px-1.5 py-0.5 text-[11px] ${
                        PRIORITY_CHIP[t.priority] ?? PRIORITY_CHIP.low
                      }`}
                    >
                      {t.status === "done" ? "✓ " : ""}
                      {t.title}
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="px-1 text-[11px] text-zinc-500">+{items.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
