// frontend/src/components/WeekBars.tsx
import React from "react";
import type { TimeSummaryDay } from "@/lib/types";

function formatMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

function localYmd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Minimalist weekly bar chart; the current day is highlighted in emerald. */
export default function WeekBars({ data }: { data: TimeSummaryDay[] }) {
  const today = localYmd(new Date());
  const max = Math.max(1, ...data.map((d) => d.minutes));

  return (
    <div className="flex items-end justify-between gap-2 pt-6">
      {data.map((d) => {
        const isToday = d.date === today;
        const height = d.minutes > 0 ? Math.max(8, Math.round((d.minutes / max) * 120)) : 4;
        const weekday = new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" });
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-[120px] w-full items-end justify-center">
              <div
                title={`${weekday}: ${formatMinutes(d.minutes)}`}
                className={`w-6 rounded-md transition-all sm:w-8 ${
                  isToday ? "bg-emerald-400 shadow-lg shadow-emerald-500/40" : "bg-zinc-800"
                }`}
                style={{ height: `${height}px` }}
              />
            </div>
            <span className={`text-xs ${isToday ? "font-semibold text-emerald-400" : "text-zinc-500"}`}>
              {weekday}
            </span>
          </div>
        );
      })}
    </div>
  );
}
