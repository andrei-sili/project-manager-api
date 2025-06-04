// src/components/MyTasksCard.tsx

"use client";
import Link from "next/link";
import { ListTodo } from "lucide-react";

export default function MyTasksCard({ tasks, loading }: { tasks: any[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="rounded-xl bg-zinc-800 shadow p-6 h-[120px] animate-pulse mb-4" />
    );
  }

  const completed = tasks.filter((t) => t.status === "done").length;
  const total = tasks.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-xl bg-zinc-900 shadow p-6 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">My Tasks</h3>
        <Link
          href="/dashboard/tasks"
          className="flex items-center gap-2 text-blue-400 hover:underline font-medium"
        >
          <ListTodo className="w-5 h-5" />
          View All
        </Link>
      </div>
      {(!tasks || tasks.length === 0) ? (
        <div className="text-gray-400 text-sm">You have no assigned tasks.</div>
      ) : (
        <>
          <div className="mb-2 flex items-center gap-3 text-sm">
            <span className="font-medium text-green-400">{completed}</span>
            <span className="text-gray-400">done</span>
            <span className="text-gray-500">/</span>
            <span className="font-medium text-blue-400">{total}</span>
            <span className="text-gray-400">total</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full mb-2 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ul className="flex flex-wrap gap-4">
            {tasks.slice(0, 4).map((task) => (
              <li key={task.id} className="bg-zinc-800 rounded px-3 py-2 min-w-[140px] flex-1 shadow">
                <Link href={`/dashboard/tasks`}>
                  <div className="font-medium text-white text-base truncate">{task.title}</div>
                  <div className="text-xs text-gray-400">{task.status === "done" ? "✅ Done" : task.status.replace("_", " ")}</div>
                  {task.project && (
                    <div className="mt-1 text-xs text-gray-500">{task.project.name}</div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
