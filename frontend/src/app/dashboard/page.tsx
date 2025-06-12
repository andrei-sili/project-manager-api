// Path: frontend/src/app/dashboard/page.tsx
"use client";

import React, {useState, useEffect, JSX} from "react";
import DashboardShell from "@/components/DashboardShell";
import ProjectsDashboardCard from "@/components/ProjectsDashboardCard";
import MyTasksCard from "@/components/MyTasksCard";
import TeamCard from "@/components/TeamCard";
import UserProfileCard from "@/components/UserProfileCard";
import TimeTrackingCard from "@/components/TimeTrackingCard";
import apiClient from "@/lib/axiosClient";
import { Project, Task, Team } from "@/lib/types";
import { useApiInterceptors } from "@/lib/useApi";

/**
 * DashboardPage is a client component that:
 *  - sets up API interceptors for auth
 *  - fetches projects, tasks, teams on mount
 *  - renders a two-column layout with cards
 */
export default function DashboardPage(): JSX.Element {
  // initialize axios interceptors once
  useApiInterceptors();

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);

    // fetch all three resources in parallel
    Promise.all([
      apiClient.get<{ results: Project[] }>("/projects/"),
      apiClient.get<{ results: Task[] }>("/my-tasks/"),
      apiClient.get<{ results: Team[] }>("/teams/"),
    ])
      .then(([projRes, taskRes, teamRes]) => {
        setProjects(projRes.data.results);
        setTasks(taskRes.data.results);
        setTeams(teamRes.data.results);
      })
      .catch(() => {
        // on any error, reset to empty arrays
        setProjects([]);
        setTasks([]);
        setTeams([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-7">
        {/* Left column: Projects, My Tasks, Teams */}
        <div className="md:col-span-2 flex flex-col gap-7">
          {/* Projects Grid */}
          <section>
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Projects</h2>
              <span className="text-sm text-gray-400">
                {loading ? "..." : `${projects.length} total`}
              </span>
            </header>
            {loading ? (
              <p className="text-gray-400">Loading projects…</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <ProjectsDashboardCard
                    key={project.id}
                    project={project}
                  />
                ))}
              </div>
            )}
          </section>

          {/* My Tasks Preview */}
          <MyTasksCard tasks={tasks} loading={loading} />

          {/* Teams Preview */}
          <TeamCard teams={teams} loading={loading} />
        </div>

        {/* Right column: UserProfile and TimeTracking */}
        <div className="md:col-span-1 flex flex-col gap-7">
          <UserProfileCard projects={projects} />
          <TimeTrackingCard />
        </div>
      </div>
    </DashboardShell>
  );
}
