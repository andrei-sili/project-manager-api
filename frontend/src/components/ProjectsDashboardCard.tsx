// Path: frontend/src/components/ProjectsDashboardCard.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { Project } from "@/lib/types";

interface ProjectsDashboardCardProps {
  project: Project;
}

/**
 * Card component to display a single project in the dashboard.
 * Clicking on the card navigates to the project detail page.
 */
const ProjectsDashboardCard: React.FC<ProjectsDashboardCardProps> = ({
  project,
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/projects/${project.id}`);
  };

  return (
    <div
      className="bg-zinc-800 rounded-lg p-4 cursor-pointer hover:bg-zinc-700 transition"
      onClick={handleClick}
    >
      <div className="flex items-center mb-3">
        <FolderOpen size={20} className="text-blue-400 mr-2" />
        <h2 className="text-lg font-semibold text-white">{project.name}</h2>
      </div>
      <p className="text-sm text-gray-400 mb-4 truncate">
        {project.description}
      </p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{project.tasks.length} tasks</span>
        <Link
          href={`/dashboard/projects/${project.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-blue-400 hover:underline"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProjectsDashboardCard;
