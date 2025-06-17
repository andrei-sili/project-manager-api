"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditProjectModal from "@/components/EditProjectModal";
import InviteMemberModal from "@/components/InviteMemberModal";
import AddTaskModal from "@/components/AddTaskModal";
import TaskModal from "@/components/TaskModal";
import KanbanBoard from "@/components/KanbanBoard";
import EditTaskModal from "@/components/EditTaskModal";

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;
  const [isEditing, setIsEditing] = useState(false);
  const [editTask, setEditTask] = useState<any | null>(null);

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [showInvite, setShowInvite] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [view, setView] = useState<"list" | "kanban">("list");

  function projectIdToNumber(id: any): number {
  if (typeof id === "string") return parseInt(id);
  if (Array.isArray(id)) return parseInt(id[0]);
  if (typeof id === "number") return id;
  return 0;
}


  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
      })
      .then(res => setProject(res.data))
      .catch(() => setError("Project not found."))
      .finally(() => setLoading(false));
  }, [projectId, refresh]);

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${selectedTask.id}/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setSelectedTask(null);
      setRefresh(r => r + 1);
    } catch {
      alert("Could not delete task!");
    }
  };

  if (loading) return <div className="text-gray-400 px-8 py-16">Loading...</div>;
  if (error || !project)
    return <div className="text-red-400 px-8 py-16">{error || "Not found."}</div>;

  const totalTasks = project.tasks?.length || 0;
  const doneTasks = project.tasks?.filter((t: any) => t.status === "done").length || 0;
  const progress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const budget = project.budget || 0;
  const deadline =
    project.due_date || (project.tasks?.map((t: any) => t.due_date).sort().reverse()[0] || null);

  async function handleStatusChange(taskId: number, newStatus: string) {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setRefresh(r => r + 1);
    } catch (e) {
      alert("Status update failed!");
    }
  }

  return (
    <>
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setView("list")}
          className={`px-4 py-2 rounded ${view === "list" ? "bg-blue-700 text-white" : "bg-zinc-800 text-gray-300"}`}
        >
          List View
        </button>
        <button
          onClick={() => setView("kanban")}
          className={`px-4 py-2 rounded ${view === "kanban" ? "bg-blue-700 text-white" : "bg-zinc-800 text-gray-300"}`}
        >
          Kanban View
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/dashboard/projects")}
            className="flex items-center gap-2 text-gray-300 hover:text-blue-400"
          >
            <ArrowLeft size={22}/> <span>Projects</span>
          </button>
          <span className="text-2xl font-bold ml-4">{project.name}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-10"></div>

        <div className="flex gap-2 mb-8">
          <button
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 text-white rounded"
            onClick={() => setShowEdit(true)}
          >
            Edit
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 px-3 py-1 text-white rounded"
            onClick={() => setShowAddTask(true)}
          >
            + Task
          </button>
          <button
            className="bg-neutral-800 hover:bg-neutral-700 px-3 py-1 text-white rounded"
            onClick={() => setShowInvite(true)}
          >
            + Invite Member
          </button>
        </div>

        {view === "list" ? (
          <div className="bg-zinc-900 rounded-2xl p-6 shadow mb-10">
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-semibold text-white">Tasks</div>
              <button
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 text-white rounded text-sm font-semibold"
                onClick={() => setShowAddTask(true)}
              >
                + Add Task
              </button>
            </div>
            {totalTasks ? (
              <ul className="divide-y divide-zinc-800">
                {project.tasks.map((task: any) => (
                  <li
                    key={task.id}
                    className="py-3 flex justify-between items-center hover:bg-zinc-800 px-3 rounded-xl transition cursor-pointer"
                    onClick={() => setSelectedTask(task)}
                  >
                    <div>
                      <div className="font-semibold text-white">{task.title}</div>
                      <div className="text-gray-400 text-sm">{task.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {task.status === "done" ? (
                          <span className="text-green-400 font-semibold">Done</span>
                        ) : (
                          <span className="text-yellow-300 font-semibold">{task.status}</span>
                        )} {task.due_date && <>| Due: {new Date(task.due_date).toLocaleDateString()}</>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-400">{task.priority}</span>
                      <span className="text-xs text-gray-400">{task.assigned_to_name || task.assigned_to || "—"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500 py-8 text-center">No tasks yet.</div>
            )}
          </div>
        ) : (
          <KanbanBoard
            tasks={project.tasks}
            teamMembers={project.team?.members || []}
            onTaskEdit={task => setSelectedTask(task)}
            onStatusChange={handleStatusChange}
            onAddTask={() => setShowAddTask(true)}
          />
        )}

        {/* Task Modal */}
        {selectedTask && (
          <TaskModal
            open={!!selectedTask}
            task={selectedTask}
            projectId={projectId ? projectId.toString() : ""}
            teamMembers={project.team?.members || []}
            onClose={() => setSelectedTask(null)}
            onDelete={handleDeleteTask}
            onTaskUpdated={() => setRefresh(r => r + 1)}
            onEditClick={() => setEditTask(selectedTask)}
          />
        )}

        {/* EditTaskModal */}
       {editTask && (
        <EditTaskModal
          open={true}
          task={editTask}
          projectId={projectIdToNumber(projectId)} // aici!
          teamMembers={project.team?.members || []}
          onClose={() => setEditTask(null)}
          onSaved={() => {
            setEditTask(null);
            setSelectedTask(null);
            setRefresh(r => r + 1);
          }}
        />
      )}

      </div>
    </>
  );
}
