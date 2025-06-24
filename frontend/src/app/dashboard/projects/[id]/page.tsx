// frontend/src/app/dashboard/projects/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import axiosClient from "@/lib/axiosClient";
import KanbanBoard from "@/components/KanbanBoard";
import AddTaskModal from "@/components/AddTaskModal";
import EditTaskModal from "@/components/EditTaskModal";
import TaskModal from "@/components/TaskModal";
import { useRouter, useParams } from "next/navigation";

export default function ProjectDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editTask, setEditTask] = useState<any | null>(null);
  const [viewTask, setViewTask] = useState<any | null>(null);

  // Fetch data
  async function fetchAll() {
    // Fetch project
    const { data: projectData } = await axiosClient.get(`/projects/${id}/`);
    setProject(projectData);
    // Fetch tasks
    const { data: tasksData } = await axiosClient.get(`/projects/${id}/tasks/`);
    setTasks(tasksData.results || []);
    // Fetch team members
    const { data: teamData } = await axiosClient.get(`/teams/${projectData.team}/`);
    setMembers(teamData.members || []);
  }

  useEffect(() => { fetchAll(); }, [id]);

  // Kanban handlers
  async function handleStatusChange(taskId: number, newStatus: string) {
    await axiosClient.patch(`/projects/${id}/tasks/${taskId}/`, { status: newStatus });
    fetchAll();
  }

  // Remove AddTask button from column header, show it only once
  return (
    <div className="flex flex-col gap-6 max-w-[1800px] mx-auto pb-20 pt-10">
      <div className="flex justify-between items-center mb-4">
        <button className="text-blue-400 text-sm" onClick={() => router.push("/dashboard/projects")}>← Back to projects</button>
        <h1 className="text-3xl font-bold">{project?.name || "Project"}</h1>
        <button
          className="bg-blue-600 hover:bg-blue-800 text-white px-5 py-2 rounded-xl font-bold text-lg shadow"
          onClick={() => setShowAdd(true)}
        >
          + Add Task
        </button>
      </div>

      <KanbanBoard
        tasks={tasks}
        teamMembers={members}
        onStatusChange={handleStatusChange}
        onAddTask={() => setShowAdd(true)}
        onViewTask={(task) => setViewTask(task)}
      />

      {/* MODALS */}
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
