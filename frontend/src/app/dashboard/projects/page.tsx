// frontend/src/app/dashboard/projects/page.tsx

"use client";

import React, { JSX, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchProjects } from "@/lib/api";
import type { Project } from "@/lib/types";
import { useRouter } from "next/navigation";
import ProjectOverviewCard from "@/components/ProjectOverviewCard";

export default function ProjectsPage(): JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;

    if (!token) {
      router.push("/login");
      return;
    }

    fetchProjects(token)
      .then((res) => {

        const list = Array.isArray(res.results) ? res.results : Array.isArray(res) ? res : [];

        const projects = list.map((project: any) => ({
          ...project,
          task_count: typeof project.task_count === "number"
            ? project.task_count
            : Array.isArray(project.tasks)
            ? project.tasks.length
            : 0,
        }));
        setProjects(projects);
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return <div className="p-6 text-white">Loading projects…</div>;
  }

  return (
    <section className="p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Projects</h1>
        <span className="text-sm text-gray-400">{projects.length} total</span>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectOverviewCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
