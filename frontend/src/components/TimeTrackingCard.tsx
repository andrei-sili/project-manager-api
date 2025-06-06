// frontend/src/components/TimeTrackingCard.tsx

import React from "react";
import { Clock } from "lucide-react";

interface Task {
  id: number;
  spent_time?: number; // in minutes, poate fi null dacă nu ai încă acest câmp
}

interface Props {
  tasks: Task[];
  loading?: boolean;
}

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  if (m) return `${m}m`;
  return "0m";
}

export default function TimeTrackingCard({ tasks, loading }: Props) {
  // Sumar total (poți adapta să fie doar “azi”, dacă ai info per zi)
  const totalMinutes = (tasks || []).reduce(
    (sum, t) => sum + (t.spent_time || 0),
    0
  );

  // DEMO: target 8h/zi = 480min
  const dailyTarget = 480;
  const progress = Math.min(100, ((totalMinutes / dailyTarget) * 100) || 0);

  return (
    <div className="bg-zinc-900 rounded-2xl shadow p-5 flex flex-col gap-3 mb-4">
      <div className="flex items-center gap-2 text-lg font-bold text-blue-400">
        <Clock className="w-5 h-5" />
        Time Tracked
      </div>
      {loading ? (
        <div className="text-gray-400 text-center my-4">Loading...</div>
      ) : (
        <>
          <div className="text-3xl font-extrabold text-white text-center">
            {formatTime(totalMinutes)}
          </div>
          <div className="text-xs text-gray-400 text-center mb-2">
            {`Today (target: 8h)`}
          </div>
          <div className="w-full h-2 rounded bg-zinc-800">
            <div
              className="h-2 rounded bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      )}
      <button
        className="mt-3 mx-auto px-4 py-1 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm shadow transition"
        // onClick={() => router.push("/dashboard/time-tracking")} // activezi când ai pagina
        disabled
        title="Coming soon"
      >
        View details
      </button>
    </div>
  );
}
