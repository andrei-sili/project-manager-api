"use client";
import { useEffect, useState } from "react";
import axiosClient from "@/lib/axiosClient";
import type { Task, TeamMember } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";
import Modal from "@/components/Modal";


interface EditTaskModalProps {
  open: boolean;
  task: Task;
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
  const [priority, setPriority] = useState<string>(task?.priority || "medium");
  const [status, setStatus] = useState<string>(task?.status || "todo");
  const [assignee, setAssignee] = useState<number | "">(
  task.assigned_to && typeof task.assigned_to === "object"
    ? task.assigned_to.id
    : ""
);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update form when task changes
  useEffect(() => {
    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setDueDate(task?.due_date ? formatDateInput(task.due_date) : "");
    setPriority(task?.priority || "medium");
    setStatus(task?.status || "todo");
    setAssignee(task.assigned_to && typeof task.assigned_to === "object" ? task.assigned_to.id : "");
    setError("");
  }, [task, open]);

  // PATCH request to update task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axiosClient.patch(
        `/projects/${projectId}/tasks/${task.id}/`,
        {
          title,
          description,
          due_date: dueDate ? dueDate + "T23:59:59" : null,
          priority,
          status,
          assigned_to: assignee || null,
          project: projectId,
        }
      );
      onSaved?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update task."));
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
      await axiosClient.delete(
        `/projects/${projectId}/tasks/${task.id}/`
      );
      onSaved?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete task."));
    } finally {
      setLoading(false);
    }
  };

  // Format for input type="date"
  function formatDateInput(date: string) {
    // Accepts "2025-06-07T23:59:59" or "2025-06-07"
    return date?.slice(0, 10) || "";
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Task" widthClass="max-w-md">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="text-sm font-semibold">Title
          <input
              className="mt-1 bg-zinc-800 p-2 rounded w-full outline-none border border-zinc-700 focus:ring-2 focus:ring-emerald-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
          />
        </label>
        <label className="text-sm font-semibold">Description
          <textarea
              className="mt-1 bg-zinc-800 p-2 rounded w-full outline-none border border-zinc-700 focus:ring-2 focus:ring-emerald-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
          />
        </label>
        <label className="text-sm font-semibold">Due Date
          <input
              type="date"
              className="mt-1 bg-zinc-800 p-2 rounded w-full outline-none border border-zinc-700 focus:ring-2 focus:ring-emerald-500"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
          />
        </label>
        {/* Dynamic colors for status/priority */}
        <div className="flex gap-2">
          <label className="flex-1 text-sm font-semibold">Priority
            <select
                className="mt-1 p-2 rounded w-full outline-none border border-zinc-700 focus:ring-2 focus:ring-emerald-500 bg-zinc-800 text-white"
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
                className="mt-1 p-2 rounded w-full outline-none border border-zinc-700 focus:ring-2 focus:ring-emerald-500 bg-zinc-800 text-white"
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
              value={assignee ?? ""}
              onChange={e => setAssignee(Number(e.target.value) || "")}
              className="w-full px-3 py-2 mt-1 rounded-md bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">— No assignee —</option>
            {teamMembers.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.first_name} {m.user.last_name}
                </option>
            ))}
          </select>
        </label>

        {error && (
            <div className="text-red-400 text-sm whitespace-pre-wrap">
              {error}
            </div>
        )}
        {/* Action buttons */}
        <div className="flex gap-2 mt-2">
          <button
              type="submit"
              className="flex-1 bg-emerald-700 hover:bg-emerald-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
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
    </Modal>
  );
}
