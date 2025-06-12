// Path: frontend/src/app/dashboard/projects/page.tsx

import React, {JSX} from "react";
import { cookies } from "next/headers";
import { fetchProjects } from "@/lib/api";
import ProjectsDashboardCard from "@/components/ProjectsDashboardCard";

/**
 * Server Component:
 * Fetches projects on the server and renders a grid of cards.
 */
export default async function ProjectsPage(): Promise<JSX.Element> {
  // 1. Await the cookie store and read the access token
  const cookieStore = await cookies();
  const access = cookieStore.get("access")?.value ?? "";

  // 2. Fetch projects using our API helper
  const projects = await fetchProjects();

  return (
    <section className="p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Projects</h1>
        <span className="text-sm text-gray-400">
          {projects.length} total
        </span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectsDashboardCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
