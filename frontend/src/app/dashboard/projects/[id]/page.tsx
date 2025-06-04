// frontend/src/app/dashboard/projects/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // For future: modals for edit/invite/task
  // const [showEdit, setShowEdit] = useState(false);
  // const [showAddTask, setShowAddTask] = useState(false);
  // const [showInvite, setShowInvite] = useState(false);

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
  }, [projectId]);

  if (loading) return <div className="text-gray-400 px-8 py-16">Loading...</div>;
  if (error || !project)
    return <div className="text-red-400 px-8 py-16">{error || "Not found."}</div>;

  // Simple progress
  const totalTasks = project.tasks?.length || 0;
  const doneTasks = project.tasks?.filter((t: any) => t.status === "done").length || 0;
  const progress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Dummy values for budget/timeline (add real logic later)
  const budget = project.budget || 0;
  const deadline = project.due_date || project.tasks?.map((t: any) => t.due_date).sort().reverse()[0] || null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header + Back */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/dashboard/projects")}
          className="flex items-center gap-2 text-gray-300 hover:text-blue-400"
        >
          <ArrowLeft size={22} /> <span>Projects</span>
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
              <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-lg font-bold text-gray-400">
                +{project.team.members.length - 6}
              </div>
            )}
          </div>
          <button
            className="mt-5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-semibold"
            // onClick={() => setShowInvite(true)}
            disabled
            title="Invite member (soon)"
          >
            + Invite Member
          </button>
        </div>
      </div>

      {/* Task list */}
      <div className="bg-zinc-900 rounded-2xl p-6 shadow mb-10">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-semibold text-white">Tasks</div>
          <button
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 text-white rounded text-sm font-semibold"
            // onClick={() => setShowAddTask(true)}
            disabled
            title="Add Task (soon)"
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
                <Link
                  href={`/dashboard/tasks/${task.id}`}
                  className="text-blue-400 hover:underline ml-4 text-xs font-semibold"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500 py-8 text-center">No tasks yet.</div>
        )}
      </div>

      {/* Activity log - Placeholder */}
      <div className="bg-zinc-900 rounded-2xl p-6 shadow">
        <div className="text-lg font-semibold text-white mb-2">Activity</div>
        <div className="text-gray-400 text-sm">Project activity coming soon...</div>
      </div>
    </div>
  );
}
