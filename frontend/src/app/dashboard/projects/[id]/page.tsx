"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api, { Team, Task } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Edit, UserPlus, PlusCircle, Users, CheckCircle2, Loader2 } from "lucide-react";

interface ProjectDetails {
  id: number;
  name: string;
  description: string;
  team: Team;
  created_by: string;
  created_at: string;
  tasks: (Task & { assigned_to?: string })[];
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/projects/${projectId}/`)
      .then((res) => setProject(res.data))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [projectId]);

  // Helper: Progress %
  const taskCount = project?.tasks?.length || 0;
  const completedCount = project?.tasks?.filter(t => t.completed).length || 0;
  const progress = taskCount ? Math.round((completedCount / taskCount) * 100) : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="animate-spin w-10 h-10 text-blue-400" />
    </div>
  );

  if (!project) return (
    <div className="p-10 text-red-400">Project not found.</div>
  );

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      {/* Back button */}
      <button onClick={() => router.back()} className="mb-6 flex items-center text-gray-400 hover:text-blue-400">
        <ArrowLeft className="w-5 h-5 mr-1" /> Back to Projects
      </button>

      {/* Main Info Card */}
      <div className="bg-[#232734] rounded-2xl shadow-xl p-8 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold mb-1 text-white">{project.name}</h1>
            {/* Edit project - placeholder */}
            <button className="p-2 rounded hover:bg-[#313744] text-blue-400" title="Edit Project">
              <Edit size={20} />
            </button>
          </div>
          <p className="text-base text-gray-300 mb-4">{project.description || <span className="italic text-gray-500">No description yet.</span>}</p>
          <div className="flex flex-wrap gap-6 text-sm mb-3">
            <div>
              <Users className="inline w-4 h-4 mr-1 -mt-1 text-blue-400" />
              <span className="font-semibold">Team:</span>
              <Link href="/dashboard/teams" className="hover:underline text-blue-400 ml-1">{project.team?.name}</Link>
            </div>
            <div>
              <span className="font-semibold">Created by:</span> {project.created_by}
            </div>
            <div>
              <span className="font-semibold">Created:</span> {new Date(project.created_at).toLocaleString()}
            </div>
          </div>
        </div>
        {/* Members avatars */}
        <div className="flex flex-col items-end">
          <div className="flex -space-x-2 mb-2">
            {project.team?.members?.slice(0, 6).map((member, idx) => (
              <span
                key={member.email + idx}
                title={member.user || member.email}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-700 text-white font-bold border-2 border-black shadow"
              >
                {(member.user && member.user.length > 0)
                  ? member.user[0]
                  : member.email[0].toUpperCase()}
              </span>
            ))}
            {project.team?.members?.length > 6 && (
              <span className="ml-2 text-xs text-gray-400 mt-2">
                +{project.team.members.length - 6} more
              </span>
            )}
            {/* Add member button - placeholder */}
            <button className="ml-4 text-blue-400 hover:text-blue-200" title="Add Member">
              <UserPlus size={24} />
            </button>
          </div>
          <div className="text-sm text-gray-400">{project.team?.members?.length || 0} members</div>
        </div>
      </div>

      {/* Grid: Tasks + Team */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* TASKS */}
        <div className="bg-[#232734] rounded-2xl p-6 shadow flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="text-green-400" /> Tasks
            </h2>
            {/* Add task - placeholder */}
            <button className="text-green-400 hover:text-green-300" title="Add Task">
              <PlusCircle size={22} />
            </button>
          </div>
          <div className="mb-3">
            <span className="text-xs text-gray-400">
              {completedCount}/{taskCount} complete
            </span>
            <div className="w-full h-2 rounded bg-gray-700 mt-1">
              <div
                className="h-2 rounded bg-gradient-to-r from-green-400 to-blue-500 transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          {(!project.tasks || project.tasks.length === 0) ? (
            <p className="text-gray-400 mt-5">No tasks for this project.</p>
          ) : (
            <ul className="space-y-2">
              {project.tasks.map((task, idx) => (
                <li
                  key={task.title + idx}
                  className="flex items-center gap-3 text-base"
                >
                  <span className={`inline-block w-4 h-4 rounded-full border border-gray-600 ${task.completed ? 'bg-green-500' : 'bg-yellow-400 animate-pulse'}`}></span>
                  <span className={task.completed ? "line-through text-gray-500" : ""}>
                    {task.title}
                  </span>
                  {task.assigned_to && (
                    <span className="ml-2 text-xs text-gray-400">
                      — assigned to <span className="font-semibold text-blue-300">{task.assigned_to}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* TEAM */}
        <div className="bg-[#232734] rounded-2xl p-6 shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="text-blue-400" /> Team Members
          </h2>
          <ul className="space-y-2">
            {project.team?.members?.length === 0 && <li className="text-gray-400">No members.</li>}
            {project.team?.members?.map((member, idx) => (
              <li key={member.email + idx} className="flex items-center gap-3">
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-700 text-white font-bold border-2 border-black"
                  title={member.user || member.email}
                >
                  {(member.user && member.user.length > 0)
                    ? member.user[0]
                    : member.email[0].toUpperCase()}
                </span>
                <span className="font-medium">{member.user || member.email}</span>
                <span className="ml-2 text-xs text-gray-400">
                  ({member.role})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Extra: Descriere, linkuri, tags */}
      <div className="flex flex-wrap gap-4">
        {/* Example badge */}
        <span className="inline-block px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-xs uppercase font-semibold tracking-wider">
          ID: {project.id}
        </span>
        {/* Add more badges as needed */}
      </div>
    </div>
  );
}
