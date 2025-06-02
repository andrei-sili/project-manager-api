"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("projects/")
      .then(res => setProjects(res.data.results || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!projects.length) return <div className="p-6">No projects found.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {projects.map(project => (
        <div key={project.id} className="bg-[#222533] rounded-xl shadow p-6 flex flex-col">
          <h2 className="text-xl font-bold mb-2">{project.name}</h2>
          <div className="text-sm text-gray-400 mb-1">
            Team: {project.team?.name}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            Created by: {project.created_by} | {new Date(project.created_at).toLocaleDateString()}
          </div>
          <div className="text-sm mb-2">
            Tasks: {project.tasks?.length ?? 0}
          </div>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="mt-auto text-purple-400 hover:underline font-semibold"
          >
            View Details →
          </Link>
        </div>
      ))}
    </div>
  );
}
