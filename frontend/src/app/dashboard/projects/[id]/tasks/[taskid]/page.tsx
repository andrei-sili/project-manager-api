// frontend/src/app/dashboard/projects/[id]/tasks/[taskid]/page.tsx

"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import EditTaskModal from "@/components/EditTaskModal";
import TaskComments from "@/components/TaskComments";
import TaskFiles from "@/components/TaskFiles";
import { StatusBadge, PriorityBadge } from "@/components/TaskBadge";
import { X } from "lucide-react";

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id, taskid } = params as { id: string; taskid: string };

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-lg">
      {/* Modal card */}
      <div className="bg-zinc-900 rounded-3xl shadow-2xl max-w-3xl w-full p-8 mx-2 relative animate-slideUp border border-zinc-800">
        {/* X Close */}
        <button
          className="absolute right-6 top-6 text-zinc-400 hover:text-white transition"
          onClick={handleClose}
          title="Close"
        >
          <X size={32} />
        </button>
        {/* Edit / Delete */}
        <div className="absolute right-6 top-20 flex gap-2">
          <button
            className="px-4 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold text-sm"
            onClick={() => setShowEdit(true)}
          >
            Edit
          </button>
          <button
            className="px-4 py-1 bg-zinc-800 text-red-400 rounded-xl text-sm hover:bg-red-700 hover:text-white transition"
            onClick={handleDeleteTask}
          >
            Delete
          </button>
        </div>
        {/* Title */}
        <div className="text-2xl font-bold text-white mb-2 mt-1 pl-2">{task.title}</div>
        {/* Badges/fields */}
        <div className="flex flex-wrap gap-3 mb-4 pl-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          <div className="text-xs text-gray-400 flex items-center">
            {task.due_date && (
              <>
                <span className="font-semibold mr-1">Due:</span>
                {new Date(task.due_date).toLocaleDateString()}
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-8 mb-6 pl-2">
          <div className="text-sm">
            <span className="text-gray-400">Assigned to: </span>
            <span className="font-semibold">
              {task.assigned_to_name || task.assigned_to || "—"}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Project: </span>
            <span className="font-semibold">
              {task.project?.name || task.project || "—"}
            </span>
          </div>
        </div>
        {/* Description */}
        <div className="mb-6 pl-2">
          <div className="text-gray-400 mb-1">Description:</div>
          <div className="text-white whitespace-pre-line">{task.description}</div>
        </div>
        {/* Files */}
        <div className="pl-2 mb-6">
          <TaskFiles projectId={id} taskId={taskid} compact />
        </div>
        {/* Comments */}
        <div className="pl-2">
          <TaskComments projectId={id} taskId={taskid} />
        </div>
        {/* Edit modal */}
        <EditTaskModal
          open={showEdit}
          task={task}
          teamMembers={teamMembers}
          projectId={Number(id)}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            fetchTask();
          }}
        />
      </div>
      {/* Click on blurred background closes the modal */}
      <div
        className="fixed inset-0 z-40"
        onClick={handleClose}
        style={{ cursor: "pointer" }}
      ></div>
    </div>
  );
}

