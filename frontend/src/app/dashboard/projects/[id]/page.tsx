"use client";
import React, { useEffect, useState } from "react";
import { Loader2, Edit, Users, Plus, Clock, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import KanbanBoard from "@/components/KanbanBoard";
import EditProjectModal from "@/components/EditProjectModal";
import InviteMemberModal from "@/components/InviteMemberModal";
import AddTaskModal from "@/components/AddTaskModal";
import type { Project, TeamMember, Task } from "@/lib/types";
import TaskModal from "@/components/TaskModal";

export default function ProjectDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showEdit, setShowEdit] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // LOAD PROJECT
  const fetchAll = () => {
    setLoading(true);
    axiosClient.get(`/projects/${id}/`)
      .then(res => {
        setProject(res.data);
        setTasks(res.data.tasks || []);
        setMembers(res.data.members || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [id, showEdit, showInvite, showAddTask]);

  // PROGRESS
  const taskTotal = tasks.length;
  const taskDone = tasks.filter(t => t.status === "done").length;
  const progress = taskTotal ? Math.round((taskDone / taskTotal) * 100) : 0;
  const timeTracked = (project?.time_tracked || 0);

  // TEAM AVATARS
  function renderTeamAvatars() {
    return (
      <div className="flex -space-x-4">
        {(members ?? []).slice(0, 4).map((m, i) => (
          <div key={i} className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-zinc-900 bg-blue-900 text-blue-200 font-bold shadow text-md select-none uppercase">
            {((m.user?.first_name ?? "")[0] ?? "") + ((m.user?.last_name ?? "")[0] ?? "")}
          </div>
        ))}
        {(members ?? []).length > 4 && (
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-zinc-900 bg-zinc-700 text-white text-md font-bold">+{members.length-4}</span>
        )}
      </div>
    );
  }

  if (loading || !project) {
    return (
      <div className="flex justify-center py-32"><Loader2 className="animate-spin text-blue-600" size={38}/></div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 py-8">
      {/* BACK TO PROJECTS */}
      <button
        onClick={() => router.push("/dashboard/projects")}
        className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl font-semibold bg-zinc-900 border border-zinc-700 text-gray-200 hover:bg-blue-800 transition"
      >
        <ArrowLeft size={19} /> Back to Projects
      </button>

      {/* HEADER */}
      <div className="bg-zinc-900 rounded-2xl shadow p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-7 border border-zinc-800">
        <div>
          <div className="flex gap-2 items-center mb-2">
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            {project.status && (
              <span className="ml-2 text-xs font-semibold px-3 py-1 rounded-full bg-blue-900 text-blue-300 border border-blue-700 uppercase">{project.status}</span>
            )}
            <button
              className="ml-2 p-1 rounded hover:bg-blue-700 transition"
              onClick={() => setShowEdit(true)}
              title="Edit project"
            >
              <Edit size={20} />
            </button>
          </div>
          <div className="text-gray-400 mb-1">{project.description}</div>
          <div className="flex items-center gap-5 mt-2">
            <span className="text-xs bg-zinc-800 text-gray-300 px-3 py-1 rounded border border-zinc-700">Team: {project.team?.name}</span>
            {project.due_date && (
              <span className="text-xs bg-zinc-800 text-gray-300 px-3 py-1 rounded border border-zinc-700">Deadline: {new Date(project.due_date).toLocaleDateString()}</span>
            )}
            <span className="text-xs text-gray-500 ml-3">Created {project.created_at ? new Date(project.created_at).toLocaleDateString() : ""}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {/* PROGRESS */}
          <div className="w-48">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{taskDone}/{taskTotal} tasks</span>
            </div>
            <div className="w-full h-3 rounded bg-zinc-800">
              <div
                className="h-3 rounded bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 text-blue-300 font-bold">
            <Clock size={18}/> Time tracked: <span className="text-white">{Math.floor(timeTracked/60)}h {timeTracked%60}m</span>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg text-white font-bold flex items-center gap-2 shadow"
              onClick={() => setShowInvite(true)}
            >
              <Users size={18}/> Invite Member
            </button>
            <button
              className="px-4 py-2 bg-green-700 hover:bg-green-800 rounded-lg text-white font-bold flex items-center gap-2 shadow"
              onClick={() => setShowAddTask(true)}
            >
              <Plus size={18}/> Add Task
            </button>
          </div>
        </div>
      </div>

      {/*  */}
      <div className="flex items-center gap-4 mb-8">{renderTeamAvatars()}</div>

      {/* KANBAN BOARD */}
      <div className="bg-zinc-900 rounded-2xl p-7 shadow border border-zinc-800 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-blue-300">Kanban Board</h2>
          <button
            className="px-4 py-2 bg-green-700 hover:bg-green-800 rounded-lg text-white font-bold flex items-center gap-2 shadow"
            onClick={() => setShowAddTask(true)}
          >
            <Plus size={18}/> Add Task
          </button>
        </div>
        <KanbanBoard
          tasks={tasks}
          teamMembers={members ?? []}
          onStatusChange={(taskId, status) => {
            axiosClient.patch(`/tasks/${taskId}/`, { status }).then(fetchAll);
          }}
          onAddTask={() => setShowAddTask(true)}
          onViewTask={setSelectedTask}
        />
      </div>

      {/* Edit Project Modal */}
      {showEdit && (
        <EditProjectModal
          project={project}
          open={showEdit}
          onClose={() => setShowEdit(false)}
          onUpdated={fetchAll}
        />
      )}
      {/* Invite Member Modal */}
      {showInvite && (
        <InviteMemberModal
          projectId={project.id}
          open={showInvite}
          onClose={() => setShowInvite(false)}
          onInvited={fetchAll}
        />
      )}
      {/* Add Task Modal */}
      {selectedTask && (
        <TaskModal
          open={!!selectedTask}
          task={selectedTask}
          projectId={id}
          teamMembers={members}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={fetchAll}
        />
      )}

    </div>
  );
}
