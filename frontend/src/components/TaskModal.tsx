// frontend/src/components/TaskModal.tsx

import { useEffect, useState } from "react";
import EditTaskModal from "./EditTaskModal";
import TaskComments from "./TaskComments";
import TaskFiles from "./TaskFiles";
import { X } from "lucide-react";

interface TaskModalProps {
  open: boolean;
  task: any;
  projectId: number | string;
  teamMembers: any[];
  onClose: () => void;
  onTaskUpdated?: () => void;
}

export default function TaskModal({
  open,
  task,
  projectId,
  teamMembers,
  onClose,
  onTaskUpdated,
}: TaskModalProps) {
  const [showEdit, setShowEdit] = useState(false);
  if (!open || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Card  */}
      <div className="relative w-full max-w-3xl h-[90vh] bg-zinc-900 rounded-2xl shadow-xl flex flex-col overflow-hidden border border-blue-800 animate-slide-up">
        {/* Close */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-blue-400 text-2xl"
          onClick={onClose}
          title="Close"
        >
          <X size={28} />
        </button>
        {/* Header + info */}
        <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-bold text-white mb-2">{task.title}</div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-block px-2 py-1 rounded bg-yellow-700 text-white font-semibold">{task.status}</span>
              <span className="inline-block px-2 py-1 rounded bg-red-700 text-white font-semibold">{task.priority}</span>
              <span className="inline-block px-2 py-1 rounded bg-zinc-700 text-white">{task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}</span>
              <span className="inline-block px-2 py-1 rounded bg-blue-700 text-white">
                {task.assigned_to_name || task.assigned_to || "—"}
              </span>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              className="px-4 py-1 bg-blue-700 text-white rounded font-semibold"
              onClick={() => setShowEdit(true)}
            >
              Edit
            </button>
            {/* Poți adăuga buton de Delete dacă vrei */}
          </div>
        </div>
        {/* Content scrollabil */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Description */}
          <div>
            <div className="text-gray-400 mb-1">Description:</div>
            <div className="text-white whitespace-pre-line">{task.description}</div>
          </div>
          {/* Files */}
          <TaskFiles projectId={String(projectId)}  taskId={task.id} compact />
          {/* Comments */}
          <div>
            <TaskComments projectId={String(projectId)}  taskId={task.id} />
          </div>
        </div>
      </div>
      {/* Edit modal (peste modalul principal) */}
      {showEdit && (
        <EditTaskModal
          open={showEdit}
          task={task}
          teamMembers={teamMembers}
          projectId={Number(projectId)}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            onTaskUpdated && onTaskUpdated();
            onClose();
          }}
        />
      )}
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.25s ease;
        }
        .animate-slide-up {
          animation: slideUp 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
