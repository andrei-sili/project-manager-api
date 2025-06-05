// frontend/src/components/EditTaskModal.tsx
"use client";
import { useState } from "react";
import axios from "axios";

// Definește tipul pentru un task (poți adapta dacă ai deja un tip global)
interface EditTaskModalProps {
  open: boolean;
  task: any;
  teamMembers: any[];
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
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [dueDate, setDueDate] = useState(
    task?.due_date ? task.due_date.slice(0, 10) : ""
  );
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [status, setStatus] = useState(task?.status || "todo");
  const [assigneeEmail, setAssigneeEmail] = useState(
    task?.assigned_to_email || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!open) return null;

  // PATCH
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
          due_date: dueDate + "T23:59:59",
          priority,
          status,
          assigned_to: assigneeEmail || null,
          project: projectId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      setSuccess("Task updated!");
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      setError(
        JSON.stringify(err?.response?.data, null, 2) ||
          err?.response?.data?.detail ||
          "Could not update task."
      );
    } finally {
      setLoading(false);
    }
  };

  // DELETE
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
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      setError(
        JSON.stringify(err?.response?.data, null, 2) ||
          err?.response?.data?.detail ||
          "Could not delete task."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
      <form
        className="bg-zinc-900 p-6 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-4 border border-blue-700"
        onSubmit={handleSubmit}
      >
        <div className="flex justify-between items-center mb-1">
          <div className="text-lg font-bold">Edit Task</div>
          <button
            type="button"
            className="text-gray-400 hover:text-red-400 text-xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <label className="text-sm">Title
          <input
            className="mt-1 bg-zinc-800 p-2 rounded w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className="text-sm">Description
          <textarea
            className="mt-1 bg-zinc-800 p-2 rounded w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
        </label>
        <label className="text-sm">Due Date
          <input
            type="date"
            className="mt-1 bg-zinc-800 p-2 rounded w-full"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </label>
        <label className="text-sm">Priority
          <select
            className="mt-1 bg-zinc-800 p-2 rounded w-full"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label className="text-sm">Status
          <select
            className="mt-1 bg-zinc-800 p-2 rounded w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </label>
        <label className="text-sm">Assignee
          <select
            className="mt-1 bg-zinc-800 p-2 rounded w-full"
            value={assigneeEmail}
            onChange={(e) => setAssigneeEmail(e.target.value)}
          >
            <option value="">— No assignee —</option>
            {teamMembers.map((m: any) => (
              <option key={m.id} value={m.email}>
                {m.user}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <div className="text-red-400 text-sm whitespace-pre-wrap">
            {error}
          </div>
        )}
        {success && <div className="text-green-400 text-sm">{success}</div>}
        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="flex-1 bg-gray-700 text-white py-2 rounded"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 bg-red-700 text-white py-2 rounded"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
