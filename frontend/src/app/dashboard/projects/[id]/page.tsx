"use client";
import { useState, useEffect } from "react";
import axiosClient from "@/lib/axiosClient";
import KanbanBoard from "@/components/KanbanBoard";
import AddTaskModal from "@/components/AddTaskModal";
import EditTaskModal from "@/components/EditTaskModal";
import TaskModal from "@/components/TaskModal";
import InviteMemberModal from "@/components/InviteMemberModal";
import { useRouter, useParams } from "next/navigation";
import { Project, Task, TeamMember } from "@/lib/types";
import EditProjectModal from "@/components/EditProjectModal";

export default function ProjectDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(0);

  // Progress și time
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === "done").length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const restMinutes = totalMinutes % 60;

  // Fetch ALL (project, tasks, team)
  async function fetchAll() {
    setLoading(true);
    try {
      // 1. Project
      const { data: projectData } = await axiosClient.get(`/projects/${id}/`);
      setProject(projectData);

      // 2. Tasks
      const { data: tasksData } = await axiosClient.get(`/projects/${id}/tasks/`);
      setTasks(tasksData.results || []);

      // 3. Team Members (by team id din project)
      if (projectData.team?.id || projectData.team_id || projectData.team) {
        const tid = projectData.team?.id || projectData.team_id || projectData.team;
        if (tid) {
          const { data: teamData } = await axiosClient.get(`/teams/${tid}/`);
          setMembers(teamData.members || []);
        } else {
          setMembers([]);
        }
      } else {
        setMembers([]);
      }

      // 4. Project time tracked (summary)
      const { data: timeSummary } = await axiosClient.get(`/time-entries/summary/?project=${id}`);
      setTotalMinutes(timeSummary.total_minutes || 0);

    } catch (err) {
      setProject(null);
      setTasks([]);
      setMembers([]);
      setTotalMinutes(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [id]);

  // Kanban handlers
  async function handleStatusChange(taskId: number, newStatus: string) {
    await axiosClient.patch(`/projects/${id}/tasks/${taskId}/`, { status: newStatus });
    fetchAll();
  }

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto pb-20 pt-10">
      {/* Project HEADER + meta */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6 p-8 rounded-3xl shadow-xl bg-gradient-to-tr from-zinc-900 via-zinc-950 to-zinc-900 border border-blue-900">
        <div className="flex flex-col gap-2">
          <button
            className="text-blue-400 text-sm hover:underline mb-2 w-max"
            onClick={() => router.push("/dashboard/projects")}
          >← Back to projects</button>
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
            {project?.name || "Project"}
          </h1>
          <p className="text-zinc-300 text-lg mb-2">{project?.description || "No description provided."}</p>
          <div className="flex flex-wrap gap-8 mt-2 text-sm">
            <div>
              <span className="font-medium text-zinc-400">Created:</span>{" "}
              {project?.created_at && new Date(project.created_at).toLocaleDateString()}
            </div>
            {project?.due_date && (
              <div>
                <span className="font-medium text-zinc-400">Deadline:</span>{" "}
                {new Date(project.due_date).toLocaleDateString()}
              </div>
            )}
            {project?.created_by && (
              <div>
                <span className="font-medium text-zinc-400">Created by:</span>{" "}
                {project.created_by.first_name} {project.created_by.last_name}
              </div>
            )}
          </div>
          {/* Time + Progress */}
          <div className="flex gap-6 mt-3">
            <div className="text-zinc-400 flex gap-2 items-center">
              <span className="font-bold text-lg text-blue-400">{progress}%</span> Progress
              <div className="w-32 h-2 bg-zinc-800 rounded ml-2">
                <div className="bg-blue-500 h-2 rounded" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="ml-2 text-xs text-zinc-500">{doneTasks}/{totalTasks} done</span>
            </div>
            <div className="text-zinc-400 flex gap-2 items-center">
              <span className="font-bold text-lg text-green-400">{totalHours}h {restMinutes}m</span> Total tracked
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button
            className="bg-blue-600 hover:bg-blue-800 text-white px-7 py-3 rounded-2xl font-bold text-lg shadow-lg transition border border-blue-900"
            onClick={() => setShowEditProject(true)}
          >
            Edit Project
          </button>
          <button
            className="bg-blue-400 hover:bg-blue-700 text-white px-7 py-3 rounded-2xl font-bold text-lg shadow-lg transition border border-blue-900"
            onClick={() => setShowInvite(true)}
          >
            Add Member
          </button>
        </div>
      </div>

      {/* Team Members */}
      <div className="rounded-2xl shadow-lg bg-zinc-900 border border-zinc-800 p-7">
        <h2 className="text-2xl font-bold mb-5 text-white">Team Members</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {members.length === 0 && (
            <div className="text-zinc-500 col-span-full text-center">No team members found.</div>
          )}
          {members.map((member) => (
            <div key={member.user?.id}
              className="rounded-xl bg-zinc-800 p-4 flex flex-col gap-1 border border-zinc-700 shadow hover:shadow-lg transition">
              <div className="font-semibold text-white flex items-center gap-2">
                {member.user?.first_name} {member.user?.last_name}
              </div>
              <div className="text-blue-300 text-xs">{member.user?.email}</div>
              <div className="text-xs text-zinc-400 flex gap-3">
                <span className="font-bold">{member.role || "Member"}</span>
                <span className="ml-2">
                  Joined: {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : "-"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Tasks */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">Tasks</h2>
        {loading ? (
          <div className="text-center text-blue-300 py-16">Loading...</div>
        ) : (
          <KanbanBoard
            tasks={tasks}
            teamMembers={members}
            onStatusChange={handleStatusChange}
            onAddTask={() => setShowAdd(true)}
            onViewTask={setViewTask}
          />
        )}
      </div>

      {/* MODALS */}
      {showEditProject && (
        <EditProjectModal
          open={showEditProject}
          project={project}
          onClose={() => setShowEditProject(false)}
          onSaved={fetchAll}
        />
      )}

      {showInvite && (
        <InviteMemberModal
          open={showInvite}
          teamId={project?.team?.id || project?.team}
          onClose={() => setShowInvite(false)}
          onInvited={fetchAll}
        />
      )}

      {showAdd && (
        <AddTaskModal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          projectId={id}
          teamMembers={members}
          onAdded={fetchAll}
        />
      )}
      {editTask && (
        <EditTaskModal
          open={!!editTask}
          task={editTask}
          teamMembers={members}
          projectId={Number(id)}
          onClose={() => setEditTask(null)}
          onSaved={fetchAll}
        />
      )}
      {viewTask && (
        <TaskModal
          open={!!viewTask}
          task={viewTask}
          projectId={id}
          teamMembers={members}
          onClose={() => setViewTask(null)}
          onEditClick={() => {
            setEditTask(viewTask);
            setViewTask(null);
          }}
          onDelete={async () => {
            if (window.confirm("Delete this task?")) {
              await axiosClient.delete(`/projects/${id}/tasks/${viewTask.id}/`);
              setViewTask(null);
              fetchAll();
            }
          }}
          onTaskUpdated={fetchAll}
        />
      )}
    </div>
  );
}
