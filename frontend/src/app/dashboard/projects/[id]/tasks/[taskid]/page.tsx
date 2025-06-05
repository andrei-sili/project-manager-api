// frontend/src/app/dashboard/projects/[id]/tasks/[taskid]/page.tsx

"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Task detail page using params from [id] (project) and [taskid] (task).
 */
export default function TaskDetailPage() {
  // Use the exact param names that match the folder structure: [id] and [taskid]
  const params = useParams();
  const { id, taskid } = params as { id: string; taskid: string };

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch task details by project id and task id
  useEffect(() => {
    if (!id || !taskid) return;
    setLoading(true);
    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}/tasks/${taskid}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      )
      .then((res) => setTask(res.data))
      .catch(() => setError("Task not found."))
      .finally(() => setLoading(false));
  }, [id, taskid]);

  if (loading)
    return <div className="text-gray-400 px-8 py-16">Loading task details...</div>;
  if (error || !task)
    return (
      <div className="text-red-400 px-8 py-16">{error || "Not found."}</div>
    );

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-zinc-900 rounded-2xl shadow-xl p-8">
      {/* Back to project button */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href={`/dashboard/projects/${id}`}
          className="text-gray-400 hover:text-blue-400 flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Back to project
        </Link>
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

      {/* Placeholder for future: Comments, Files, Activity log */}
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
