"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import axiosClient from "@/lib/axiosClient";
import KanbanBoard from "@/components/KanbanBoard";
import EditTaskModal from "@/components/EditTaskModal";
import TaskModal from "@/components/TaskModal";
import { Task } from "@/lib/types";

const PRIORITIES = ["all", "high", "medium", "low"] as const;

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("all");
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesQuery =
        !q ||
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q);
      const matchesPriority =
        priority === "all" || (t.priority ?? "").toLowerCase() === priority;
      return matchesQuery && matchesPriority;
    });
  }, [tasks, query, priority]);

  async function loadTasks() {
    try {
      const { data } = await axiosClient.get("/my-tasks/");
      setTasks(data.results);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  }

  async function handleStatusChange(taskId: number, newStatus: string) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  await axiosClient.patch(
  `/projects/${task.project?.id || task.project}/tasks/${taskId}/`,
  { status: newStatus }
);


  loadTasks();
}


  useEffect(() => {
    loadTasks();
  }, []);

  // Cmd/Ctrl-K focuses the search box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">My Tasks</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              aria-label="Search tasks"
              className="w-56 rounded-lg border border-zinc-700 bg-zinc-900 py-2 pl-9 pr-12 text-sm text-white placeholder-zinc-500 focus:border-emerald-600 focus:outline-none"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
              ⌘K
            </kbd>
          </div>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as (typeof PRIORITIES)[number])}
            aria-label="Filter by priority"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-600 focus:outline-none"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p === "all" ? "All priorities" : p[0].toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <KanbanBoard
        tasks={filtered}
        onStatusChange={handleStatusChange}
        onViewTask={setViewTask}
      />

      {editTask && (
        <EditTaskModal
          open={!!editTask}
          task={editTask}
          teamMembers={[]}
          onClose={() => setEditTask(null)}
          onSaved={loadTasks}
          projectId={editTask.project.id}
        />
      )}

      {viewTask && (
        <TaskModal
          open={!!viewTask}
          task={viewTask}
          onClose={() => setViewTask(null)}
          onEditClick={viewTask.can_manage ? () => {
            setEditTask(viewTask);
            setViewTask(null);
          } : undefined}
          onDelete={viewTask.can_manage ? async () => {
            if (window.confirm("Delete this task?")) {
              await axiosClient.delete(`/projects/${viewTask.project.id}/tasks/${viewTask.id}/`);
              setViewTask(null);
              loadTasks();
            }
          } : undefined}
          onTaskUpdated={loadTasks}
          projectId={viewTask.project.id.toString()}
          teamMembers={[]}
        />
      )}
    </div>
  );
}
