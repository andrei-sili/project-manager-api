// frontend/src/app/dashboard/projects/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditProjectModal from "@/components/EditProjectModal";
import InviteMemberModal from "@/components/InviteMemberModal";
import AddTaskModal from "@/components/AddTaskModal";
import EditTaskModal from "@/components/EditTaskModal";
import KanbanBoard from "@/components/KanbanBoard";

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [showInvite, setShowInvite] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editTask, setEditTask] = useState<any | null>(null);
  const [view, setView] = useState<"list" | "kanban">("list");

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

  if (loading) return <div className="text-gray-400 px-8 py-16">Loading...</div>;
  if (error || !project)
    return <div className="text-red-400 px-8 py-16">{error || "Not found."}</div>;

  // Simple progress
  const totalTasks = project.tasks?.length || 0;
  const doneTasks = project.tasks?.filter((t: any) => t.status === "done").length || 0;
  const progress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const budget = project.budget || 0;
  const deadline =
    project.due_date ||
    (project.tasks?.map((t: any) => t.due_date).sort().reverse()[0] || null);

  // --- PATCH task status for Kanban ---
  async function handleStatusChange(taskId: number, newStatus: string) {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
        }
      );
      setRefresh(r => r + 1);
    } catch (e) {
      alert("Status update failed!");
    }
  }

  return (
    <>
      {/* Tabs for List/Kanban */}
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
        {/* Header + Back */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/dashboard/projects")}
            className="flex items-center gap-2 text-gray-300 hover:text-blue-400"
          >
            <ArrowLeft size={22}/> <span>Projects</span>
          </button>
          <span className="text-2xl font-bold ml-4">{project.name}</span>
        </div>

        {/* Project info / stats */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          <div className="bg-zinc-900 p-6 rounded-2xl shadow flex flex-col justify-between border-l-4 border-blue-600">
            <div>
              <div className="text-sm text-gray-400 mb-2">Description</div>
              <div className="font-semibold text-lg text-white">{project.description}</div>
            </div>
            <div className="mt-4 flex gap-3">
              <span className="bg-blue-900/40 rounded px-3 py-1 text-blue-300 text-xs font-semibold">
                {project.team?.name || "No Team"}
              </span>
              {project.tags?.map((tag: string) => (
                <span key={tag} className="bg-zinc-700 rounded px-2 py-0.5 text-xs">{tag}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="bg-pink-900/80 rounded-2xl p-4 text-white flex items-center justify-between shadow">
              <div>
                <div className="text-xs text-pink-200 mb-1">Deadline</div>
                <div className="font-semibold text-lg">
                  {deadline ? new Date(deadline).toLocaleDateString() : "—"}
                </div>
              </div>
            </div>
            <div className="bg-blue-950 rounded-2xl p-4 text-white flex items-center justify-between shadow">
              <div>
                <div className="text-xs text-blue-200 mb-1">Budget</div>
                <div className="font-semibold text-lg">{budget} €</div>
              </div>
            </div>
            <div className="bg-green-950 rounded-2xl p-4 text-white flex items-center justify-between shadow">
              <div>
                <div className="text-xs text-green-200 mb-1">Progress</div>
                <div className="font-bold text-xl">{progress}%</div>
              </div>
              <div className="flex flex-col text-xs text-green-400 items-end">
                <span>{doneTasks} / {totalTasks} tasks</span>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-6 shadow flex flex-col">
            <div className="text-xs text-gray-400 mb-2">Team Members</div>
            <div className="flex -space-x-3">
              {project.team?.members?.length ? (
                project.team.members.slice(0, 6).map((m: any, idx: number) => (
                  <div
                    key={idx}
                    className="relative w-10 h-10 rounded-full bg-blue-950 border-2 border-zinc-900 flex items-center justify-center text-xl font-bold text-blue-300"
                    title={m.user || m.email}
                  >
                    {(m.user || m.email)?.[0]?.toUpperCase() || "U"}
                  </div>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No members</span>
              )}
              {project.team?.members?.length > 6 && (
                <div
                  className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-lg font-bold text-gray-400">
                  +{project.team.members.length - 6}
                </div>
              )}
            </div>
            <button
              className="bg-neutral-800 hover:bg-neutral-700 px-3 py-1 text-white rounded"
              onClick={() => setShowInvite(true)}
            >
              + Invite Member
            </button>
          </div>
        </div>

        {/* Edit, Add, Invite buttons */}
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

        {/* --- VIEWS: List or Kanban --- */}
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
                    className="py-3 flex justify-between items-center hover:bg-zinc-800 px-3 rounded-xl transition"
                  >
                    <div>
                      <div className="font-semibold text-white">{task.title}</div>
                      <div className="text-gray-400 text-sm">{task.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {task.status === "done" ? (
                          <span className="text-green-400 font-semibold">Done</span>
                        ) : (
                          <span className="text-yellow-300 font-semibold">{task.status}</span>
                        )}{" "}
                        {task.due_date && <>| Due: {new Date(task.due_date).toLocaleDateString()}</>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="bg-blue-800 hover:bg-blue-600 text-white rounded px-3 py-1 text-xs"
                        onClick={() => setEditTask(task)}
                        title="Edit Task"
                      >
                        Edit
                      </button>
                      <Link
                        href={`/dashboard/tasks/${task.id}`}
                        className="text-blue-400 hover:underline ml-2 text-xs font-semibold"
                      >
                        View
                      </Link>
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
            onTaskEdit={task => setEditTask(task)}
            onStatusChange={handleStatusChange}
            onAddTask={() => setShowAddTask(true)}
          />
        )}

        {/* Activity log - Placeholder */}
        <div className="bg-zinc-900 rounded-2xl p-6 shadow">
          <div className="text-lg font-semibold text-white mb-2">Activity</div>
          <div className="text-gray-400 text-sm">Project activity coming soon...</div>
        </div>

        {/* --- MODALS --- */}
        <EditProjectModal
          project={project}
          open={showEdit}
          onClose={() => setShowEdit(false)}
          onUpdated={() => setRefresh(r => r + 1)}
        />
        <InviteMemberModal
          open={showInvite}
          onClose={() => setShowInvite(false)}
          teamId={project.team?.id}
          onInvited={() => setRefresh(r => r + 1)}
        />
        <AddTaskModal
          open={showAddTask}
          onClose={() => setShowAddTask(false)}
          projectId={project.id}
          teamMembers={project.team?.members || []}
          onAdded={() => setRefresh(r => r + 1)}
        />
        <EditTaskModal
          open={!!editTask}
          task={editTask}
          teamMembers={project.team?.members || []}
          projectId={project.id}
          onClose={() => setEditTask(null)}
          onSaved={() => setRefresh(r => r + 1)}
        />
      </div>
    </>
  );
}
