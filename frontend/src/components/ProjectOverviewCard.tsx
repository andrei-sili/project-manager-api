// frontend/src/components/ProjectOverviewCard.tsx

import React from "react";

interface Member {
  id: number;
  name?: string;
  email: string;
  role: string;
  joined_at?: string;
}

interface Team {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  // ...add more fields if needed
}

interface Project {
  id: number;
  name: string;
  description: string;
  team?: Team;
  tasks: Task[];
  created_by: string;
  // ...add more fields if needed
}

interface Props {
  project: Project;
  onClick?: () => void;
}

export default function ProjectOverviewCard({ project, onClick }: Props) {
  const taskCount = project.tasks?.length || 0;

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
        <span className="text-xs text-gray-500">Created by: {project.created_by}</span>
      </div>
    </div>
  );
}
