// frontend/src/app/dashboard/page.tsx

"use client";

import React, { useState, useEffect, JSX } from "react";
import ProjectsDashboardCard from "@/components/ProjectsDashboardCard";
import MyTasksCard from "@/components/MyTasksCard";
import TeamCard from "@/components/TeamCard";
import UserProfileCard from "@/components/UserProfileCard";
import TimeTrackingCard from "@/components/TimeTrackingCard";
import apiClient from "@/lib/axiosClient";
import { Project, Task, Team } from "@/lib/types";
import TaskModal from "@/components/TaskModal";
import EditTaskModal from "@/components/EditTaskModal";

export default function DashboardPage(): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [projectId, setProjectId] = useState<string>("");
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [editTask, setEditTask] = useState<Task | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiClient.get<{ results: Project[] }>("/projects/"),
      apiClient.get<{ results: Task[] }>("/my-tasks/"),
      apiClient.get<{ results: Team[] }>("/teams/"),
    ])
      .then(([projRes, taskRes, teamRes]) => {
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

  const handleTaskClick = async (task: Task) => {
    setSelectedTask(task);

    let projectIdValue = "";
    if (typeof task.project === "object" && task.project?.id) {
      projectIdValue = task.project.id.toString();
    } else if (typeof task.project === "string") {
      projectIdValue = task.project;
    }
    setProjectId(projectIdValue);

    if (projectIdValue) {
      try {
        const res = await apiClient.get(`/projects/${projectIdValue}/`);
        setTeamMembers(res.data.team?.members || []);
      } catch {
        setTeamMembers([]);
      }
    } else {
      setTeamMembers([]);
    }
  };

  const handleDeleteTask = async (): Promise<void> => {
    if (!selectedTask || !projectId) return;
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await apiClient.delete(`/projects/${projectId}/tasks/${selectedTask.id}/`);
      setSelectedTask(null);
      const res = await apiClient.get<{ results: Task[] }>("/my-tasks/");
      setTasks(res.data.results || res.data);
    } catch {
      alert("Could not delete task!");
    }
  };

  const handleTaskUpdated = async () => {
    try {
      const res = await apiClient.get<{ results: Task[] }>("/my-tasks/");
      setTasks(res.data.results || res.data);
    } catch {
      alert("Failed to refresh tasks.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-7">
      <div className="md:col-span-2 flex flex-col gap-7">
        <section>
          <ProjectsDashboardCard projects={projects.slice(0, 5)} loading={loading} total={projects.length} />
        </section>
        <MyTasksCard tasks={tasks} loading={loading} onTaskClick={handleTaskClick} />
        <TeamCard teams={teams} loading={loading} />
      </div>
      <div className="md:col-span-1 flex flex-col gap-7">
        <UserProfileCard projects={projects} />
        <TimeTrackingCard />
      </div>
      {selectedTask && (
              <TaskModal
                open={!!selectedTask}
                task={selectedTask}
                projectId={projectId}
                teamMembers={teamMembers}
                onClose={() => setSelectedTask(null)}
                onDelete={handleDeleteTask}
                onEditClick={() => setEditTask(selectedTask)}
                onTaskUpdated={handleTaskUpdated}
              />
            )}
            {editTask && (
              <EditTaskModal
                open={!!editTask}
                task={editTask}
                projectId={editTask.project?.id || 0}
                teamMembers={teamMembers}
                onClose={() => setEditTask(null)}
                onSaved={async () => {
                  setEditTask(null);
                  setSelectedTask(null);
                  try {
                    const res = await apiClient.get<{ results: Task[] }>("/my-tasks/");
                    setTasks(res.data.results || res.data);
                  } catch {
                    alert("Failed to refresh tasks.");
                  }
                }}
              />
            )}
    </div>
  );
}
