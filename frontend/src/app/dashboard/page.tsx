// frontend/src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects, getTimeSummary, getActivity } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import type { Project, TimeSummary, ActivityLog } from "@/lib/types";
import StatCard from "@/components/StatCard";
import WeekBars from "@/components/WeekBars";
import ActivityFeed from "@/components/ActivityFeed";

function formatHours(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const PROJECT_COLORS = [
  "bg-emerald-400",
  "bg-sky-400",
  "bg-violet-400",
  "bg-amber-400",
  "bg-rose-400",
  "bg-teal-400",
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<TimeSummary | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);

  useEffect(() => {
    Promise.all([
      getProjects(),
      getTimeSummary().catch(() => null),
      getActivity(6).catch(() => [] as ActivityLog[]),
    ]).then(([p, s, a]) => {
      setProjects(p);
      setSummary(s);
      setActivity(a);
    });
  }, []);

  const allTasks = projects.flatMap((p) => p.tasks ?? []);
  const total = allTasks.length;
  const done = allTasks.filter((t) => t.status === "done").length;
  const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
  const completion = total ? Math.round((done / total) * 100) : 0;
  const weekMinutes = summary?.week_total_minutes ?? 0;
  const todayMinutes = summary?.today_minutes ?? 0;
  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">
          {greeting()}, <span className="text-emerald-400">{user?.first_name ?? "there"}</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {dateStr} · {projects.length} project{projects.length !== 1 ? "s" : ""} active
        </p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Tasks completed" value={String(done)} hint={`of ${total} total`} positive={done > 0} />
        <StatCard label="In progress" value={String(inProgress)} hint={`across ${projects.length} projects`} />
        <StatCard label="Hours this week" value={formatHours(weekMinutes)} hint={`${formatHours(todayMinutes)} today`} positive />
        <StatCard label="Completion" value={`${completion}%`} hint={`${done} of ${total} tasks`} positive={completion >= 50} />
      </section>

      {/* Hours + Activity */}
      <section className="grid items-start gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Hours tracked</h2>
            <span className="text-xs text-zinc-500">this week</span>
          </div>
          {summary?.per_day?.length ? (
            <WeekBars data={summary.per_day} />
          ) : (
            <p className="py-12 text-center text-sm text-zinc-500">No time logged yet.</p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="mb-4 font-semibold text-white">Recent activity</h2>
          <ActivityFeed items={activity} />
        </div>
      </section>

      {/* Project progress */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h2 className="mb-4 font-semibold text-white">Project progress</h2>
        <div className="space-y-4">
          {projects.length === 0 ? (
            <p className="text-sm text-zinc-500">No projects yet.</p>
          ) : (
            projects.map((p, i) => {
              const tasks = p.tasks ?? [];
              const projDone = tasks.filter((t) => t.status === "done").length;
              const pct = tasks.length ? Math.round((projDone / tasks.length) * 100) : 0;
              const color = PROJECT_COLORS[i % PROJECT_COLORS.length];
              return (
                <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="group block">
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-zinc-300 group-hover:text-white">
                      <span className={`h-2 w-2 rounded-full ${color}`} />
                      {p.name}
                    </span>
                    <span className="text-zinc-500">{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
