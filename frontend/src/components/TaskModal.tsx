// frontend/src/components/TaskModal.tsx

import React from "react";
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
  if (!open || !task) return null;
  const effectiveProjectId = projectId || task?.project?.id?.toString() || "";
  // Assigned user badge with initials and color
  const assignedUser =
    task.assigned_to && typeof task.assigned_to === "object"
      ? {
          name: [task.assigned_to.first_name, task.assigned_to.last_name]
            .filter(Boolean)
            .join(" ") || task.assigned_to.name || "—",
          email: task.assigned_to.email,
        }
      : { name: task.assigned_to || "—", email: "" };

  function getInitials(name: string) {
    if (!name) return "?";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  }

  function getAvatarColor(str: string = "") {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const colors = [
      "bg-blue-700", "bg-emerald-600", "bg-fuchsia-600",
      "bg-orange-500", "bg-indigo-700", "bg-teal-600"
    ];
    return colors[Math.abs(hash) % colors.length];
  }
  const avatarClass = getAvatarColor(assignedUser.email || assignedUser.name);

  // Project badge (always string)
  const projectBadge = task.project?.name || (typeof task.project === "string" ? task.project : "") || "—";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      {/* Main Modal Card */}
      <div
        className="relative z-10 w-full max-w-2xl mx-auto rounded-[2.5rem] shadow-2xl border border-blue-800 bg-gradient-to-br from-zinc-950 to-zinc-900 flex flex-col min-h-[650px] max-h-[90vh] h-[90vh]"
      >
        {/* Header */}
        <div className="flex flex-col gap-2 px-10 pt-9 pb-2">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white tracking-tight break-words">{task.title}</h2>
            <div className="flex gap-1 items-center">
              {/* Edit button */}
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="bg-zinc-700 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition"
                >
                  <Edit2 size={18} /> Edit
                </button>
              )}
              {/* Delete button */}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="bg-zinc-800 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition"
                >
                  <Trash2 size={18} /> Delete
                </button>
              )}
              {/* Close button */}
              <button
                className="ml-2 text-zinc-400 hover:text-white transition"
                onClick={onClose}
                title="Close"
              >
                <X size={30} />
              </button>
            </div>
          </div>
          {/* Badge Row */}
          <div className="flex flex-wrap gap-3 items-center mt-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {task.due_date && (
              <span className="inline-block bg-zinc-800 text-gray-200 px-4 py-1 rounded-xl text-sm font-bold border border-zinc-700">
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
            {/* Assigned avatar */}
            <span className={`flex items-center gap-2 px-4 py-1 rounded-xl text-sm font-bold ${avatarClass} text-white`}>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/10 mr-1 font-mono font-bold shadow">
                {getInitials(assignedUser.name)}
              </span>
              {assignedUser.name}
            </span>
            {/* Project badge */}
            <span className="inline-block bg-green-900 text-green-200 px-4 py-1 rounded-xl text-sm font-bold border border-green-700">
              {projectBadge}
            </span>
          </div>
        </div>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scroll px-10 py-4">
          {/* Description */}
          <section className="mb-5">
            <div className="font-semibold text-gray-400 mb-1">Description</div>
            <div className="bg-zinc-800 text-white rounded-xl px-4 py-3 text-base leading-relaxed min-h-[38px] shadow">
              {task.description || <span className="text-gray-500">No description…</span>}
            </div>
          </section>
          {/* Files */}
          <section className="mb-6">
            <TaskFiles
              projectId={effectiveProjectId}
              taskId={task.id?.toString() ?? ""}
              compact
              onFilesUpdated={onTaskUpdated}
            />
          </section>
          {/* Comments */}
          <section>
            <TaskComments
              projectId={effectiveProjectId}
              taskId={task.id?.toString() ?? ""}
              onCommentsUpdated={onTaskUpdated}
            />
          </section>
        </div>
      </div>
      {/* Custom scroll styling */}
      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar {
          width: 7px;
          background: #26283b;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 6px;
        }
        .animate-fade-in { animation: fadeIn 0.19s cubic-bezier(0.4,0,0.2,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(25px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
