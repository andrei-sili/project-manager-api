"use client";
import { useEffect, useState } from "react";
import api, { Project, Task, Team } from "@/lib/api";
import ProjectOverviewCard from "@/components/ProjectOverviewCard";
import MyTasksCard from "@/components/MyTasksCard";
import TimeTrackingCard from "@/components/TimeTrackingCard";
import TeamCard from "@/components/TeamCard";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeam] = useState<Team[]>([]);

  const [timeToday] = useState("0:00");

  useEffect(() => {
    api.get("projects/")
      .then((res) => setProjects(Array.isArray(res.data) ? res.data : res.data.results || []))
      .catch(console.error);

    api.get("my-tasks/")
      .then((res) => setTasks(Array.isArray(res.data) ? res.data : res.data.results || []))
      .catch(console.error);

    api.get("teams/")
      .then((res) => setTeam(Array.isArray(res.data) ? res.data : res.data.results || []))
      .catch(console.error);
  }, []);

  return (
    <div className="dashboard grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <div className="md:col-span-2 flex flex-col gap-6">
        <ProjectOverviewCard projects={projects} />
        <MyTasksCard tasks={tasks} />
        <TeamCard teams={teams} />
      </div>
      <TimeTrackingCard timeToday={timeToday} />
    </div>
  );
}
