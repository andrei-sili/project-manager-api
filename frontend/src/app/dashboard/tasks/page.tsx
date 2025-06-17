"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import TaskModal from "@/components/TaskModal";
import EditTaskModal from "@/components/EditTaskModal";
import { StatusBadge, PriorityBadge } from "@/components/TaskBadge";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [editTask, setEditTask] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/my-tasks/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      })
      .then((res) => setTasks(res.data.results || res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedTask && selectedTask.project?.id) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/projects/${selectedTask.project.id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        })
        .then((res) => setTeamMembers(res.data.team?.members || []));
      setProjectId(selectedTask.project.id.toString());
    }
  }, [selectedTask]);

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${selectedTask.id}/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setSelectedTask(null);
      setLoading(true);
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/my-tasks/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        })
        .then((res) => setTasks(res.data.results || res.data))
        .finally(() => setLoading(false));
    } catch {
      alert("Could not delete task!");
    }
  };

  // Conversie robustă pentru projectId
  function projectIdToNumber(id: any): number {
    if (typeof id === "string") return parseInt(id);
    if (Array.isArray(id)) return parseInt(id[0]);
    if (typeof id === "number") return id;
    return 0;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-3">
      <div className="text-2xl font-bold mb-8 text-white">My Tasks</div>
      <div className="flex flex-col gap-5">
        {loading ? (
          <div className="text-gray-400">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-gray-500">No tasks found.</div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-2xl shadow-xl bg-zinc-900 px-8 py-5 flex justify-between items-center hover:bg-zinc-800 transition cursor-pointer border border-zinc-800 gap-4"
              onClick={() => setSelectedTask(task)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-lg mb-1 truncate">{task.title}</div>
                <div className="text-gray-400 text-sm mb-1 truncate">{task.description}</div>
                <div className="flex gap-3 text-xs items-center mb-1 flex-wrap">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  <span className="ml-2 text-gray-400">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : ""}
                  </span>
                  {task.project?.name && (
                    <span className="bg-green-900 text-green-200 px-3 py-1 rounded-lg text-xs font-bold border border-green-700">
                      {task.project.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end min-w-[120px]">
                <span className="text-xs text-blue-300 truncate">
                  {
                    task.assigned_to_name ||
                    (typeof task.assigned_to === "object" && task.assigned_to
                      ? [task.assigned_to.first_name, task.assigned_to.last_name].filter(Boolean).join(" ")
                      : task.assigned_to || "—"
                    )
                  }
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      {/* TaskModal Edit */}
      {selectedTask && (
        <TaskModal
          open={!!selectedTask}
          task={selectedTask}
          projectId={projectId}
          teamMembers={teamMembers}
          onClose={() => setSelectedTask(null)}
          onDelete={handleDeleteTask}
          onEditClick={() => setEditTask(selectedTask)} // aici e propul corect!
          onTaskUpdated={() => {
            setLoading(true);
            axios
              .get(`${process.env.NEXT_PUBLIC_API_URL}/my-tasks/`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
              })
              .then((res) => setTasks(res.data.results || res.data))
              .finally(() => setLoading(false));
          }}
        />
      )}
      {/* EditTaskModal */}
      {editTask && (
        <EditTaskModal
          open={!!editTask}
          task={editTask}
          teamMembers={teamMembers}
          projectId={projectIdToNumber(projectId)}
          onClose={() => setEditTask(null)}
          onSaved={() => {
            setEditTask(null);
            setSelectedTask(null);
            setLoading(true);
            axios
              .get(`${process.env.NEXT_PUBLIC_API_URL}/my-tasks/`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
              })
              .then((res) => setTasks(res.data.results || res.data))
              .finally(() => setLoading(false));
          }}
        />
      )}
    </div>
  );
}
