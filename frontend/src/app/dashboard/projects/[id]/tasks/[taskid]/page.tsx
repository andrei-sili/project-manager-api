// frontend/src/app/dashboard/projects/[id]/tasks/[taskid]/page.tsx

"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import TaskModal from "@/components/TaskModal";

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id, taskid } = params as { id: string; taskid: string };

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Fetch task data from backend
  const fetchTask = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}/tasks/${taskid}/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setTask(res.data);
      setError(null);
    } catch {
      setError("Task not found.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch team members for edit modal
  const fetchTeamMembers = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setTeamMembers(res.data.team?.members || []);
    } catch {
      setTeamMembers([]);
    }
  };

  useEffect(() => {
    fetchTask();
    fetchTeamMembers();
    // eslint-disable-next-line
  }, [id, taskid]);

  // Delete Task
  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}/tasks/${taskid}/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      router.push(`/dashboard/projects/${id}`);
    } catch {
      alert("Could not delete task!");
    }
  };

  // After update, close modal and refresh project view
  const handleTaskUpdated = () => {
    router.push(`/dashboard/projects/${id}`);
  };

  // Close modal and go back to project
  const handleClose = () => {
    router.push(`/dashboard/projects/${id}`);
  };

  if (loading)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-lg">
        <div className="bg-zinc-900 rounded-2xl p-10 shadow-xl min-w-[350px] text-gray-200">
          Loading task...
        </div>
      </div>
    );
  if (error || !task)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-lg">
        <div className="bg-zinc-900 rounded-2xl p-10 shadow-xl min-w-[350px] text-red-400">
          {error || "Not found."}
        </div>
      </div>
    );

  return (
    <TaskModal
      open={!!task}
      task={task}
      projectId={id.toString()}
      teamMembers={teamMembers}
      onClose={handleClose}
      onDelete={handleDeleteTask}
      onTaskUpdated={handleTaskUpdated}
    />
  );
}
