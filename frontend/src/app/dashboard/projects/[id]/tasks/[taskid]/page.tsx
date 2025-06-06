// // frontend/src/app/dashboard/projects/[id]/tasks/[taskid]/page.tsx
//
// "use client";
// import { useEffect, useState } from "react";
// import { useRouter, useParams } from "next/navigation";
// import axios from "axios";
// import EditTaskModal from "@/components/EditTaskModal";
// import TaskComments from "@/components/TaskComments";
// import TaskFiles from "@/components/TaskFiles";
//
// export default function TaskDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const { id, taskid } = params as { id: string; taskid: string };
//
//   const [task, setTask] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showEdit, setShowEdit] = useState(false);
//
//   // Fetch task details from API
//   const fetchTask = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}/tasks/${taskid}/`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("access")}`,
//           },
//         }
//       );
//       setTask(res.data);
//       setError(null);
//     } catch {
//       setError("Task not found.");
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   useEffect(() => {
//     fetchTask();
//     // eslint-disable-next-line
//   }, [id, taskid]);
//
//   // Delete Task
//   const handleDeleteTask = async () => {
//     if (!window.confirm("Are you sure you want to delete this task?")) return;
//     try {
//       await axios.delete(
//         `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}/tasks/${taskid}/`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("access")}`,
//           },
//         }
//       );
//       // After delete, redirect to project page
//       router.push(`/dashboard/projects/${id}`);
//     } catch {
//       alert("Could not delete task!");
//     }
//   };
//
//   if (loading)
//     return <div className="text-gray-400 px-8 py-16">Loading task details...</div>;
//   if (error || !task)
//     return <div className="text-red-400 px-8 py-16">{error || "Not found."}</div>;
//
//   return (
//     <>
//       <div className="max-w-3xl mx-auto mt-10 bg-zinc-900 rounded-2xl shadow-xl p-8">
//         {/* Top bar: task title and action buttons */}
//         <div className="flex justify-between items-center mb-4">
//           <div className="text-xl font-bold text-white">{task.title}</div>
//           <div className="flex gap-2">
//             <button
//               className="px-3 py-1 bg-zinc-700 text-white rounded-xl text-xs hover:bg-blue-700 transition"
//               onClick={() => setShowEdit(true)}
//             >
//               Edit
//             </button>
//             <button
//               className="px-3 py-1 bg-zinc-800 text-red-400 rounded-xl text-xs hover:bg-red-700 transition"
//               onClick={handleDeleteTask}
//             >
//               Delete
//             </button>
//           </div>
//         </div>
//
//         {/* Task details */}
//         <div className="grid md:grid-cols-2 gap-6 mb-8">
//           <div>
//             <div className="mb-2">
//               <span className="text-gray-400">Status:</span>{" "}
//               <span
//                 className={`inline-block px-2 py-1 rounded text-white text-xs font-bold ${
//                   task.status === "done"
//                     ? "bg-green-700"
//                     : task.status === "in_progress"
//                     ? "bg-yellow-700"
//                     : "bg-zinc-700"
//                 }`}
//               >
//                 {task.status?.replace("_", " ").toUpperCase()}
//               </span>
//             </div>
//             <div className="mb-2">
//               <span className="text-gray-400">Priority:</span>{" "}
//               <span
//                 className={`inline-block px-2 py-1 rounded text-xs font-bold ${
//                   task.priority === "high"
//                     ? "bg-red-700 text-white"
//                     : task.priority === "medium"
//                     ? "bg-yellow-700 text-white"
//                     : "bg-green-800 text-white"
//                 }`}
//               >
//                 {task.priority?.toUpperCase()}
//               </span>
//             </div>
//             <div className="mb-2">
//               <span className="text-gray-400">Due date:</span>{" "}
//               {task.due_date ? (
//                 <span>{new Date(task.due_date).toLocaleDateString()}</span>
//               ) : (
//                 <span className="text-gray-600">No due date</span>
//               )}
//             </div>
//           </div>
//           <div>
//             <div className="mb-2">
//               <span className="text-gray-400">Assigned to:</span>{" "}
//               <span>{task.assigned_to_name || task.assigned_to || "—"}</span>
//             </div>
//             <div className="mb-2">
//               <span className="text-gray-400">Project:</span>{" "}
//               <span>{task.project?.name || task.project || "—"}</span>
//             </div>
//           </div>
//         </div>
//
//         {/* Task description */}
//         <div className="mb-4">
//           <div className="text-gray-400 mb-1">Description:</div>
//           <div className="text-white whitespace-pre-line">{task.description}</div>
//         </div>
//
//         {/* Files section (compact, inside the card) */}
//         <TaskFiles projectId={id} taskId={taskid} compact />
//       </div>
//
//       {/* Comments section below the card */}
//       <TaskComments projectId={id} taskId={taskid} />
//
//       {/* Edit Task modal */}
//       {showEdit && (
//         <EditTaskModal
//           projectId={Number(id)}
//           task={task}
//           onClose={() => setShowEdit(false)}
//           onSuccess={() => {
//             setShowEdit(false);
//             fetchTask();
//           }}
//         />
//       )}
//     </>
//   );
// }

// frontend/src/app/dashboard/projects/[id]/tasks/[taskid]/page.tsx

"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import EditTaskModal from "@/components/EditTaskModal";
import TaskComments from "@/components/TaskComments";
import TaskFiles from "@/components/TaskFiles";

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id, taskid } = params as { id: string; taskid: string };

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Fetch task details from API
  const fetchTask = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}/tasks/${taskid}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      setTask(res.data);
      setError(null);
    } catch {
      setError("Task not found.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch team members (for assignee select)
  const fetchTeamMembers = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      setTeamMembers(res.data.team?.members || []);
    } catch {
      setTeamMembers([]);
    }
  };

  useEffect(() => {
    fetchTask();
    fetchTeamMembers();
    // eslint-disable-next-line
  }, [id, taskid]);

  // Delete Task
  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}/tasks/${taskid}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      // After delete, redirect to project page
      router.push(`/dashboard/projects/${id}`);
    } catch {
      alert("Could not delete task!");
    }
  };

  if (loading)
    return <div className="text-gray-400 px-8 py-16">Loading task details...</div>;
  if (error || !task)
    return <div className="text-red-400 px-8 py-16">{error || "Not found."}</div>;

  return (
    <>
      <div className="max-w-3xl mx-auto mt-10 bg-zinc-900 rounded-2xl shadow-xl p-8">
        {/* Top bar: task title and action buttons */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold text-white">{task.title}</div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-zinc-700 text-white rounded-xl text-xs hover:bg-blue-700 transition"
              onClick={() => setShowEdit(true)}
            >
              Edit
            </button>
            <button
              className="px-3 py-1 bg-zinc-800 text-red-400 rounded-xl text-xs hover:bg-red-700 transition"
              onClick={handleDeleteTask}
            >
              Delete
            </button>
          </div>
        </div>

        {/* Task details */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <div className="mb-2">
              <span className="text-gray-400">Status:</span>{" "}
              <span
                className={`inline-block px-2 py-1 rounded text-white text-xs font-bold ${
                  task.status === "done"
                    ? "bg-green-700"
                    : task.status === "in_progress"
                    ? "bg-yellow-700"
                    : "bg-zinc-700"
                }`}
              >
                {task.status?.replace("_", " ").toUpperCase()}
              </span>
            </div>
            <div className="mb-2">
              <span className="text-gray-400">Priority:</span>{" "}
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                  task.priority === "high"
                    ? "bg-red-700 text-white"
                    : task.priority === "medium"
                    ? "bg-yellow-700 text-white"
                    : "bg-green-800 text-white"
                }`}
              >
                {task.priority?.toUpperCase()}
              </span>
            </div>
            <div className="mb-2">
              <span className="text-gray-400">Due date:</span>{" "}
              {task.due_date ? (
                <span>{new Date(task.due_date).toLocaleDateString()}</span>
              ) : (
                <span className="text-gray-600">No due date</span>
              )}
            </div>
          </div>
          <div>
            <div className="mb-2">
              <span className="text-gray-400">Assigned to:</span>{" "}
              <span>{task.assigned_to_name || task.assigned_to || "—"}</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-400">Project:</span>{" "}
              <span>{task.project?.name || task.project || "—"}</span>
            </div>
          </div>
        </div>

        {/* Task description */}
        <div className="mb-4">
          <div className="text-gray-400 mb-1">Description:</div>
          <div className="text-white whitespace-pre-line">{task.description}</div>
        </div>

        {/* Files section (compact, inside the card) */}
        <TaskFiles projectId={id} taskId={taskid} compact />
      </div>

      {/* Comments section below the card */}
      <TaskComments projectId={id} taskId={taskid} />

      {/* Edit Task modal */}
      <EditTaskModal
        open={showEdit}
        task={task}
        teamMembers={teamMembers}
        projectId={Number(id)}
        onClose={() => setShowEdit(false)}
        onSaved={() => {
          setShowEdit(false);
          fetchTask();
        }}
      />
    </>
  );
}
