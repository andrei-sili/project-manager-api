// // frontend/src/components/KanbanBoard.tsx
//
// import { StatusBadge, PriorityBadge } from "./TaskBadge";
// import React from "react";
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
//   DroppableProvided,
//   DroppableStateSnapshot,
// } from "@hello-pangea/dnd";
// import { Task, TeamMember, TaskStatus } from "@/lib/types";
//
//
//
// export interface KanbanBoardProps {
//   tasks: Task[];
//   teamMembers: TeamMember[];
//   onStatusChange: (taskId: number, status: TaskStatus) => void;
//   onTaskEdit: (task: Task) => void;
//   onAddTask: () => void;
//   onTaskDetails: (task: Task) => void;
// }
//
// const statusColumns = [
//   { key: "todo", label: "To Do", color: "bg-zinc-700" },
//   { key: "in_progress", label: "In Progress", color: "bg-yellow-800" },
//   { key: "done", label: "Done", color: "bg-green-800" },
// ] as const;
//
// export default function KanbanBoard({
//   tasks,
//   teamMembers,
//   onTaskEdit,
//   onStatusChange,
//   onAddTask,
//   onTaskDetails,
// }: KanbanBoardProps) {
//   // Group tasks by status
//   const tasksByStatus: Record<string, Task[]> = {
//     todo: [],
//     in_progress: [],
//     done: [],
//   };
//   tasks.forEach((t) => tasksByStatus[t.status].push(t));
//
//   const onDragEnd = (result: DropResult) => {
//     if (!result.destination) return;
//     const { source, destination, draggableId } = result;
//     if (source.droppableId !== destination.droppableId) {
//       // Call the parent callback to update status in backend
//       onStatusChange(Number(draggableId), destination.droppableId as Task["status"]);
//     }
//   };
//
//   return (
//     <div className="w-full overflow-x-auto pb-8">
//       <div className="flex gap-6 min-w-[900px]">
//         <DragDropContext onDragEnd={onDragEnd}>
//           {statusColumns.map((col) => (
//             <Droppable droppableId={col.key} key={col.key}>
//               {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
//                 <div
//                   ref={provided.innerRef}
//                   {...provided.droppableProps}
//                   className="...."
//                   style={{
//                     background: snapshot.isDraggingOver ? "#3b82f6" : undefined,
//                     transition: "background 0.2s",
//                   }}
//                 >
//                   <div className="flex justify-between items-center mb-3">
//                     <div className="text-lg font-semibold text-white">{col.label}</div>
//                     {col.key === "todo" && (
//                       <button
//                         onClick={onAddTask}
//                         className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
//                       >
//                         + Add Task
//                       </button>
//                     )}
//                   </div>
//                   {tasksByStatus[col.key].length === 0 && (
//                     <div className="text-gray-400 text-center py-4 text-sm">
//                       No tasks
//                     </div>
//                   )}
//                   {tasksByStatus[col.key].map((task, idx) => (
//                     <Draggable draggableId={task.id.toString()} index={idx} key={task.id}>
//                       {(provided, snapshot) => (
//                         <div
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                           {...provided.dragHandleProps}
//                           className={`mb-4 p-4 rounded-xl bg-zinc-900 shadow border-l-4 border-blue-600 transition
//                           ${snapshot.isDragging ? "bg-blue-200" : ""}`}
//                         >
//                           <div className="flex justify-between items-center">
//                             <div
//                               className="font-bold text-white cursor-pointer hover:underline"
//                               title={task.description}
//                               onClick={() => onTaskDetails(task)}
//                             >
//                               {task.title}
//                             </div>
//                             <button
//                               className="text-xs bg-blue-700 hover:bg-blue-500 text-white px-2 py-1 rounded ml-2"
//                               onClick={() => onTaskEdit(task)}
//                             >
//                               Edit
//                             </button>
//                           </div>
//                           <div className="flex items-center gap-3 mt-2 text-xs">
//                             <span className="flex gap-2 items-center">
//                               <PriorityBadge priority={task.priority}/>
//                               <StatusBadge status={task.status}/>
//                             </span>
//                             {task.assigned_to_email && (
//                                 <span className="inline-block bg-blue-900 text-blue-100 px-2 rounded">
//                                 {task.assigned_to_email}
//                               </span>
//                             )}
//                             {task.due_date && (
//                                 <span className="inline-block bg-zinc-800 text-gray-300 px-2 rounded">
//                                 {new Date(task.due_date).toLocaleDateString()}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       )}
//                     </Draggable>
//                   ))}
//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           ))}
//         </DragDropContext>
//       </div>
//     </div>
//   );
// }

// frontend/src/components/KanbanBoard.tsx

// frontend/src/components/KanbanBoard.tsx

import React from "react";
import { Task } from "@/lib/types";
import TaskBadge from "@/components/TaskBadge";

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onOpenTask?: (task: Task) => void;
}

const columns = [
  { key: "TODO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "DONE", label: "Done" },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onEditTask, onOpenTask }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {columns.map((col) => (
      <div key={col.key} className="bg-zinc-900 p-4 rounded-2xl shadow min-h-[350px]">
        <h3 className="text-xl font-bold mb-4 text-white">{col.label}</h3>
        <div className="flex flex-col gap-4">
          {tasks
            .filter((t) => t.status === col.key)
            .map((task) => (
              <TaskBadge
                key={task.id}
                task={task}
                onClick={() => onOpenTask?.(task)}
                onEdit={() => onEditTask?.(task)}
              />
            ))}
          {tasks.filter(t => t.status === col.key).length === 0 && (
            <div className="text-gray-400 text-center py-6">No tasks</div>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default KanbanBoard;

