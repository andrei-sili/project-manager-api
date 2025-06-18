"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Loader2, Edit, Plus, UserPlus2 } from "lucide-react";
import EditProjectModal from "@/components/EditProjectModal";
import AddTaskModal from "@/components/AddTaskModal";
import InviteMemberModal from "@/components/InviteMemberModal";
import { Project, Task, Team, TeamMember, User } from "@/lib/types";

export default function ProjectDetailPage() {
  const { lid } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showEditProject, setShowEditProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);

  // Fetch project, tasks, team, team members
  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access");
      // Fetch project details
      const projRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${lid}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProject(projRes.data);

      // Fetch tasks for project
      const tasksRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${lid}/tasks/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasksRes.data);

      // Fetch team for project
      if (projRes.data.team) {
        const teamRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/teams/${projRes.data.team.id}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTeam(teamRes.data);

        // Team members
        setTeamMembers(teamRes.data.members || []);
      } else {
        setTeam(null);
        setTeamMembers([]);
      }
    } catch (err) {
      setProject(null);
      setTasks([]);
      setTeam(null);
      setTeamMembers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (lid) fetchProjectData();
    // eslint-disable-next-line
  }, [lid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin" size={36} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center text-red-400 py-16">
        Project not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Project Info Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-400 mb-1">{project.name}</h1>
          <div className="text-gray-300 mb-2">{project.description}</div>
          <div className="text-sm text-blue-300">
            Team: {team?.name || "N/A"}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Created by: {project.created_by.first_name} {project.created_by.last_name} on {project.created_at?.slice(0, 10)}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-blue-400 transition"
            onClick={() => setShowEditProject(true)}
          >
            <Edit className="w-4 h-4" />
            Edit Project
          </button>
          <button
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-green-400 transition"
            onClick={() => setShowAddTask(true)}
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
          <button
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-indigo-400 transition"
            onClick={() => setShowInviteMember(true)}
          >
            <UserPlus2 className="w-4 h-4" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Modals */}
      {showEditProject && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditProject(false)}
          onProjectUpdated={fetchProjectData}
        />
      )}
      {showAddTask && (
        <AddTaskModal
          projectId={project.id}
          onClose={() => setShowAddTask(false)}
          onTaskAdded={fetchProjectData}
        />
      )}
      {showInviteMember && team && (
        <InviteMemberModal
          teamId={team.id}
          onClose={() => setShowInviteMember(false)}
          onMemberAdded={fetchProjectData}
        />
      )}

      {/* Tasks */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">Tasks</h2>
        {tasks.length === 0 ? (
          <div className="text-gray-400 text-sm">No tasks yet.</div>
        ) : (
          <ul className="flex flex-col gap-3">
            {tasks.map((task) => (
              <li key={task.id} className="bg-zinc-800 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <span className="font-semibold text-white text-lg">{task.title}</span>
                  <span className="text-sm text-gray-400">
                    Status: <b>{task.status}</b> | Due: {task.due_date || "N/A"}
                  </span>
                </div>
                {task.description && (
                  <div className="text-gray-300">{task.description}</div>
                )}
                <div className="text-xs text-gray-400">
                  Assigned to: {task.assigned_to || "N/A"}
                </div>
                <div className="text-xs text-gray-400">
                  Priority: {task.priority || "N/A"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Members */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Team Members</h2>
        {teamMembers.length === 0 ? (
          <div className="text-gray-400 text-sm">No members yet.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="px-3 py-1 rounded-full bg-zinc-900 text-sm text-blue-300 border border-zinc-700"
              >
                {member.user} ({member.role})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
