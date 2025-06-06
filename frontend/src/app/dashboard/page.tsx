// frontend/src/app/dashboard/page.tsx

"use client";
import ProjectsDashboardCard from "@/components/ProjectsDashboardCard";
import MyTasksCard from "@/components/MyTasksCard";
import TeamCard from "@/components/TeamCard";
import TimeTrackingCard from "@/components/TimeTrackingCard";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/projects/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
      }),
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/my-tasks/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
      }),
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/teams/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
      }),
    ])
      .then(([projRes, tasksRes, teamsRes]) => {
        setProjects(Array.isArray(projRes.data.results) ? projRes.data.results : []);
        setTasks(Array.isArray(tasksRes.data.results) ? tasksRes.data.results : []);
        setTeams(Array.isArray(teamsRes.data.results) ? teamsRes.data.results : []);
      })
      .catch(() => {
        setProjects([]);
        setTasks([]);
        setTeams([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Navigates to the project detail page
  const openProject = (projectId: number) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  return (
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-7">
        <div className="md:col-span-2 flex flex-col gap-7">
          <ProjectsDashboardCard projects={projects} loading={loading}/>
          <MyTasksCard tasks={tasks} loading={loading}/>
          <TeamCard teams={teams} loading={loading}/>
        </div>
        <div className="md:col-span-1">
          <TimeTrackingCard tasks={tasks} loading={loading}/>
        </div>
      </div>
  );
}
