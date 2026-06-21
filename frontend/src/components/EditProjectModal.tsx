"use client";
import { useState, useEffect, type FormEvent } from "react";
import axiosClient from "@/lib/axiosClient";
import type { Project } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";

type EditProjectModalProps = {
  project: Project;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

// Modal component for editing a project
export default function EditProjectModal({ project, open, onClose, onUpdated }: EditProjectModalProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [budget, setBudget] = useState<string>(project.budget != null ? String(project.budget) : "");
  const [dueDate, setDueDate] = useState(project.due_date ? project.due_date.slice(0,10) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Re-sync the form when the modal is (re)opened for a project.
  useEffect(() => {
    if (!open) return;
    setName(project.name);
    setDescription(project.description);
    setBudget(project.budget != null ? String(project.budget) : "");
    setDueDate(project.due_date ? project.due_date.slice(0, 10) : "");
    setError("");
  }, [project, open]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setLoading(true); setError("");
  try {
    await axiosClient.patch(
      `/projects/${project.id}/`,
      {
        name,
        description,
        budget: budget ? parseFloat(budget.replace(",", ".")) : null,
        due_date: dueDate || null,
      }
    );
    onUpdated();
    onClose();
  } catch (err) {
    setError(getErrorMessage(err, "Could not update project."));
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70">
      <form
        className="bg-zinc-900 p-6 rounded-2xl shadow-lg w-full max-w-lg flex flex-col gap-4 border border-zinc-800"
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
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded mt-2"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

