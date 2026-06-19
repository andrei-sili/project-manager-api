// frontend/src/app/dashboard/reports/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getProjects, getTimeSummary } from "@/lib/api";
import type { Project, TimeSummary } from "@/lib/types";
import StatCard from "@/components/StatCard";
import { stringToColor } from "@/lib/color";

function formatHours(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

const PROJECT_COLORS = ["#34d399", "#38bdf8", "#a78bfa", "#fbbf24", "#fb7185", "#2dd4bf"];

interface Member {
  name: string;
  email: string;
  completed: number;
  total: number;
}

export default function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<TimeSummary | null>(null);

  useEffect(() => {
    Promise.all([getProjects(), getTimeSummary().catch(() => null)]).then(([p, s]) => {
      setProjects(p);
      setSummary(s);
    });
  }, []);

  const allTasks = projects.flatMap((p) => p.tasks ?? []);
  const total = allTasks.length;
  const done = allTasks.filter((t) => t.status === "done").length;
  const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
  const todo = Math.max(0, total - done - inProgress);
  const completion = total ? Math.round((done / total) * 100) : 0;

  const statusData = [
    { name: "To Do", value: todo, color: "#60a5fa" },
    { name: "In Progress", value: inProgress, color: "#fbbf24" },
    { name: "Done", value: done, color: "#34d399" },
  ].filter((s) => s.value > 0);

  const projStats = projects.map((p, i) => {
    const tasks = p.tasks ?? [];
    const d = tasks.filter((t) => t.status === "done").length;
    return {
      name: p.name,
      total: tasks.length,
      done: d,
      pct: tasks.length ? Math.round((d / tasks.length) * 100) : 0,
      color: PROJECT_COLORS[i % PROJECT_COLORS.length],
    };
  });

  const memberMap = new Map<number, Member>();
  for (const t of allTasks) {
    const u = t.assigned_to && typeof t.assigned_to === "object" ? t.assigned_to : null;
    if (!u) continue;
    const entry = memberMap.get(u.id) ?? {
      name: `${u.first_name} ${u.last_name}`.trim() || u.email,
      email: u.email,
      completed: 0,
      total: 0,
    };
    entry.total++;
    if (t.status === "done") entry.completed++;
    memberMap.set(u.id, entry);
  }
  const members = [...memberMap.values()].sort((a, b) => b.completed - a.completed);
  const maxDone = Math.max(1, ...members.map((m) => m.completed));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Overview across {projects.length} project{projects.length !== 1 ? "s" : ""}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Completion rate" value={`${completion}%`} hint={`${done} of ${total} tasks`} positive={completion >= 50} />
        <StatCard label="Tasks completed" value={String(done)} hint="across all projects" positive={done > 0} />
        <StatCard label="Open tasks" value={String(todo + inProgress)} hint={`${inProgress} in progress`} />
        <StatCard label="Hours tracked" value={formatHours(summary?.total_minutes ?? 0)} hint="your total" positive />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {/* Tasks by status donut */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="mb-2 font-semibold text-white">Tasks by status</h2>
          <div className="relative h-64">
            {statusData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={3}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {statusData.map((s, i) => (
                      <Cell key={i} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">No tasks yet.</div>
            )}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{total}</span>
              <span className="text-xs text-zinc-500">tasks</span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs">
            {statusData.map((s) => (
              <span key={s.name} className="flex items-center gap-1.5 text-zinc-400">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>

        {/* Completion by project */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="mb-4 font-semibold text-white">Completion by project</h2>
          <div className="space-y-4">
            {projStats.length === 0 ? (
              <p className="text-sm text-zinc-500">No projects.</p>
            ) : (
              projStats.map((p) => (
                <div key={p.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-zinc-300">
                      <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                      {p.name}
                    </span>
                    <span className="text-zinc-500">
                      {p.done}/{p.total} · {p.pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Member contribution table */}
      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
        <div className="border-b border-zinc-800 px-5 py-4">
          <h2 className="font-semibold text-white">Member contribution</h2>
        </div>
        {members.length === 0 ? (
          <p className="px-5 py-6 text-sm text-zinc-500">No assigned tasks yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-5 py-3 text-left font-medium">Member</th>
                <th className="px-5 py-3 text-left font-medium">Completed</th>
                <th className="px-5 py-3 text-left font-medium">Assigned</th>
                <th className="hidden px-5 py-3 text-left font-medium sm:table-cell">Contribution</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.email} className="border-t border-zinc-800/60 transition hover:bg-zinc-800/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: stringToColor(m.email) }}
                      >
                        {initials(m.name)}
                      </span>
                      <span className="font-medium text-white">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-zinc-300">{m.completed}</td>
                  <td className="px-5 py-3 text-zinc-400">{m.total}</td>
                  <td className="hidden px-5 py-3 sm:table-cell">
                    <div className="h-2 w-40 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${Math.round((m.completed / maxDone) * 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
