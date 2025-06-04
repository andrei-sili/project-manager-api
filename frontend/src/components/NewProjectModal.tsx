// src/components/NewProjectModal.tsx

"use client";
import { useState } from "react";
import axios from "axios";

export default function NewProjectModal({
  onClose,
  onProjectAdded,
}: {
  onClose: () => void;
  onProjectAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/`,
        { name, description },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setName("");
      setDescription("");
      onProjectAdded();
      onClose();
    } catch (err: any) {
      setError("Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-zinc-900 rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Add New Project</h3>
          <button
            className="text-gray-400 hover:text-gray-200 text-2xl px-2"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Project Name</label>
            <input
              className="w-full bg-zinc-800 rounded px-3 py-2 text-white"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              minLength={3}
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Description</label>
            <textarea
              className="w-full bg-zinc-800 rounded px-3 py-2 text-white"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full mt-3 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Saving..." : "Create"}
          </button>
          {error && <div className="text-red-400 mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
}
