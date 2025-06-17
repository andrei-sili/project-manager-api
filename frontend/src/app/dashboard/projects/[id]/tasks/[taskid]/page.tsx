// frontend/src/app/dashboard/projects/[id]/tasks/[taskid]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import TaskModal from "@/components/TaskModal";

export default function TaskDetailPage() {
  const { id, taskid } = useParams();
  const [task, setTask] = useState<any | null>(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("access");
        const taskRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}/tasks/${taskid}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTask(taskRes.data);

        const projectRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}/`,
          { headers: { Authorization: `Bearer ${token}` } }
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
      const token = localStorage.getItem("access");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}/tasks/${taskid}/`,
        { headers: { Authorization: `Bearer ${token}` } }
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
