// frontend/src/components/ProjectsDashboardCard.tsx

import React from "react";
import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { Project } from "@/lib/types";

interface Props {
  projects: Project[];
  loading?: boolean;
  total: number;
}

export default function ProjectsDashboardCard({ projects, loading }: Props) {
  const visibleProjects = projects.slice(0, 4);

  return (
    <div className="bg-zinc-900 rounded-2xl shadow p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">Projects</h3>
        <Link
          href="/dashboard/projects"
          className="flex items-center gap-2 text-blue-400 hover:underline font-medium"
        >
          <FolderKanban className="w-5 h-5" />
          View All
        </Link>
      </div>

      <div className="text-sm text-gray-400 mb-3">
        {loading ? "Loading…" : `${projects.length} total`}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {loading ? (
          <div className="col-span-2 text-center text-gray-400">
            Loading projects...
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="col-span-2 text-center text-gray-500 text-sm">
            No projects found.
          </div>
        ) : (
          visibleProjects.map((project) => (
              <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="bg-zinc-800 hover:bg-zinc-700 rounded-xl p-4 border border-transparent hover:border-blue-600 transition group"
              >
                  <div className="font-semibold text-white mb-1 truncate">
                      {project.name}
                  </div>
                  <div className="text-sm text-gray-400 mb-1 truncate">
                      {project.description || "No description"}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{project.team?.name || "No team"}</span>
                      <span>
                  {(typeof project.task_count === "number"
                          ? project.task_count
                          : project.tasks?.length ?? 0
                  )}{" "}
                          {(typeof project.task_count === "number"
                                  ? project.task_count
                                  : project.tasks?.length ?? 0
                          ) === 1 ? "task" : "tasks"}
                </span>

                  </div>
                  <div className="text-right text-[11px] text-gray-600 mt-1">
                      Created by:{" "}
                      {typeof project.created_by === "object"
                          ? `${project.created_by.first_name ?? ""} ${project.created_by.last_name ?? ""}`.trim() ||
                          project.created_by.name ||
                          "N/A"
                          : project.created_by || "N/A"}
                  </div>

              </Link>
          ))
        )}
      </div>
    </div>
  );
}
