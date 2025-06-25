// frontend/src/components/TimeTrackingCard.tsx

import React, { useEffect, useState } from "react";
import { getTimeSummary } from "@/lib/api";
import {
  Tooltip,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Bar,
} from "recharts";
import { Loader2 } from "lucide-react";

// Format helper
function formatMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export default function TimeTrackingCard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTimeSummary()
      .then((data) => setSummary(data))
      .finally(() => setLoading(false));
  }, []);

  let chartData: { date: string; minutes: number }[] = [];
  if (summary?.days) {
    chartData = Object.entries(summary.days).map(([date, min]) => ({
      date: date.slice(5),
      minutes: min as number,
    }));
  }

  const weekTotal = summary?.week_total_minutes ?? 0;
  const weekTarget = 8 * 7 * 60;

  return (
    <div className="bg-zinc-900 rounded-2xl shadow-xl px-7 py-6 flex flex-col gap-4 border border-zinc-800">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Time Tracked</h2>
        {loading && <Loader2 className="animate-spin text-zinc-400" size={20} />}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-4xl font-extrabold text-blue-400">
            {formatMinutes(weekTotal)}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            This week <span className="text-xs">(target: <b>{formatMinutes(weekTarget)}</b>)</span>
          </p>
        </div>

        {chartData.length > 0 && (
          <div className="w-full sm:w-64 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke="#aaa"
                />
                <YAxis hide />
                <Tooltip
                  labelFormatter={(v) => `Day: ${v}`}
                  formatter={(v) => [`${formatMinutes(Number(v))} tracked`, ""]}
                  wrapperClassName="!bg-zinc-900 !text-white !rounded !px-2 !py-1"
                />
                <Bar dataKey="minutes" radius={[6, 6, 0, 0]} fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-300 space-y-1">
        <p>
          Today: <b>{formatMinutes(summary?.today_minutes ?? 0)}</b>
        </p>
        <p>
          This week: <b>{formatMinutes(summary?.week_total_minutes ?? 0)}</b>
        </p>
        <p>
          Total tracked: <b>{formatMinutes(summary?.total_minutes ?? 0)}</b>
        </p>
      </div>
    </div>
  );
}
