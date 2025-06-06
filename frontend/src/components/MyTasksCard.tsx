// frontend/src/components/MyTasksCard.tsx

import React from "react";
import Link from "next/link";
import { ListTodo, Clock, ChevronRight } from "lucide-react";

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  due_date?: string | null;
  project?: { id: number; name: string };
}

interface Props {
  tasks: Task[];
  loading?: boolean;
}

const statusColors: Record<string, string> = {
  "todo": "bg-blue-400",
  "in_progress": "bg-yellow-500",
  "done": "bg-green-500",
};

const priorityColors: Record<string, string> = {
  "low": "border-green-500",
  "medium": "border-yellow-500",
  "high": "border-red-500",
};

function formatDate(dateString?: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

export default function MyTasksCard({ tasks, loading }: Props) {
  const visibleTasks = (tasks || []).slice(0, 4);

  return (
      <div className="bg-zinc-900 rounded-2xl shadow p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">My Tasks</h3>
              <Link
                  href="/dashboard/tasks"
                  className="flex items-center gap-2 text-blue-400 hover:underline font-medium"
              >
                  <ListTodo className="w-5 h-5"/>
                  View All
              </Link>
          </div>

          {/* Task Progress Summary */}
          <div className="flex flex-wrap items-center gap-1 mb-2 text-sm font-medium">
              <span className="text-green-500">
                {tasks.filter((t) => t.status === "done").length} done
              </span>
                          <span className="text-gray-400">/</span>
                          <span className="text-yellow-400">
                {tasks.filter((t) => t.status === "in_progress").length} in_progress
              </span>
                          <span className="text-gray-400">/</span>
                          <span className="text-blue-400">
                {tasks.filter((t) => t.status === "todo").length} todo
              </span>
                          <span className="text-gray-400">/</span>
                          <span className="text-white">{tasks.length} total</span>
          </div>

          {/* Bar progress */}
          <div className="w-full h-1 rounded overflow-hidden bg-zinc-800 mb-4 flex">
              <div
                  className="h-1 bg-green-500"
                  style={{
                      width: `${(tasks.filter((t) => t.status === "done").length / tasks.length) * 100}%`,
                  }}
              />
              <div
                  className="h-1 bg-yellow-400"
                  style={{
                      width: `${(tasks.filter((t) => t.status === "in_progress").length / tasks.length) * 100}%`,
                  }}
              />
              <div
                  className="h-1 bg-blue-500"
                  style={{
                      width: `${(tasks.filter((t) => t.status === "todo").length / tasks.length) * 100}%`,
                  }}
              />
          </div>


          {/* List mini task cards */}
          <div className="grid grid-cols-2 gap-3">
              {loading ? (
                  <div className="col-span-2 text-center text-gray-400">Loading tasks...</div>
              ) : visibleTasks.length === 0 ? (
                  <div className="col-span-2 text-center text-gray-500 text-sm">No tasks found.</div>
              ) : (
                  visibleTasks.map((task) => (
                      <Link
                          key={task.id}
                          href={`/dashboard/projects/${task.project?.id}/tasks/${task.id}`}
                          className="bg-zinc-800 hover:bg-zinc-700 rounded-xl p-3 flex flex-col gap-1 transition border border-transparent hover:border-blue-600 group focus:outline-none"
                      >
                          <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold truncate">{task.title}</span>
                              {/* Priority badge */}
                              <span
                                  className={`ml-2 border-2 rounded-full w-3 h-3 block ${
                                      priorityColors[task.priority?.toLowerCase() || "low"] || "border-gray-500"
                                  }`}
                                  title={`Priority: ${task.priority}`}
                              />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                              {/* Status dot */}
                              <span
                                  className={`w-2 h-2 rounded-full inline-block ${
                                      statusColors[task.status?.toLowerCase()] || "bg-gray-500"
                                  }`}
                                  title={task.status}
                              />
                              <span
                                  className={`capitalize font-semibold ${
                                      task.status?.toLowerCase() === "todo"
                                          ? "text-blue-400"
                                          : task.status?.toLowerCase() === "in_progress"
                                              ? "text-yellow-400"
                                              : task.status?.toLowerCase() === "done"
                                                  ? "text-green-500"
                                                  : "text-gray-400"
                                  }`}
                              >
                          {task.status}
                        </span>

                              {task.due_date && (
                                  <>
                                      <Clock className="w-3 h-3 ml-2"/>
                                      <span>{formatDate(task.due_date)}</span>
                                  </>
                              )}
                          </div>
                          {/* Project Name */}
                          <div className="text-xs text-blue-300 truncate">
                              {task.project?.name}
                          </div>
                          {/* Progres bar - demo logic (100%  done, 60%  in progress, 0%  todo) */}
                          <div className="w-full h-1 rounded bg-zinc-700 mt-1">
                              <div
                                  className={`h-1 rounded transition-all ${
                                      task.status === "done"
                                          ? "bg-green-500"
                                          : task.status === "in_progress"
                                              ? "bg-yellow-400"
                                              : "bg-blue-500"
                                  }`}
                                  style={{
                                      width:
                                          task.status === "done"
                                              ? "100%"
                                              : task.status === "in_progress"
                                                  ? "60%"
                                                  : "5%",
                                  }}
                              />
                          </div>

                      </Link>
                  ))
              )}
          </div>
      </div>
  );
}
