// frontend/src/components/TaskBadge.tsx
import React from "react";
import { Task } from "@/lib/types";

export function statusBadgeColor(status: string) {
  switch ((status ?? "").toLowerCase()) {
    case "done": return "bg-green-600 text-white";
    case "in_progress": return "bg-yellow-500 text-black";
    case "todo": return "bg-gray-600 text-white";
    default: return "bg-gray-500 text-white";
  }
}
export function priorityBadgeColor(priority: string) {
  switch ((priority ?? "").toLowerCase()) {
    case "high": return "bg-red-700 text-white";
    case "medium": return "bg-gray-400 text-black";
    case "low": return "bg-green-700 text-white";
    default: return "bg-gray-500 text-white";
  }
}
export const StatusBadge = ({ status }: { status: string }) => (
  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${statusBadgeColor(status)}`}>
    {(status ?? "").replace("_", " ").toUpperCase()}
  </span>
);
export const PriorityBadge = ({ priority }: { priority: string }) => (
  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${priorityBadgeColor(priority)}`}>
    {(priority ?? "").toUpperCase()}
  </span>
);
interface TaskBadgeProps {
  task: Task;
  onClick?: () => void;
  onView?: () => void;
}
const TaskBadge: React.FC<TaskBadgeProps> = ({ task, onClick, onView }) => (
  <div
    className="bg-zinc-800 rounded-xl p-4 flex flex-col gap-1 shadow hover:shadow-xl hover:bg-zinc-700 cursor-pointer transition"
    onClick={onClick}
  >
    <div className="flex justify-between items-center">
      <span className="font-bold text-lg">{task.title}</span>
      <button
        onClick={e => {
          e.stopPropagation();
          onView?.();
        }}
        className="text-xs rounded bg-blue-800 text-white px-2 py-1"
      >
        View
      </button>
    </div>
    <div className="text-zinc-400 text-sm">{task.description}</div>
    <div className="flex gap-2 mt-2 items-center">
      <StatusBadge status={task.status} />
      <PriorityBadge priority={task.priority} />
    </div>
    {task.due_date && (
      <div className="text-xs text-blue-400 mt-1">Due: {task.due_date}</div>
    )}
  </div>
);
export default TaskBadge;
