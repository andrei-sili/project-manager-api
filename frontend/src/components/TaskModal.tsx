// frontend/src/components/TaskModal.tsx

import React, { useState, useEffect, useRef } from "react";
import { X, Edit2, Trash2, Play, Pause, PlusCircle, Save, AlertTriangle } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/TaskBadge";
import TaskFiles from "@/components/TaskFiles";
import TaskComments from "@/components/TaskComments";
import { useTimerStore } from "@/lib/timerStore";

import {
  getTimeEntriesForTask,
  createTimeEntry,
  editTimeEntry,
  deleteTimeEntry,
} from "@/lib/api";

// --- TaskModal Props ---
type TaskModalProps = {
  open: boolean;
  task: any;
  projectId: string;
  teamMembers?: any[];
  onClose: () => void;
  onDelete?: () => void;
  onTaskUpdated?: () => void;
  onEditClick?: () => void;
};

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TaskModal({
  open,
  task,
  projectId,
  teamMembers,
  onClose,
  onDelete,
  onTaskUpdated,
  onEditClick,
}: TaskModalProps) {
  if (!open || !task) return null;

  // Assigned user (avatar logic)
  const assignedUser =
    task.assigned_to && typeof task.assigned_to === "object"
      ? {
          name: [task.assigned_to.first_name, task.assigned_to.last_name].filter(Boolean).join(" ") || task.assigned_to.name || "—",
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
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "bg-blue-700",
      "bg-emerald-600",
      "bg-fuchsia-600",
      "bg-orange-500",
      "bg-indigo-700",
      "bg-teal-600",
    ];
    return colors[Math.abs(hash) % colors.length];
  }

  const avatarClass = getAvatarColor(assignedUser.email || assignedUser.name);
  const projectBadge =
    task.project?.name ||
    (typeof task.project === "string" ? task.project : "") ||
    "—";
  const effectiveProjectId = projectId || task?.project?.id?.toString() || "";

  // --- Time Tracking Section ---
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [manualMinutes, setManualMinutes] = useState("");
  const [timeEntryError, setTimeEntryError] = useState<string | null>(null);
  const [editEntryId, setEditEntryId] = useState<number | null>(null);
  const [editEntryMinutes, setEditEntryMinutes] = useState<string>("");

  // Timer store (global)
  const {
    timer,
    startTimer,
    stopTimer,
    resetTimer,
    getElapsed,
  } = useTimerStore();

  const taskId = task.id?.toString();

  // Check if another timer is active
  const isThisTaskActive = timer.running && timer.taskId === taskId;
  const isOtherTaskActive = timer.running && timer.taskId && timer.taskId !== taskId;
  const otherTaskId = timer.taskId && timer.taskId !== taskId ? timer.taskId : null;

  // Local timer for UI update
  const [localElapsed, setLocalElapsed] = useState(getElapsed());
  useEffect(() => {
    if (isThisTaskActive) {
      const intv = setInterval(() => setLocalElapsed(getElapsed()), 1000);
      return () => clearInterval(intv);
    } else {
      setLocalElapsed(getElapsed());
    }
    // eslint-disable-next-line
  }, [isThisTaskActive, timer.running, timer.taskId]);

  // Fetch time entries for this task
  useEffect(() => {
    if (!task?.id) return;
    setIsLoadingEntries(true);
    getTimeEntriesForTask(task.id)
      .then((data) => setTimeEntries(data))
      .catch(() => setTimeEntries([]))
      .finally(() => setIsLoadingEntries(false));
    setManualMinutes("");
    setEditEntryId(null);
    setEditEntryMinutes("");
    setTimeEntryError(null);
  }, [task]);

  // --- Timer Handlers ---
  function handleStartTimer() {
    if (isOtherTaskActive) {
      // Stop other timer before starting new one
      stopTimer();
      resetTimer();
    }
    startTimer(taskId);
    setTimeEntryError(null);
  }

  async function handleStopTimer() {
    stopTimer();
    // Save time entry if there is elapsed time
    const elapsedSec = useTimerStore.getState().getElapsed();
    const minutes = Math.round(elapsedSec / 60);
    if (minutes > 0) {
      try {
        await createTimeEntry({
          task: task.id,
          minutes,
          date: new Date().toISOString().slice(0, 10),
          note: "Tracked with timer",
        });
        getTimeEntriesForTask(task.id).then(setTimeEntries);
      } catch (err) {
        setTimeEntryError("Failed to save time entry.");
      }
    }
    resetTimer();
    setLocalElapsed(0);
  }

  // Manual add
  async function handleAddManualTime() {
    const minutes = parseInt(manualMinutes, 10);
    if (!minutes || minutes <= 0) {
      setTimeEntryError("Please enter minutes > 0.");
      return;
    }
    try {
      await createTimeEntry({
        task: task.id,
        minutes,
        date: new Date().toISOString().slice(0, 10),
        note: "Manual entry",
      });
      getTimeEntriesForTask(task.id).then(setTimeEntries);
      setManualMinutes("");
      setTimeEntryError(null);
    } catch (err: any) {
      setTimeEntryError("Failed to add time entry.");
    }
  }

  // Edit entry
  async function handleEditEntry(entryId: number) {
    const minutes = parseInt(editEntryMinutes, 10);
    if (!minutes || minutes <= 0) {
      setTimeEntryError("Please enter minutes > 0.");
      return;
    }
    try {
      await editTimeEntry(entryId, { minutes });
      getTimeEntriesForTask(task.id).then(setTimeEntries);
      setEditEntryId(null);
      setEditEntryMinutes("");
      setTimeEntryError(null);
    } catch {
      setTimeEntryError("Failed to edit time entry.");
    }
  }

  // Delete entry
  async function handleDeleteEntry(entryId: number) {
    if (!window.confirm("Delete this time entry?")) return;
    try {
      await deleteTimeEntry(entryId);
      getTimeEntriesForTask(task.id).then(setTimeEntries);
      setTimeEntryError(null);
    } catch {
      setTimeEntryError("Failed to delete time entry.");
    }
  }

  // --- UI ---
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl mx-auto rounded-[2.5rem] shadow-2xl border border-blue-800 bg-gradient-to-br from-zinc-950 to-zinc-900 flex flex-col min-h-[650px] max-h-[90vh] h-[90vh]">
        <div className="flex flex-col gap-2 px-10 pt-9 pb-2">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white tracking-tight break-words">{task.title}</h2>
            <div className="flex gap-1 items-center">
              {onEditClick && (
                <button
                  onClick={onEditClick}
                  className="bg-zinc-700 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition"
                >
                  <Edit2 size={18} /> Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="bg-zinc-800 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition"
                >
                  <Trash2 size={18} /> Delete
                </button>
              )}
              <button className="ml-2 text-zinc-400 hover:text-white transition" onClick={onClose} title="Close">
                <X size={30} />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center mt-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {task.due_date && (
              <span className="inline-block bg-zinc-800 text-gray-200 px-4 py-1 rounded-xl text-sm font-bold border border-zinc-700">
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
            <span className={`flex items-center gap-2 px-4 py-1 rounded-xl text-sm font-bold ${avatarClass} text-white`}>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/10 mr-1 font-mono font-bold shadow">
                {getInitials(assignedUser.name)}
              </span>
              {assignedUser.name}
            </span>
            <span className="inline-block bg-green-900 text-green-200 px-4 py-1 rounded-xl text-sm font-bold border border-green-700">
              {projectBadge}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll px-10 py-4">
          <section className="mb-5">
            <div className="font-semibold text-gray-400 mb-1">Description</div>
            <div className="bg-zinc-800 text-white rounded-xl px-4 py-3 text-base leading-relaxed min-h-[38px] shadow">
              {task.description || (<span className="text-gray-500">No description…</span>)}
            </div>
          </section>

          {/* --- Time Tracking Section --- */}
          <section className="mb-6">
            <div className="font-semibold text-gray-400 mb-1">Time Tracking</div>

            {isOtherTaskActive && (
              <div className="flex items-center gap-2 text-yellow-400 bg-yellow-900/30 border border-yellow-800 rounded-lg p-2 mb-2">
                <AlertTriangle size={18} />
                <span>
                  Timer is already running on another task (Task ID: <b>{otherTaskId}</b>).
                  <button
                    className="ml-2 px-2 py-1 rounded bg-yellow-700 hover:bg-yellow-800 text-white font-bold text-xs"
                    onClick={() => { stopTimer(); resetTimer(); }}
                  >
                    Stop other timer
                  </button>
                </span>
              </div>
            )}

            <div className="flex items-center gap-4 mb-3 flex-wrap">
              <span className="text-2xl font-bold text-white">{formatTime(isThisTaskActive ? localElapsed : 0)}</span>
              {isThisTaskActive ? (
                <button
                  className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white flex items-center gap-2"
                  onClick={handleStopTimer}
                >
                  <Pause size={18} />
                  Stop & Save
                </button>
              ) : (
                <button
                  className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded text-white flex items-center gap-2"
                  onClick={handleStartTimer}
                  disabled={!!isOtherTaskActive}
                >
                  <Play size={18} />
                  Start timer
                </button>
              )}
              <input
                type="number"
                min={1}
                value={manualMinutes}
                onChange={(e) => setManualMinutes(e.target.value)}
                className="bg-zinc-800 text-white w-20 p-2 rounded border border-zinc-700 ml-4"
                placeholder="Minutes"
              />
              <button
                className="bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded text-white flex items-center gap-1"
                onClick={handleAddManualTime}
              >
                <PlusCircle size={16} />
                Add
              </button>
            </div>
            {timeEntryError && (
              <div className="text-red-400 text-sm mb-2">{timeEntryError}</div>
            )}
            <div className="text-sm text-gray-300 mb-2">Time Entries:</div>
            {isLoadingEntries ? (
              <div className="text-gray-400">Loading...</div>
            ) : timeEntries.length === 0 ? (
              <div className="text-gray-500">No time entries for this task.</div>
            ) : (
              <ul>
                {timeEntries.map((entry) => (
                  <li key={entry.id} className="flex items-center gap-2 text-gray-200 mb-1">
                    <span>{entry.minutes} min</span>
                    <span className="text-xs text-gray-400">({entry.date})</span>
                    <span className="text-xs text-gray-400">{entry.note}</span>
                    {editEntryId === entry.id ? (
                      <>
                        <input
                          type="number"
                          value={editEntryMinutes}
                          min={1}
                          onChange={(e) => setEditEntryMinutes(e.target.value)}
                          className="bg-zinc-800 text-white w-14 p-1 rounded border border-zinc-700"
                        />
                        <button
                          className="bg-blue-600 text-white rounded p-1"
                          onClick={() => handleEditEntry(entry.id)}
                        >
                          <Save size={15} />
                        </button>
                        <button
                          className="bg-gray-600 text-white rounded p-1"
                          onClick={() => {
                            setEditEntryId(null);
                            setEditEntryMinutes("");
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="text-blue-400 hover:text-blue-600"
                          onClick={() => {
                            setEditEntryId(entry.id);
                            setEditEntryMinutes(entry.minutes.toString());
                          }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="text-red-400 hover:text-red-600"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
          {/* --- END Time Tracking Section --- */}

          <section className="mb-6">
            <TaskFiles
              projectId={effectiveProjectId}
              taskId={task.id?.toString() ?? ""}
              compact
              onFilesUpdated={onTaskUpdated}
            />
          </section>
          <section>
            <TaskComments
              projectId={effectiveProjectId}
              taskId={task.id?.toString() ?? ""}
              onCommentsUpdated={onTaskUpdated}
            />
          </section>
        </div>
      </div>
      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar {
          width: 7px;
          background: #26283b;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
