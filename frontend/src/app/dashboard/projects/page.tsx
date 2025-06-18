"use client";
import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import NewProjectModal from "@/components/NewProjectModal";
import ProjectOverviewCard from "@/components/ProjectOverviewCard";
import { Project } from "@/lib/types";
import axios from "axios";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // Fetch projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      // handle paginated or plain list
      setProjects(Array.isArray(res.data.results) ? res.data.results : res.data);
    } catch {
      setProjects([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-7">
        <h1 className="text-3xl font-bold text-blue-400">Projects</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow transition"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="w-5 h-5" />
          Add Project
        </button>
      </div>

      {/* Add Project Modal */}
      {showAdd && (
        <NewProjectModal
          onClose={() => setShowAdd(false)}
          onProjectAdded={fetchProjects}
        />
      )}

      {/* Projects List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin" size={32}/></div>
      ) : projects.length === 0 ? (
        <div className="text-gray-400 text-center mt-16">No projects yet. Click <b>Add Project</b> to start.</div>
      ) : (
        <div className="flex flex-col gap-5">
          {projects.map((project) => (
            <ProjectOverviewCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
