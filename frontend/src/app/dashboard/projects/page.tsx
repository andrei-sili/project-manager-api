"use client";
import { useEffect, useState } from "react";
import { fetchProjects, Project } from "@/lib/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(() => setError("Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Loading projects…</p>;
  if (error)   return <p className="p-6 text-red-400">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Projects</h1>
      <ul className="list-disc pl-5 space-y-2">
        {projects.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
