// frontend/src/app/dashboard/tasks/[id]/page.tsx

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id;

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!taskId) return;
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/my-tasks/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      })
      .then((res) => {
        // Găsim taskul după id (my-tasks returnează toate taskurile utilizatorului)
        const found = Array.isArray(res.data.results)
          ? res.data.results.find((t: any) => String(t.id) === String(taskId))
          : null;
        setTask(found);
        if (!found) setError("Task not found.");
      })
      .catch(() => setError("Task not found."))
      .finally(() => setLoading(false));
  }, [taskId]);

  if (loading)
    return (
      <div className="text-gray-400 px-8 py-16">Loading task details...</div>
    );
  if (error || !task)
    return (
      <div className="text-red-400 px-8 py-16">{error || "Not found."}</div>
    );

  // Stil: card mare, info task + spațiu pentru taburi (comments, files, log)
  return (
    <div className="max-w-3xl mx-auto mt-10 bg-zinc-900 rounded-2xl shadow-xl p-8">
      {/* Back button */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-blue-400 flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <span className="text-xl font-bold ml-4">{task.title}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <div className="mb-2">
            <span className="text-gray-400">Status:</span>{" "}
            <span
              className={`inline-block px-2 py-1 rounded text-white text-xs font-bold ${
                task.status === "done"
                  ? "bg-green-700"
                  : task.status === "in_progress"
                  ? "bg-yellow-700"
                  : "bg-zinc-700"
              }`}
            >
              {task.status?.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <div className="mb-2">
            <span className="text-gray-400">Priority:</span>{" "}
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                task.priority === "high"
                  ? "bg-red-700 text-white"
                  : task.priority === "medium"
                  ? "bg-yellow-700 text-white"
                  : "bg-green-800 text-white"
              }`}
            >
              {task.priority?.toUpperCase()}
            </span>
          </div>
          <div className="mb-2">
            <span className="text-gray-400">Due date:</span>{" "}
            {task.due_date ? (
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            ) : (
              <span className="text-gray-600">No due date</span>
            )}
          </div>
        </div>
        <div>
          <div className="mb-2">
            <span className="text-gray-400">Assigned to:</span>{" "}
            <span>{task.assigned_to_name || task.assigned_to || "—"}</span>
          </div>
          <div className="mb-2">
            <span className="text-gray-400">Project:</span>{" "}
            <span>{task.project?.name || task.project || "—"}</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="text-gray-400 mb-1">Description:</div>
        <div className="text-white whitespace-pre-line">{task.description}</div>
      </div>

      {/* Placeholder tabs: aici vor veni Comments, Files, Activity */}
      <div className="mt-8 grid md:grid-cols-3 gap-5">
        <div className="bg-zinc-800 rounded-xl p-5 shadow border border-zinc-700">
          <div className="font-bold text-lg text-white mb-2">Comments</div>
          <div className="text-gray-500 text-sm">Coming soon…</div>
        </div>
        <div className="bg-zinc-800 rounded-xl p-5 shadow border border-zinc-700">
          <div className="font-bold text-lg text-white mb-2">Files</div>
          <div className="text-gray-500 text-sm">Coming soon…</div>
        </div>
        <div className="bg-zinc-800 rounded-xl p-5 shadow border border-zinc-700">
          <div className="font-bold text-lg text-white mb-2">Activity</div>
          <div className="text-gray-500 text-sm">Coming soon…</div>
        </div>
      </div>
    </div>
  );
}
