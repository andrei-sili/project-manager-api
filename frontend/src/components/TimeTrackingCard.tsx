// src/components/TimeTrackingCard.tsx

"use client";

export default function TimeTrackingCard({ tasks, loading }: { tasks: any[]; loading?: boolean }) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  if (loading) {
    return (
      <div className="rounded-xl bg-zinc-800 shadow p-6 h-[120px] animate-pulse mb-4" />
    );
  }

  const totalMinutes = safeTasks.reduce(
    (acc: number, t: any) => acc + (typeof t.time_spent === "number" ? t.time_spent : 0),
    0
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div className="rounded-xl bg-zinc-900 shadow p-6 mb-4">
      <h3 className="text-lg font-bold mb-3">Time Tracking</h3>
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="text-3xl font-extrabold text-blue-400">
          {hours}h {minutes}m
        </div>
        <div className="text-sm text-gray-400 mb-3">Total time tracked (all tasks)</div>
      </div>
      <div className="mt-4">
        <span className="text-xs text-gray-500">
          {safeTasks.length} tasks with tracked time
        </span>
      </div>
    </div>
  );
}

