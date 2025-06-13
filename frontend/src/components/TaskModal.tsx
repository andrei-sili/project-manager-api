// frontend/src/components/TaskModal.tsx

import React from "react";
import { StatusBadge, PriorityBadge } from "@/components/TaskBadge";
import TaskFiles from "@/components/TaskFiles";
import TaskComments from "@/components/TaskComments";
import { X } from "lucide-react";

export default function TaskModal({
  open,
  task,
  projectId,
  teamMembers,
  onClose,
  onEdit,
}: {
  open: boolean;
  task: any;
  projectId: number | string;
  teamMembers?: any[];
  onClose: () => void;
  onEdit?: () => void;
}) {
  if (!open || !task) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-blue-700 rounded-3xl shadow-2xl max-w-2xl w-full p-8 mx-3 relative flex flex-col gap-5 animate-fade-in">
        {/* Close Button */}
        <button
          className="absolute right-6 top-6 text-zinc-400 hover:text-white transition"
          onClick={onClose}
          title="Close"
        >
          <X size={28} />
        </button>

        {/* Title + Status/Meta */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{task.title}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {task.due_date && (
                <span className="inline-block bg-zinc-800 text-gray-300 px-3 py-1 rounded text-xs font-semibold">
                  {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}
              {task.assigned_to && (
                <span className="inline-block bg-blue-900 text-blue-200 px-3 py-1 rounded text-xs font-semibold">
                  {typeof task.assigned_to === "object"
                    ? `${task.assigned_to.first_name ?? ""} ${task.assigned_to.last_name ?? ""}`.trim() ||
                      task.assigned_to.name ||
                      "—"
                    : task.assigned_to}
                </span>
              )}
              {task.project?.name && (
                <span className="inline-block bg-green-900 text-green-300 px-3 py-1 rounded text-xs font-semibold">
                  {task.project.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 md:items-center">
            {onEdit && (
              <button
                onClick={onEdit}
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-xl text-base transition"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-zinc-800" />

        {/* Description */}
        <div>
          <div className="text-gray-400 font-medium mb-1">Description:</div>
          <div className="text-white text-base whitespace-pre-line leading-relaxed rounded px-2">
            {task.description || <span className="text-gray-500">No description…</span>}
          </div>
        </div>

        {/* Files Section */}
        <div>
          <div className="text-gray-400 font-medium mb-1">Files</div>
          <TaskFiles projectId={projectId} taskId={task.id} compact />
        </div>

        {/* Comments Section */}
        <div>
          <div className="text-gray-400 font-medium mb-1">Comments</div>
          <TaskComments projectId={projectId} taskId={task.id} />
        </div>
      </div>
      {/* Blur click overlay */}
      <div className="fixed inset-0 z-40" onClick={onClose} style={{ cursor: "pointer" }} />
      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.15s cubic-bezier(0.4,0,0.2,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
