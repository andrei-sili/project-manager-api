"use client";
import { useState } from "react";
import { createProject, Project } from "@/lib/api";

interface Props {
  onCreate: (project: Project) => void;
}

export default function NewProjectModal({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const project = await createProject({ name });
      onCreate(project);
      setName("");
      setOpen(false);
    } catch {
      setError("Could not create project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        + New Project
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <form
            onSubmit={handleSubmit}
            className="bg-gray-800 p-6 rounded shadow-md w-96 space-y-4"
          >
            <h2 className="text-xl">Create Project</h2>
            <input
              type="text"
              placeholder="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
            {error && <p className="text-red-400">{error}</p>}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
