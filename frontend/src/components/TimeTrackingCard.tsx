// frontend/src/components/TimeTrackingCard.tsx

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import api from "@/lib/api";

interface PerDay {
  date: string;
  minutes: number;
}

interface TimeSummary {
  total_minutes: number;
  per_day: PerDay[];
}

interface Props {
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

const dailyTarget = 480; // 8h/day

const TimeTrackingCard: React.FC<Props> = ({ loading }) => {
  const [summary, setSummary] = useState<TimeSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!loading);

  useEffect(() => {
  setIsLoading(true);
  api
    .get("/time-entries/summary/")
    .then((res) => setSummary(res.data))
    .catch(() => setSummary(null))
    .finally(() => setIsLoading(false));
}, []);

  const progress =
    summary && summary.total_minutes
      ? Math.min(100, ((summary.total_minutes / dailyTarget) * 100) || 0)
      : 0;

  return (
    <div className="bg-zinc-900 rounded-2xl shadow p-5 flex flex-col gap-3 mb-4 min-w-[250px]">
      <div className="flex items-center gap-2 text-lg font-bold text-blue-400">
        <Clock className="w-5 h-5" />
        Time Tracked
      </div>
      {isLoading ? (
        <div className="text-gray-400 text-center my-4">Loading...</div>
      ) : summary ? (
        <>
          <div className="text-3xl font-extrabold text-white text-center">
            {formatTime(summary.total_minutes)}
          </div>
          <div className="text-xs text-gray-400 text-center mb-2">
            This week (target: 8h/day)
          </div>
          <div className="w-full h-2 rounded bg-zinc-800">
            <div
              className="h-2 rounded bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Mini-graph with last 7 days */}
          <div className="flex justify-between items-end gap-1 mt-3">
            {summary.per_day.map((d) => (
              <div key={d.date} className="flex flex-col items-center w-6">
                <div
                  className={`rounded-t bg-blue-500`}
                  style={{
                    height: `${Math.min((d.minutes / dailyTarget) * 40, 40)}px`,
                    width: "100%",
                    minHeight: "4px",
                    opacity: d.minutes > 0 ? 1 : 0.4,
                  }}
                  title={`${d.minutes} min`}
                />
                <span className="text-[10px] text-gray-500 mt-1">
                  {d.date.slice(5)} {/* MM-DD */}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-gray-400 text-center">No time tracked yet.</div>
      )}
      <button
        className="mt-3 mx-auto px-4 py-1 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm shadow transition"
        disabled
        title="Coming soon"
      >
        View details
      </button>
    </div>
  );
};

export default TimeTrackingCard;
