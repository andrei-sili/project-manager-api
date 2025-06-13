// frontend/src/components/ProjectOverviewCard.tsx

import React from "react";
import type { Project } from "@/lib/types";

interface Props {
  project: Project;
  onClick?: () => void;
}

export default function ProjectOverviewCard({ project, onClick }: Props) {
  // Prefer task_count dacă există, altfel fallback la tasks?.length sau 0
  const taskCount = project.task_count ?? project.tasks?.length ?? 0;

  return (
    <div
      className="rounded-2xl bg-zinc-900 shadow p-5 hover:shadow-lg hover:ring-2 hover:ring-blue-600 transition cursor-pointer flex flex-col gap-2"
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`Open project ${project.name}`}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold truncate">{project.name}</h3>
        <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-gray-300">
          {taskCount} {taskCount === 1 ? "task" : "tasks"}
        </span>
      </div>
      <div className="text-sm text-gray-400 mb-2 truncate">{project.description}</div>
      <div className="flex justify-between items-center mt-auto">
        {project.team && (
          <span className="text-xs font-medium text-blue-400">
            {project.team.name}
          </span>
        )}
        <span className="text-xs text-gray-500">
          Created by:{" "}
          {typeof project.created_by === "object"
            ? `${project.created_by.first_name ?? ""} ${project.created_by.last_name ?? ""}`.trim() ||
              project.created_by.name ||
              "N/A"
            : project.created_by || "N/A"}
        </span>
      </div>
    </div>
  );
}
