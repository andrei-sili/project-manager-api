import React from "react";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  positive?: boolean;
  icon?: React.ReactNode;
}

/** Compact KPI card: small label, large value, optional context line. */
export default function StatCard({ label, value, hint, positive, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</span>
        {icon && <span className="text-zinc-400">{icon}</span>}
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</div>
      {hint && (
        <div className={`mt-2 text-xs ${positive ? "text-emerald-400" : "text-zinc-400"}`}>{hint}</div>
      )}
    </div>
  );
}
