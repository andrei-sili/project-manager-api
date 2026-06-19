"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { getAllTimeEntries, getTimeSummary } from "@/lib/api";
import type { TimeEntry, TimeSummary } from "@/lib/types";
import WeekBars from "@/components/WeekBars";
import { useTimerStore } from "@/lib/timerStore";

function formatMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

function formatClock(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function localYmd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const WEEKLY_TARGET = 40 * 60; // minutes

export default function TimeTrackingPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [summary, setSummary] = useState<TimeSummary | null>(null);
  const [filter, setFilter] = useState("");
  const [, setTick] = useState(0);

  const timer = useTimerStore((s) => s.timer);
  const getElapsed = useTimerStore((s) => s.getElapsed);

  useEffect(() => {
    Promise.all([getAllTimeEntries(), getTimeSummary().catch(() => null)]).then(([e, s]) => {
      setEntries(e);
      setSummary(s);
    });
  }, []);

  // Tick once per second while a timer runs, so the elapsed clock stays live.
  useEffect(() => {
    if (!timer.running) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [timer.running]);

  const taskTitle = (id: string | number) =>
    entries.find((e) => String(e.task?.id) === String(id))?.task?.title ?? `Task #${id}`;

  const today = localYmd(new Date());
  const todayMinutes =
    summary?.today_minutes ?? entries.filter((e) => e.date === today).reduce((a, e) => a + e.minutes, 0);
  const weekMinutes = summary?.week_total_minutes ?? 0;
  const targetPct = Math.min(100, Math.round((weekMinutes / WEEKLY_TARGET) * 100));

  const filtered = entries.filter((e) => {
    if (!filter) return true;
    return `${e.task?.title ?? ""} ${e.note ?? ""}`.toLowerCase().includes(filter.toLowerCase());
  });

  function exportCSV() {
    const rows = [
      ["Date", "Task", "Minutes", "Note"],
      ...filtered.map((e) => [e.date, e.task?.title ?? "", String(e.minutes), e.note ?? ""]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "time-entries.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Time Tracking</h1>
        <p className="mt-1 text-sm text-zinc-500">Today · {formatMinutes(todayMinutes)} logged</p>
      </header>

      {/* Currently tracking */}
      <section
        className={`rounded-2xl border p-5 ${
          timer.running ? "border-emerald-500/40 bg-emerald-500/5" : "border-zinc-800 bg-zinc-900/60"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-emerald-400">Currently tracking</div>
            <div className="mt-1 text-lg font-semibold text-white">
              {timer.running && timer.taskId ? taskTitle(timer.taskId) : "No timer running"}
            </div>
            <div className="text-sm text-zinc-500">
              {timer.running ? "Stop it from the task to save an entry" : "Start a timer from a task to track time"}
            </div>
          </div>
          <div
            className={`font-mono text-4xl font-bold tabular-nums ${
              timer.running ? "text-emerald-400" : "text-zinc-600"
            }`}
          >
            {formatClock(timer.running ? getElapsed() : 0)}
          </div>
        </div>
      </section>

      {/* This week + target */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">This week</h2>
            <span className="text-xs text-zinc-500">last 7 days</span>
          </div>
          {summary?.per_day?.length ? (
            <WeekBars data={summary.per_day} />
          ) : (
            <p className="py-12 text-center text-sm text-zinc-500">No time logged yet.</p>
          )}
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Total this week</span>
            <span className="text-lg font-bold text-white">{formatMinutes(weekMinutes)}</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-zinc-400">Weekly target</span>
            <span className="text-zinc-300">{formatMinutes(WEEKLY_TARGET)}</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${targetPct}%` }} />
          </div>
          <div className="mt-2 text-xs text-emerald-400">{targetPct}% of target</div>
        </div>
      </section>

      {/* Entries table */}
      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
        <div className="flex flex-col gap-3 border-b border-zinc-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-white">Logged entries</h2>
          <div className="flex gap-2">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by task or note…"
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white outline-none focus:border-emerald-500"
            />
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="px-5 py-6 text-sm text-zinc-500">No time entries.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-left font-medium">Task</th>
                <th className="px-5 py-3 text-left font-medium">Duration</th>
                <th className="hidden px-5 py-3 text-left font-medium md:table-cell">Note</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-t border-zinc-800/60 transition hover:bg-zinc-800/30">
                  <td className="px-5 py-3 text-zinc-400">{e.date}</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2 text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {e.task?.title ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-emerald-300">{formatMinutes(e.minutes)}</td>
                  <td className="hidden px-5 py-3 text-zinc-400 md:table-cell">{e.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
