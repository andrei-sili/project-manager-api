// frontend/src/components/TimeTrackingCard.tsx

import React, { useEffect, useState } from "react";
import { getTimeSummary } from "@/lib/api";
import {Tooltip, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar} from 'recharts';
import { Loader2 } from "lucide-react";

// Helper to format minutes to "Xh Ym"
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
      .then(data => setSummary(data))
      .finally(() => setLoading(false));
  }, []);

  // Prepare data for chart (show last 7 days)
  let chartData: { date: string, minutes: number }[] = [];
  if (summary && summary.days) {
    chartData = Object.entries(summary.days).map(([date, min]) => ({
      date: date.slice(5), // MM-DD for axis
      minutes: min as number,
    }));
  }

  // Calculate week total
  const weekTotal = summary?.week_total_minutes ?? 0;
  const weekTarget = 8 * 7 * 60;
  return (
    <div className="bg-zinc-900 rounded-2xl shadow-xl px-7 py-6 flex flex-col gap-2 border border-zinc-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-semibold text-white">Time Tracked</span>
        {loading && <Loader2 className="animate-spin text-zinc-400" size={20}/>}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 mb-4">
        <div className="flex flex-col">
          <span className="text-3xl font-extrabold text-blue-400">{formatMinutes(weekTotal)}</span>
          <span className="text-sm text-gray-400">This week (target: <b>{formatMinutes(weekTarget)}</b>)</span>
        </div>
        <div className="w-full sm:w-56 h-28 flex items-end">
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
  <BarChart data={chartData}>
    <CartesianGrid vertical={false} strokeDasharray="2 3" />
    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
    <YAxis hide />
    <Tooltip
      labelFormatter={(v) => `Day: ${v}`}
      formatter={(v) => [`${formatMinutes(Number(v))} tracked`, ""]}
      wrapperClassName="!bg-zinc-900 !text-white !rounded !px-2 !py-1"
    />
    <Bar dataKey="minutes" radius={[6, 6, 0, 0]} />
  </BarChart>
</ResponsiveContainer>



          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 text-xs text-gray-300">
        <span>Today: <b>{formatMinutes(summary?.today_minutes ?? 0)}</b></span>
        <span>This week: <b>{formatMinutes(summary?.week_total_minutes ?? 0)}</b></span>
        <span>Total tracked: <b>{formatMinutes(summary?.total_minutes ?? 0)}</b></span>
      </div>
    </div>
  );
}
