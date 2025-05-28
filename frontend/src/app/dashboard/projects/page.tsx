// frontend/src/app/dashboard/projects/page.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchProjects, Project } from "@/lib/api";
import NewProjectModal from "@/components/NewProjectModal";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    fetchProjects()
      .then((data) => {
        console.log("❯❯ fetched projects:", data);
        setProjects(data);
      })
      .catch((err) => {
        console.error("Fetch projects error:", err);
        setError("Failed to load projects");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Loading projects…</p>;
  if (error)   return <p className="p-6 text-red-400">{error}</p>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl">Projects</h1>
        <NewProjectModal
          onCreate={(newP) =>
            setProjects((prev) => [newP, ...prev])
          }
        />
      </div>

      <ul className="list-disc pl-5 space-y-2">
        {projects.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
