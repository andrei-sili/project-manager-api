"use client";
import { useEffect, useState } from "react";
import axiosClient from "@/lib/axiosClient";
import KanbanBoard from "@/components/KanbanBoard";
import AddTaskModal from "@/components/AddTaskModal";
import EditTaskModal from "@/components/EditTaskModal";
import TaskModal from "@/components/TaskModal";
import { Task } from "@/lib/types";

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  async function loadTasks() {
    try {
      const { data } = await axiosClient.get("/my-tasks/");
      setTasks(data.results);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  }

  async function handleStatusChange(taskId: number, newStatus: string) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  await axiosClient.patch(
  `/projects/${task.project?.id || task.project}/tasks/${taskId}/`,
  { status: newStatus }
);


  loadTasks();
}


  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">My Tasks</h1>
      <KanbanBoard
        tasks={tasks}
        onAddTask={() => setShowAdd(true)}
        onStatusChange={handleStatusChange}
        onViewTask={setViewTask}
        teamMembers={[]}
      />

      {showAdd && (
        <AddTaskModal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          onAdded={loadTasks}
          projectId={null}
          teamMembers={[]}
        />
      )}

      {editTask && (
        <EditTaskModal
          open={!!editTask}
          task={editTask}
          teamMembers={[]}
          onClose={() => setEditTask(null)}
          onSaved={loadTasks}
          projectId={editTask.project.id}
        />
      )}

      {viewTask && (
        <TaskModal
          open={!!viewTask}
          task={viewTask}
          onClose={() => setViewTask(null)}
          onEditClick={() => {
            setEditTask(viewTask);
            setViewTask(null);
          }}
          onDelete={async () => {
            if (window.confirm("Delete this task?")) {
              await axiosClient.delete(`/projects/${viewTask.project.id}/tasks/${viewTask.id}/`);
              setViewTask(null);
              loadTasks();
            }
          }}
          onTaskUpdated={loadTasks}
          projectId={viewTask.project.id.toString()}
          teamMembers={[]}
        />
      )}
    </div>
  );
}
