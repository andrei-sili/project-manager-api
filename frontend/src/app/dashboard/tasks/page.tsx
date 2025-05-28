// frontend/src/app/dashboard/tasks/page.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchMyTasks, Task } from "@/lib/api";

export default function MyTasksPage() {
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetchMyTasks()
      .then((data) => {
        console.log("❯❯ my tasks:", data);
        setTasks(data);
      })
      .catch((err) => {
        console.error("Fetch my-tasks error:", err);
        setError("Nu am putut încărca task-urile tale");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Se încarcă task-urile tale…</p>;
  if (error)   return <p className="p-6 text-red-400">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Task-urile mele</h1>
      <ul className="list-disc pl-5 space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center">
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
