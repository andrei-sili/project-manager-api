// frontend/src/components/TaskModal.tsx

import React, { useState } from "react";
import { StatusBadge, PriorityBadge } from "@/components/TaskBadge";
import TaskFiles from "@/components/TaskFiles";
import TaskComments from "@/components/TaskComments";
import { X, Edit2, Trash2 } from "lucide-react";

type TaskModalProps = {
  open: boolean;
  task: any;
  projectId: string;
  teamMembers?: any[];
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onTaskUpdated?: () => void;
};

export default function TaskModal({
  open,
  task,
  projectId,
  teamMembers,
  onClose,
  onEdit,
  onDelete,
  onTaskUpdated,
}: TaskModalProps) {
  const [showDelete, setShowDelete] = useState(false);

  if (!open || !task) return null;

  // Safely get fields
  const assignedTo =
  task.assigned_to && typeof task.assigned_to === "object"
    ? `${task.assigned_to.first_name ?? ""} ${task.assigned_to.last_name ?? ""}`.trim() ||
      task.assigned_to.name ||
      "—"
    : task.assigned_to || "—";


  const projectName =
    task.project?.name || (typeof task.project === "string" ? task.project : "") || "—";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-lg">
      {/* Modal Card */}
      <div className="relative bg-zinc-900 border-2 border-blue-600 rounded-3xl shadow-2xl w-full max-w-4xl mx-3 p-10 flex flex-col gap-8 animate-fade-in">
        {/* X Close */}
        <button
          className="absolute right-8 top-8 text-zinc-400 hover:text-white transition"
          onClick={onClose}
          title="Close"
        >
          <X size={34} />
        </button>

        {/* Top Row: Title + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-3xl font-extrabold text-white tracking-tight break-words">
            {task.title}
          </h2>
          <div className="flex gap-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-xl text-base shadow transition"
              >
                <Edit2 size={20} /> Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center gap-2 bg-zinc-800 text-red-400 hover:bg-red-600 hover:text-white px-6 py-2 rounded-xl text-base font-bold shadow transition"
              >
                <Trash2 size={20} /> Delete
              </button>
            )}
          </div>
        </div>

        {/* Badge Row */}
        <div className="flex flex-wrap gap-3 items-center mb-1">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
          {task.due_date && (
            <span className="bg-zinc-800 text-gray-200 px-3 py-1 rounded text-xs font-bold border border-zinc-700">
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
          <span className="bg-blue-900 text-blue-100 px-3 py-1 rounded text-xs font-bold border border-blue-700">
            {assignedTo}
          </span>
          <span className="bg-green-900 text-green-200 px-3 py-1 rounded text-xs font-bold border border-green-700">
            {projectName}
          </span>
        </div>

        {/* Description */}
        <div>
          <div className="font-semibold text-gray-400 mb-1">Description</div>
          <div className="bg-zinc-800 text-white rounded-xl px-4 py-3 text-base leading-relaxed min-h-[38px]">
            {task.description || <span className="text-gray-500">No description…</span>}
          </div>
        </div>

        {/* Files */}
        <div>
          <div className="font-semibold text-gray-400 mb-1">Files</div>
          <TaskFiles
            projectId={projectId}
            taskId={task.id.toString()}
            compact
            onFilesUpdated={onTaskUpdated}
          />
        </div>

        {/* Comments */}
        <div>
          <div className="font-semibold text-gray-400 mb-1">Comments</div>
          <TaskComments
            projectId={projectId}
            taskId={task.id.toString()}
            onCommentsUpdated={onTaskUpdated}
          />
        </div>
      </div>
      {/* Optional Delete Confirm Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70">
          <div className="bg-zinc-900 rounded-2xl p-8 border-2 border-red-600 shadow-xl max-w-md mx-2 flex flex-col items-center">
            <div className="text-xl font-bold text-red-500 mb-4">
              Delete task?
            </div>
            <div className="text-gray-300 mb-8 text-center">
              Are you sure you want to delete this task? This action cannot be undone!
            </div>
            <div className="flex gap-4">
              <button
                className="bg-zinc-800 text-gray-200 px-6 py-2 rounded-xl hover:bg-zinc-700"
                onClick={() => setShowDelete(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700"
                onClick={() => {
                  setShowDelete(false);
                  if (onDelete) onDelete();
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Blur click overlay, closes only if you click outside card */}
      <div
        className="fixed inset-0 z-40"
        onClick={(e) => {
          // Only close if click on this overlay, not children
          if ((e.target as HTMLDivElement).classList.contains("z-40")) onClose();
        }}
        style={{ cursor: "pointer" }}
      />
      {/* Animate in */}
      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.2s cubic-bezier(0.4,0,0.2,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
