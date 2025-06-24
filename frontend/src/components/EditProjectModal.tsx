// frontend/src/components/EditProjectModal.tsx
"use client";
import { useState } from "react";
import axios from "axios";

// Modal component for editing a project
export default function EditProjectModal({ project, open, onClose, onUpdated }: any) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [budget, setBudget] = useState(project.budget || "");
  const [dueDate, setDueDate] = useState(project.due_date ? project.due_date.slice(0,10) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: any) => {
  e.preventDefault();
  setLoading(true); setError("");
  try {
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${project.id}/`,
      {
        name,
        description,
        budget: budget ? parseFloat(budget.replace(",", ".")) : null,
        due_date: dueDate || null,
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
    );
    onUpdated();
    onClose();
  } catch (err: any) {
    setError(err?.response?.data?.detail || "Could not update project.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70">
      <form
        className="bg-zinc-900 p-6 rounded-2xl shadow-lg w-full max-w-lg flex flex-col gap-4 border border-blue-700"
        onSubmit={handleSubmit}
      >
        <div className="flex justify-between items-center mb-1">
          <div className="text-lg font-bold">Edit Project</div>
          <button type="button" className="text-gray-400 hover:text-red-400 text-xl" onClick={onClose}>×</button>
        </div>
        <label className="text-sm">Name
          <input className="mt-1 bg-zinc-800 p-2 rounded w-full" value={name} onChange={e=>setName(e.target.value)} required/>
        </label>
        <label className="text-sm">Description
          <textarea className="mt-1 bg-zinc-800 p-2 rounded w-full" value={description} onChange={e=>setDescription(e.target.value)} rows={3}/>
        </label>
        <label className="text-sm">Budget (€)
          <input className="mt-1 bg-zinc-800 p-2 rounded w-full" value={budget} onChange={e=>setBudget(e.target.value)} type="number" min={0}/>
        </label>
        <label className="text-sm">Deadline
          <input className="mt-1 bg-zinc-800 p-2 rounded w-full" value={dueDate} onChange={e=>setDueDate(e.target.value)} type="date"/>
        </label>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded mt-2"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

