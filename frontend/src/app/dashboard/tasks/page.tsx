"use client";
import { useEffect, useState } from "react";
import { Task, fetchMyTasks } from "@/lib/api";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyTasks()
      .then((data) => {
        setTasks(data);
      })
      .catch((err) => {
        console.error("Failed to fetch tasks", err);
        setError("Could not load tasks.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Loading tasks…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">My Tasks</h1>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={task.completed}
              readOnly
              className="w-5 h-5"
            />
            <span className={task.completed ? "line-through text-gray-400" : ""}>
              {task.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
