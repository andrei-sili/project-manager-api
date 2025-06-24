// frontend/src/components/EditTaskModal.tsx
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { User, Task, TeamMember, TaskStatus } from "@/lib/types";


interface EditTaskModalProps {
  open: boolean;
  task: any;
  teamMembers: TeamMember[];
  projectId: number;
  onClose: () => void;
  onSaved?: () => void;
}

export default function EditTaskModal({
  open,
  task,
  teamMembers,
  projectId,
  onClose,
  onSaved,
}: EditTaskModalProps) {
  // Form state
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [dueDate, setDueDate] = useState(
    task?.due_date ? formatDateInput(task.due_date) : ""
  );
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [status, setStatus] = useState(task?.status || "todo");
  const [assignee, setAssignee] = useState<number | "">(
  task.assigned_to && typeof task.assigned_to === "object"
    ? task.assigned_to.id
    : ""
);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Update form when task changes
  useEffect(() => {
    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setDueDate(task?.due_date ? formatDateInput(task.due_date) : "");
    setPriority(task?.priority || "medium");
    setStatus(task?.status || "todo");
    setAssignee(
  task?.assigned_to && typeof task.assigned_to === "object"
    ? task.assigned_to.id
    : typeof task?.assigned_to === "number"
      ? task.assigned_to
      : ""
);

    setError("");
    setSuccess("");
  }, [task, open]);

  if (!open) return null;

  // PATCH request to update task
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${task.id}/`,
        {
          title,
          description,
          due_date: dueDate ? dueDate + "T23:59:59" : null,
          priority,
          status,
          assigned_to: assignee || null,
          project: projectId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      setSuccess("Task updated!");
      onSaved && onSaved();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          JSON.stringify(err?.response?.data, null, 2) ||
          "Could not update task."
      );
    } finally {
      setLoading(false);
    }
  };

  // DELETE request
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setLoading(true);
    setError("");
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${task.id}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      onSaved && onSaved();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          JSON.stringify(err?.response?.data, null, 2) ||
          "Could not delete task."
      );
    } finally {
      setLoading(false);
    }
  };

  // Status/priority colors
  function statusColor(s: string) {
    return s === "todo"
      ? "bg-zinc-600"
      : s === "in_progress"
      ? "bg-yellow-600"
      : s === "done"
      ? "bg-green-700"
      : "bg-zinc-600";
  }
  function priorityColor(p: string) {
    return p === "low"
      ? "bg-green-700"
      : p === "medium"
      ? "bg-yellow-700"
      : p === "high"
      ? "bg-red-700"
      : "bg-zinc-600";
  }

  // Format for input type="date"
  function formatDateInput(date: string) {
    // Accepts "2025-06-07T23:59:59" or "2025-06-07"
    return date?.slice(0, 10) || "";
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70">
      <form
          className="bg-zinc-900 border border-blue-700 p-6 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-4 animate-fade-in relative"
          onSubmit={handleSubmit}
      >
        {/* Close */}
        <button
            type="button"
            className="absolute top-4 right-4 text-gray-400 hover:text-blue-400 text-xl"
            onClick={onClose}
            tabIndex={-1}
        >
          <X size={24}/>
        </button>
        <div className="text-xl font-bold mb-1">Edit Task</div>
        <label className="text-sm font-semibold">Title
          <input
              className="mt-1 bg-zinc-800 p-2 rounded w-full outline-none border border-zinc-700 focus:ring-2 focus:ring-blue-700"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
          />
        </label>
        <label className="text-sm font-semibold">Description
          <textarea
              className="mt-1 bg-zinc-800 p-2 rounded w-full outline-none border border-zinc-700 focus:ring-2 focus:ring-blue-700"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
          />
        </label>
        <label className="text-sm font-semibold">Due Date
          <input
              type="date"
              className="mt-1 bg-zinc-800 p-2 rounded w-full outline-none border border-zinc-700 focus:ring-2 focus:ring-blue-700"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
          />
        </label>
        {/* Dynamic colors for status/priority */}
        <div className="flex gap-2">
          <label className="flex-1 text-sm font-semibold">Priority
            <select
                className="mt-1 p-2 rounded w-full outline-none border border-zinc-700 focus:ring-2 focus:ring-blue-500 bg-zinc-800 text-white"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
            >
              <option value="low" className="text-green-400">Low</option>
              <option value="medium" className="text-yellow-400">Medium</option>
              <option value="high" className="text-red-400">High</option>
            </select>
          </label>
          <label className="flex-1 text-sm font-semibold">Status
            <select
                className="mt-1 p-2 rounded w-full outline-none border border-zinc-700 focus:ring-2 focus:ring-blue-500 bg-zinc-800 text-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
            >
              <option value="todo" className="text-zinc-200">To Do</option>
              <option value="in_progress" className="text-yellow-400">In Progress</option>
              <option value="done" className="text-green-400">Done</option>
            </select>
          </label>
        </div>
        <label className="text-sm">Assignee
          <select
              value={assignee}
              onChange={e => setAssignee(Number(e.target.value) || "")}
              className="w-full px-3 py-2 mt-1 rounded-md bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— No assignee —</option>
            {teamMembers.map((m: any) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.first_name} {m.user.last_name}
                </option>
            ))}
          </select>
        </label>

        {/* Error & Success messages */}
        {error && (
            <div className="text-red-400 text-sm whitespace-pre-wrap">
              {error}
            </div>
        )}
        {success && (
            <div className="text-green-400 text-sm">{success}</div>
        )}
        {/* Action buttons */}
        <div className="flex gap-2 mt-2">
          <button
              type="submit"
              className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded transition disabled:opacity-50"
              disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
              type="button"
              className="flex-1 bg-gray-700 hover:bg-zinc-700 text-white py-2 rounded transition"
              onClick={onClose}
              disabled={loading}
          >
            Cancel
          </button>
          <button
              type="button"
              className="flex-1 bg-red-700 hover:bg-red-800 text-white py-2 rounded transition"
              onClick={handleDelete}
              disabled={loading}
          >
            Delete
          </button>
        </div>
      </form>
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.20s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
