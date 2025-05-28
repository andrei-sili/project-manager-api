"use client";
import { useEffect, useState } from "react";
import { fetchTasks, Task } from "@/lib/api";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch(() => setError("Failed to load tasks"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Loading tasks…</p>;
  if (error)   return <p className="p-6 text-red-400">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Tasks</h1>
      <ul className="list-disc pl-5 space-y-2">
        {tasks.map((t) => (
          <li key={t.id}>
            <input
              type="checkbox"
              checked={t.completed}
              readOnly
              className="mr-2"
            />
            {t.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
