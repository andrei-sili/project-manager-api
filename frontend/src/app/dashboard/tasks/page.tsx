// frontend/src/app/dashboard/tasks/page.tsx
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import TaskModal from "@/components/TaskModal";
import { StatusBadge, PriorityBadge } from "@/components/TaskBadge";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/my-tasks/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      })
      .then((res) => setTasks(res.data.results || res.data))
      .finally(() => setLoading(false));
  }, []);

  // Fetch team members when a task is selected
  useEffect(() => {
    if (selectedTask && selectedTask.project?.id) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/projects/${selectedTask.project.id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        })
        .then((res) => setTeamMembers(res.data.team?.members || []));
      setProjectId(selectedTask.project.id);
    }
  }, [selectedTask]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-3">
      <div className="text-2xl font-bold mb-6 text-white">My Tasks</div>
      <div className="bg-zinc-900 rounded-2xl shadow p-5">
        {loading ? (
          <div className="text-gray-400">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-gray-500">No tasks found.</div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="py-3 flex justify-between items-center hover:bg-zinc-800 px-3 rounded-xl transition cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <div>
                  <div className="font-semibold text-white">{task.title}</div>
                  <div className="text-gray-400 text-sm">{task.description}</div>
                  <div className="flex gap-2 mt-1 text-xs items-center">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    <span className="ml-2 text-gray-400">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-blue-300">
                    {task.project?.name}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Assigned to:{" "}
                    {task.assigned_to_name || task.assigned_to || "—"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedTask && (
        <TaskModal
          open={!!selectedTask}
          task={selectedTask}
          projectId={projectId ?? ""}
          teamMembers={teamMembers}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={() => {
            setSelectedTask(null);
            // Re-fetch tasks on update
            setLoading(true);
            axios
              .get(`${process.env.NEXT_PUBLIC_API_URL}/my-tasks/`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
              })
              .then((res) => setTasks(res.data.results || res.data))
              .finally(() => setLoading(false));
          }}
        />
      )}
    </div>
  );
}
