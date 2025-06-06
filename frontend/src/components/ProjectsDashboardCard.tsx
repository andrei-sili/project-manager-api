// frontend/src/components/ProjectsDashboardCard.tsx

import React from "react";
import { useRouter } from "next/navigation";
import { FolderOpen } from "lucide-react";
import Link from "next/link";
interface Team {
  id: number;
  name: string;
}

interface Task {
  id: number;
}

interface Project {
  id: number;
  name: string;
  description: string;
  team?: Team;
  tasks: Task[];
}

interface Props {
  projects: Project[];
  loading?: boolean;
}

export default function ProjectsDashboardCard({ projects, loading }: Props) {
  const router = useRouter();
  const maxDisplay = 3;
  const visibleProjects = projects.slice(0, maxDisplay);

  return (
      <div className="bg-zinc-900 rounded-2xl shadow p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            Projects
            <span className="bg-zinc-800 text-xs px-2 py-1 rounded text-gray-300 font-medium">
      {projects.length}
    </span>
          </h2>
          <Link
              href="/dashboard/projects"
              className="flex items-center gap-2 text-blue-400 hover:underline font-medium"
          >
            <FolderOpen className="w-5 h-5"/>
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {loading ? (
              <div className="col-span-3 text-center text-gray-400">Loading projects...</div>
          ) : visibleProjects.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500 text-sm">
                No projects found.
              </div>
          ) : (
              visibleProjects.map((project) => (
                  <button
                      key={project.id}
                      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      className="bg-zinc-800 hover:bg-zinc-700 rounded-xl p-4 text-left transition shadow flex flex-col gap-2 border border-transparent hover:border-blue-600 focus:ring-2 focus:ring-blue-600 outline-none"
                      tabIndex={0}
                      aria-label={`Open project ${project.name}`}
                  >
                    <div className="font-semibold truncate">{project.name}</div>
                    <div className="text-xs text-gray-400 truncate">
                      {project.description || <span className="italic text-gray-500">No description</span>}
                    </div>
                    <div className="flex items-center justify-between text-xs mt-2 text-gray-400">
                <span>
                  {project.tasks.length} {project.tasks.length === 1 ? "task" : "tasks"}
                </span>
                      {project.team?.name && (
                          <span className="font-medium text-blue-400">{project.team.name}</span>
                      )}
                    </div>
                  </button>
              ))
          )}
        </div>
      </div>
  );
}
