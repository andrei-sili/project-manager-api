
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import TaskModal from "@/components/TaskModal";
import type { Task, TeamMember } from "@/lib/types";

export default function TaskDetailPage() {
  const { id, taskid } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const taskRes = await axiosClient.get(
          `/projects/${id}/tasks/${taskid}/`
        );
        setTask(taskRes.data);

        const projectRes = await axiosClient.get(
          `/projects/${id}/`
        );
        setTeamMembers(projectRes.data.team?.members || []);
      } catch {
        setError("Task not found.");
      } finally {
        setLoading(false);
      }
    }

    if (id && taskid) fetchData();
  }, [id, taskid]);

  const handleTaskUpdated = async () => {
    try {
      const res = await axiosClient.get(
        `/projects/${id}/tasks/${taskid}/`
      );
      setTask(res.data);
    } catch {
      alert("Failed to reload task.");
    }
  };

  if (loading) return <div className="text-gray-400 p-8">Loading...</div>;
  if (error || !task) return <div className="text-red-400 p-8">{error || "Not found."}</div>;

  return (
    <TaskModal
      open={!!task}
      task={task}
      projectId={Array.isArray(id) ? id[0] : id ?? ''}
      teamMembers={teamMembers}
      onClose={() => (window.location.href = `/dashboard/projects/${id}`)}
      onDelete={() => {}}
      onTaskUpdated={handleTaskUpdated}
    />
  );
}
