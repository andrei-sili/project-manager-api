// src/app/dashboard/projects/page.tsx

"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import NewProjectModal from "@/components/NewProjectModal";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/projects/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
      })
      .then(res => setProjects(Array.isArray(res.data.results) ? res.data.results : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const handleProjectAdded = () => {
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/projects/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
      })
      .then(res => setProjects(Array.isArray(res.data.results) ? res.data.results : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projects</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
          onClick={() => setShowModal(true)}
        >
          + Add Project
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-gray-400">No projects found.</div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <li key={project.id} className="bg-zinc-900 rounded-xl shadow p-5">
              <Link href={`/dashboard/projects/${project.id}`}>
                <div className="text-lg font-semibold">{project.name}</div>
                <div className="text-gray-400 text-sm truncate">{project.description}</div>
                <div className="text-xs text-gray-500 mt-2">{project.tasks?.length || 0} tasks</div>
                <div className="text-xs text-gray-500">{project.team?.name || "No team"}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onProjectAdded={handleProjectAdded}
        />
      )}
    </div>
  );
}

