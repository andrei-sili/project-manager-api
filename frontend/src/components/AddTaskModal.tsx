// frontend/src/components/AddTaskModal.tsx
"use client";
import { useState, useEffect } from "react";
import axios from "axios";

// Modal for adding a task to a project
export default function AddTaskModal({ open, onClose, projectId, teamMembers, onAdded }: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignees, setAssignees] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/`,
        {
          title,
          description,
          due_date: dueDate,
          status: "todo",
          project: projectId,
          assignees,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setSuccess("Task added!");
      setTitle(""); setDescription(""); setDueDate(""); setAssignees([]);
      onAdded && onAdded();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.title?.[0] ||
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
          <button type="button" className="text-gray-400 hover:text-red-400 text-xl" onClick={onClose}>×</button>
        </div>
        <label className="text-sm">Title
          <input className="mt-1 bg-zinc-800 p-2 rounded w-full" value={title} onChange={e=>setTitle(e.target.value)} required/>
        </label>
        <label className="text-sm">Description
          <textarea className="mt-1 bg-zinc-800 p-2 rounded w-full" value={description} onChange={e=>setDescription(e.target.value)} rows={3}/>
        </label>
        <label className="text-sm">Due Date
          <input className="mt-1 bg-zinc-800 p-2 rounded w-full" type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}/>
        </label>
        <label className="text-sm">Assignees
          <select
            className="mt-1 bg-zinc-800 p-2 rounded w-full"
            value={assignees}
            onChange={e=>setAssignees(Array.from(e.target.selectedOptions, (opt:any) => opt.value))}
            multiple
          >
            {teamMembers.map((m: any) => (
              <option key={m.id} value={m.id}>
                {m.user || m.email || `user#${m.id}`}
              </option>
            ))}
          </select>
        </label>
        {error && <div className="text-red-400 text-sm">{error}</div>}
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
