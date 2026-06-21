"use client";
import { useState, useEffect, type FormEvent } from "react";
import axiosClient from "@/lib/axiosClient";
import type { Project } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";
import Modal from "@/components/Modal";

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
    <Modal open={open} onClose={onClose} title="Edit Project">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
    </Modal>
  );
}

