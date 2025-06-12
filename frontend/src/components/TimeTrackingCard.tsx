// Path: frontend/src/components/TimeTrackingCard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { fetchTimeEntries } from "@/lib/api";

interface Summary {
  total_hours: number;
  daily: { date: string; hours: number }[];
}

export default function TimeTrackingCard(): React.JSX.Element {
  const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    setIsLoading(true);
    fetchTimeEntries(token)
      .then((entries) => {
        const total_hours = entries.reduce(
          (sum: number, e: { duration?: number }) => sum + (e.duration ?? 0),
          0
        );
        const daily = entries.map((e: { date: string; duration?: number }) => ({
          date: e.date,
          hours: e.duration ?? 0,
        }));
        setSummary({ total_hours, daily });
      })
      .catch(() => {
        setSummary(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  return (
    <div className="bg-gray-800 rounded-xl p-5 flex flex-col justify-between">
      <div className="flex items-center text-white mb-4">
        <Clock className="mr-2" />
        <h2 className="text-lg font-medium">Time Tracked</h2>
      </div>

      {isLoading ? (
        <p className="text-gray-400">Loading…</p>
      ) : summary ? (
        <>
          <div className="text-3xl font-bold text-white mb-2">
            {summary.total_hours}h
          </div>
          <p className="text-sm text-gray-400 mb-4">
            This week (target: 8h/day)
          </p>
          <div className="h-1 bg-gray-700 rounded-full mb-3">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(summary.total_hours / (8 * 7)) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs text-gray-400">
            {summary.daily.map((d) => (
              <div key={d.date} className="text-center">
                {new Date(d.date).getDate()}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-500">No data available</p>
      )}

      <button
        onClick={() => {
          // Future feature: navigate to time tracking details
        }}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        View details
      </button>
    </div>
  );
}
