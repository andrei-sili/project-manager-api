// frontend/src/app/dashboard/projects/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <div className="text-gray-400">Loading...</div>;
  if (error || !project)
    return <div className="text-red-400">{error || "Not found."}</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <div className="text-gray-400">{project.description}</div>
          <div className="text-sm mt-2">
            Team:{" "}
            {project.team ? (
              <span className="font-semibold">{project.team.name}</span>
            ) : (
              <span className="text-gray-500">No team</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {/* buttons */}
          <button
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 text-white rounded"
            // onClick={() => setShowEdit(true)}
            disabled
            title="Edit project (soon)"
          >
            Edit
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 px-3 py-1 text-white rounded"
            // onClick={() => setShowAddTask(true)}
            disabled
            title="Add Task (soon)"
          >
            + Task
          </button>
          <button
            className="bg-neutral-700 hover:bg-neutral-800 px-3 py-1 text-white rounded"
            // onClick={() => setShowInvite(true)}
            disabled
            title="Invite member (soon)"
          >
            Invite
          </button>
        </div>
      </div>

      {/* team members */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Team Members</h3>
        {project.team && project.team.members && project.team.members.length ? (
          <ul className="flex flex-wrap gap-3">
            {project.team.members.map((m: any) => (
              <li
                key={m.id}
                className="bg-zinc-800 px-3 py-1 rounded-lg text-sm font-semibold"
              >
                {m.user ? m.user : m.email}
                {m.role ? (
                  <span className="text-xs ml-1 text-blue-400">{m.role}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500">No members yet.</div>
        )}
      </div>

      {/* task list */}
      <div>
        <h3 className="font-semibold mb-2">Tasks</h3>
        {project.tasks && project.tasks.length ? (
          <ul className="space-y-2">
            {project.tasks.map((task: any) => (
              <li
                key={task.id}
                className="bg-zinc-800 rounded-lg px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">{task.title}</div>
                  <div className="text-gray-400 text-sm">
                    {task.description}
                  </div>
                  <div className="text-xs text-gray-500">
                    Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"} | Status:{" "}
                    <span className="font-semibold">{task.status}</span>
                  </div>
                </div>
                <Link
                  href={`/dashboard/tasks/${task.id}`}
                  className="text-blue-400 hover:underline ml-4"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500">No tasks yet.</div>
        )}
      </div>
    </div>
  );
}
