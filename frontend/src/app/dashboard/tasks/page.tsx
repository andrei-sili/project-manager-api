"use client";
import { useEffect, useState } from "react";
import {
  fetchProjects,
  deleteTask,
  createTask,
  updateTask,
  Task,
  Project,
  fetchTasks,
} from "@/lib/api";
import { Edit2, Trash2, Play, Pause, RotateCcw, Plus } from "lucide-react";

function priorityBorder(priority: string) {
  switch (priority) {
    case "high": return "border-red-500";
    case "medium": return "border-yellow-400";
    case "low": return "border-green-400";
    default: return "border-gray-400";
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timers, setTimers] = useState<any>({});
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks().then(setTasks);
    fetchProjects().then(setProjects);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev: any) => {
        const updated = { ...prev };
        for (const id in updated) {
          if (updated[id]?.active) {
            updated[id].elapsed += 1;
          }
        }
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const tasksByProject: { [projectId: number]: Task[] } = {};
  for (const task of tasks) {
    const projectId = typeof task.project === "object" ? task.project.id : Number(task.project);
    if (!projectId) continue;
    if ((filter === "completed" && !task.completed) || (filter === "incomplete" && task.completed)) continue;
    if (!tasksByProject[projectId]) tasksByProject[projectId] = [];
    tasksByProject[projectId].push(task);
  }

  return (
    <div className="p-10 min-h-screen bg-[#101116]">
      <h1 className="text-3xl font-bold mb-6 text-white">My Tasks</h1>

      <div className="flex gap-2 mb-6">
        {["all", "completed", "incomplete"].map(type => (
          <button
            key={type}
            className={`rounded px-4 py-1 ${filter === type ? "bg-blue-600 text-white" : ""}`}
            onClick={() => setFilter(type as typeof filter)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
        <button
          className="ml-auto bg-green-600 text-white px-4 py-1 rounded flex items-center gap-2"
          onClick={() => setShowAdd(true)}
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      {showAdd && (
        <TaskModal
          projects={projects}
          onClose={() => setShowAdd(false)}
          onSave={async (data) => {
            try {
              const newTask = await createTask(data);
              setTasks(ts => [newTask, ...ts]);
              setShowAdd(false);
            } catch (error) {
              console.error("Create task failed:", error);
              alert("Error creating task. Check console for details.");
            }
          }}
        />
      )}

      {editTask && (
        <TaskModal
          projects={projects}
          initial={editTask}
          onClose={() => setEditTask(null)}
          onSave={async (data) => {
            try {
              const updated = await updateTask(editTask.id, data);
              setTasks(ts => ts.map(t => t.id === editTask.id ? updated : t));
              setEditTask(null);
            } catch (error) {
              console.error("Update task failed:", error);
              alert("Error updating task. Check console for details.");
            }
          }}
        />
      )}

      <div className="space-y-10">
        {projects.map(project => (
          <div key={project.id} className="bg-[#232733] rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-3 text-white">
              <span>{project.name}</span>
              <span className="text-base text-gray-400">
                {tasksByProject[project.id]?.length || 0} tasks
              </span>
            </h2>

            <div className="flex flex-wrap gap-6 mt-4">
              {tasksByProject[project.id]?.length ? tasksByProject[project.id].map(task => {
                const timer = timers[task.id] || { elapsed: 0, active: false };
                const handleStart = () => setTimers((ts: any) => ({ ...ts, [task.id]: { ...timer, active: true } }));
                const handlePause = () => setTimers((ts: any) => ({ ...ts, [task.id]: { ...timer, active: false } }));
                const handleReset = () => setTimers((ts: any) => ({ ...ts, [task.id]: { ...timer, elapsed: 0 } }));

                return (
                  <div
                    key={task.id}
                    className={`rounded-xl bg-[#282c36] shadow p-4 flex flex-col border-l-4 transition group ${priorityBorder(task.priority)} w-[420px] min-w-[320px]`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg text-white">{task.title}</span>
                      {task.status && (
                        <span className={`text-xs px-2 py-1 rounded ${task.status === "done" ? "bg-green-600" : "bg-blue-600"} text-white`}>
                          {task.status.toUpperCase().replace("_", " ")}
                        </span>
                      )}
                      {task.priority && (
                        <span className={`text-xs px-2 py-1 rounded ${task.priority === "high" ? "bg-red-600" : task.priority === "medium" ? "bg-yellow-400" : "bg-green-500"} text-white`}>
                          {task.priority.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="text-gray-300 text-sm">{task.description}</div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-gray-400 text-xs">Assigned:</span>
                      <span className="text-gray-200 text-xs">{task.assigned_to_name || task.assigned_to || "—"}</span>
                      <span className="text-gray-400 text-xs ml-4">
                        Due: {task.due_date && new Date(task.due_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <span className="font-mono text-sm text-blue-300">
                        {Math.floor(timer.elapsed / 60)}:{(timer.elapsed % 60).toString().padStart(2, "0")}
                      </span>
                      <button onClick={timer.active ? handlePause : handleStart} className="text-green-400 hover:scale-110" title={timer.active ? "Pause" : "Start"}>
                        {timer.active ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <button onClick={handleReset} className="text-gray-400" title="Reset">
                        <RotateCcw size={18} />
                      </button>
                      <button onClick={() => setEditTask(task)} className="text-blue-400 hover:text-blue-200 ml-4" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => { if (confirm("Are you sure?")) deleteTask(task.id).then(() => setTasks(ts => ts.filter(t => t.id !== task.id))) }} className="text-red-400 hover:text-red-200" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-gray-400 text-sm">No tasks in this project.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskModal({ projects, onClose, onSave, initial }: {
  projects: Project[];
  onClose: () => void;
  onSave: (data: any) => void;
  initial?: Task;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const initialProjectId = typeof initial?.project === "object" ? initial.project.id : initial?.project || projects[0]?.id || "";
  const [project, setProject] = useState<number | string>(initialProjectId);
  const [priority, setPriority] = useState((initial?.priority || "medium").toLowerCase());
  const [status, setStatus] = useState((initial?.status || "todo").toLowerCase());
  const [assigned_to, setAssignedTo] = useState(initial?.assigned_to || "");
  const [due_date, setDueDate] = useState(initial?.due_date?.slice(0, 10) || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      project: Number(project),
      priority: priority.toLowerCase(),
      status: status.toLowerCase(),
      assigned_to,
      due_date,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form className="bg-[#22232b] rounded-lg p-8 w-full max-w-md flex flex-col gap-4" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-2 text-white">{initial ? "Edit Task" : "Create Task"}</h2>
        <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
        <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
        <select className="input" value={project} onChange={e => setProject(Number(e.target.value))}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="input" value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="todo">TODO</option>
          <option value="in progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <input className="input" value={assigned_to} onChange={e => setAssignedTo(e.target.value)} placeholder="Assign to (email or name)" />
        <input className="input" type="date" value={due_date} onChange={e => setDueDate(e.target.value)} />
        <div className="flex gap-3 mt-2">
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">{initial ? "Save" : "Create"}</button>
          <button type="button" className="bg-gray-500 text-white rounded px-4 py-2" onClick={onClose}>Cancel</button>
        </div>
      </form>
      <style jsx>{`
        .input {
          background: #181920;
          color: #eee;
          border-radius: 0.5rem;
          border: 1px solid #444;
          padding: 0.5rem;
        }
      `}</style>
    </div>
  );
}