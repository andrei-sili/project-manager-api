"use client";
import React, { useEffect, useState } from "react";
import { getAllTimeEntries, getTimeSummary } from "@/lib/api";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Loader2, Download } from "lucide-react";
import type { TimeEntry } from "@/lib/types";

// Colors for pie chart
const COLORS = ["#2563eb", "#10b981", "#f59e42", "#a21caf", "#f43f5e", "#fbbf24", "#4b5563"];

function formatMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export default function TimeTrackingPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(""); // Filter by task title or note

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAllTimeEntries(),
      getTimeSummary(),
    ])
      .then(([entries, summary]) => {
        setEntries(entries);
        setSummary(summary);
      })
      .finally(() => setLoading(false));
  }, []);

  // Pie chart data: minutes per task
  const pieData = React.useMemo(() => {
    const byTask: { [task: string]: number } = {};
    for (const entry of entries) {
      const taskName =
        typeof entry.task === "object"
          ? entry.task.title
          : `Task #${entry.task}`;
      byTask[taskName] = (byTask[taskName] || 0) + entry.minutes;
    }
    return Object.entries(byTask).map(([name, value]) => ({
      name,
      value,
    }));
  }, [entries]);

  // Bar chart data: per day
  const barData =
    summary && summary.per_day
      ? summary.per_day.map((item: { date: string; minutes: number }) => ({
          date: item.date.slice(5),
          minutes: item.minutes,
        }))
      : [];

  // Export CSV
  function exportCSV() {
    const csv = [
      ["Date", "Task", "Minutes", "Note"],
      ...filteredEntries.map(e => [
        e.date,
        typeof e.task === "object" ? e.task.title : `Task #${e.task}`,
        e.minutes,
        e.note ?? ""
      ])
    ].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "time-entries.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Filtered entries for table
  const filteredEntries = React.useMemo(() => {
    if (!filter) return entries;
    return entries.filter(e =>
      ((typeof e.task === "object" ? e.task.title : "") + " " + (e.note ?? "")).toLowerCase().includes(filter.toLowerCase())
    );
  }, [entries, filter]);

  return (
    <div className="max-w-6xl mx-auto px-3 py-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-400 flex items-center gap-3">
        <span role="img" aria-label="clock">🕒</span>
        Time Tracking
      </h1>

      {/* --- Bar Chart: Time Per Day --- */}
      <div className="bg-zinc-900 rounded-2xl p-6 shadow border border-zinc-800 mb-8">
        <h2 className="text-lg text-white font-semibold mb-3">Time Logged Per Day (last 7 days)</h2>
        <div className="h-56">
          {loading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-zinc-400" size={24}/></div>
          ) : barData.length === 0 ? (
            <div className="text-gray-400 flex items-center justify-center h-full">No data for the last 7 days.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid vertical={false} strokeDasharray="2 3" />
                <XAxis dataKey="date" fontSize={13} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip
                  labelFormatter={v => `Day: ${v}`}
                  formatter={v => [`${formatMinutes(Number(v))} tracked`, ""]}
                  wrapperClassName="!bg-zinc-900 !text-white !rounded !px-2 !py-1"
                />
                <Bar dataKey="minutes" radius={[8, 8, 0, 0]} fill="#2563eb" isAnimationActive={true} animationDuration={700} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* --- Row: Pie Chart + Summary --- */}
      <div className="flex flex-col md:flex-row gap-7 mb-8">
        <div className="bg-zinc-900 rounded-2xl p-6 shadow border border-zinc-800 flex-1 min-w-[320px]">
          <h2 className="text-lg text-white font-semibold mb-3">Total Time by Task</h2>
          <div className="h-72 flex items-center justify-center">
            {loading ? (
              <Loader2 className="animate-spin text-zinc-400" size={24}/>
            ) : pieData.length === 0 ? (
              <div className="text-gray-400">No time logged yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    fill="#2563eb"
                    label={({ name, value }) => `${name}: ${formatMinutes(Number(value))}`}
                    isAnimationActive={true}
                    animationDuration={900}
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip
                    formatter={v => `${formatMinutes(Number(v))} tracked`}
                    wrapperClassName="!bg-zinc-900 !text-white !rounded !px-2 !py-1"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        {/* Sumar */}
        <div className="flex flex-col gap-4 justify-center min-w-[210px]">
          <div className="bg-zinc-900 rounded-xl px-5 py-3 border border-zinc-800 text-blue-300 font-bold">
            Today: <span className="text-white">{formatMinutes(summary?.today_minutes ?? 0)}</span>
          </div>
          <div className="bg-zinc-900 rounded-xl px-5 py-3 border border-zinc-800 text-blue-300 font-bold">
            This week: <span className="text-white">{formatMinutes(summary?.week_total_minutes ?? 0)}</span>
          </div>
          <div className="bg-zinc-900 rounded-xl px-5 py-3 border border-zinc-800 text-blue-300 font-bold">
            Total tracked: <span className="text-white">{formatMinutes(summary?.total_minutes ?? 0)}</span>
          </div>
        </div>
      </div>

      {/* --- Time Entries Table --- */}
      <div className="bg-zinc-900 rounded-2xl shadow border border-zinc-800 p-6">
        <div className="flex flex-col md:flex-row gap-2 mb-4 items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Logged Time Entries</h2>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filter by task or note…"
              className="bg-zinc-800 text-white px-3 py-2 rounded border border-zinc-700 text-sm"
            />
            <button
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded text-white font-bold"
              onClick={exportCSV}
              title="Export CSV"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-zinc-400" size={24}/></div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-gray-400">No time entries yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-zinc-700">
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Task</th>
                  <th className="px-3 py-2 text-left">Minutes</th>
                  <th className="px-3 py-2 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry: TimeEntry) => (
                  <tr key={entry.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="px-3 py-2">{entry.date}</td>
                    <td className="px-3 py-2">
                      {typeof entry.task === "object"
                        ? entry.task.title
                        : `Task #${entry.task}`}
                    </td>
                    <td className="px-3 py-2">{entry.minutes}</td>
                    <td className="px-3 py-2">{entry.note || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
