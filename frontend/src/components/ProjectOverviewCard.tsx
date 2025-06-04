// src/components/ProjectOverviewCard.tsx
"use client";
import Link from "next/link";
import { FolderPlus } from "lucide-react";

export default function ProjectOverviewCard({ projects, loading }: { projects: any[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="rounded-xl bg-zinc-800 shadow p-6 h-[120px] animate-pulse mb-4" />
    );
  }

  return (
    <div className="rounded-xl bg-zinc-900 shadow p-6 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">Projects</h3>
        <Link
          href="/dashboard/projects"
          className="flex items-center gap-2 text-blue-400 hover:underline font-medium"
        >
          <FolderPlus className="w-5 h-5" />
          View All
        </Link>
      </div>
      {(!projects || projects.length === 0) ? (
        <div className="text-gray-400 text-sm">No projects yet. <Link href="/dashboard/projects" className="text-blue-400 hover:underline">Create your first project</Link></div>
      ) : (
        <ul className="flex flex-wrap gap-4">
          {projects.slice(0, 3).map((project) => (
            <li key={project.id} className="bg-zinc-800 rounded-lg px-5 py-3 min-w-[180px] flex-1 shadow">
              <Link href={`/dashboard/projects/${project.id}`}>
                <div className="font-semibold text-white text-base truncate">{project.name}</div>
                <div className="text-xs text-gray-400 truncate">{project.description}</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">{project.tasks_count || 0} tasks</span>
                  <span className="text-xs text-gray-500">|</span>
                  <span className="text-xs text-gray-500">{project.team?.name || "No team"}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
