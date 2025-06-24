// frontend/src/components/AddTaskModal.tsx
"use client";
import { useState } from "react";
import axios from "axios";

export default function AddTaskModal({
  open,
  onClose,
  projectId,
  teamMembers,
  onAdded,
}: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/`,
        {
          title,
          description,
          due_date: dueDate ? dueDate + "T23:59:59" : null,
          priority,
          status: "todo",
          project: projectId,
          assigned_to: assignee || null,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        }
      );


      setSuccess("Task added!");
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("medium");
      setAssignee("");
      onAdded && onAdded();
      onClose();
    } catch (err: any) {
      setError(
        JSON.stringify(err?.response?.data, null, 2) ||
        err?.response?.data?.detail ||
        "Could not create task."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70">
      <form
          className="bg-zinc-900 p-6 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-4 border border-green-700"
          onSubmit={handleSubmit}
      >
        <div className="flex justify-between items-center mb-1">
          <div className="text-lg font-bold">Add Task</div>
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


        {error && <div className="text-red-400 text-sm whitespace-pre-wrap">{error}</div>}
        {success && <div className="text-green-400 text-sm">{success}</div>}

        <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded mt-2"
            disabled={loading}
        >
          {loading ? "Saving..." : "Add Task"}
        </button>
      </form>
    </div>
  );
}



