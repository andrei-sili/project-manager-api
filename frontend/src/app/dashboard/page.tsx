// Path: frontend/src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, JSX } from "react";
import ProjectsDashboardCard from "@/components/ProjectsDashboardCard";
import MyTasksCard from "@/components/MyTasksCard";
import TeamCard from "@/components/TeamCard";
import UserProfileCard from "@/components/UserProfileCard";
import TimeTrackingCard from "@/components/TimeTrackingCard";
import apiClient from "@/lib/axiosClient";
import { Project, Task, Team } from "@/lib/types";

export default function DashboardPage(): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiClient.get<{ results: Project[] }>("/projects/"),
      apiClient.get<{ results: Task[] }>("/my-tasks/"),
      apiClient.get<{ results: Team[] }>("/teams/"),
    ])
      .then(([projRes, taskRes, teamRes]) => {
        // Map each project to add the task_count property based on tasks array length
        const projectsWithTaskCount = projRes.data.results.map((project) => ({
          ...project,
          task_count: project.tasks ? project.tasks.length : 0,
        }));

        setProjects(projectsWithTaskCount);
        setTasks(taskRes.data.results);
        setTeams(teamRes.data.results);
      })
      .catch(() => {
        setProjects([]);
        setTasks([]);
        setTeams([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-7">
      {/* Left column: Projects, My Tasks, Teams */}
      <div className="md:col-span-2 flex flex-col gap-7">
        {/* Projects Grid */}
        <section>
          <ProjectsDashboardCard
            projects={projects.slice(0, 5)}
            loading={loading}
            total={projects.length}
          />
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
  );
}
