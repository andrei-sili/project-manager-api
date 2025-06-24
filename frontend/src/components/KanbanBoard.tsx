// frontend/src/components/KanbanBoard.tsx
import { StatusBadge, PriorityBadge } from "./TaskBadge";
import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { User, Task, TeamMember, TaskStatus } from "@/lib/types";

export interface KanbanBoardProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onStatusChange: (taskId: number, status: TaskStatus) => void;
  onAddTask: () => void;
  onViewTask: (task: Task) => void;
}

const statusColumns = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
] as const;

export default function KanbanBoard({
  tasks,
  teamMembers,
  onStatusChange,
  onAddTask,
  onViewTask,
}: KanbanBoardProps) {
  const tasksByStatus: Record<string, Task[]> = { todo: [], in_progress: [], done: [] };
  tasks.forEach((t) => {
    const key = (t.status ?? "").toLowerCase();
    if (tasksByStatus[key]) {
      tasksByStatus[key].push(t);
    }
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId !== destination.droppableId) {
      onStatusChange(Number(draggableId), destination.droppableId as TaskStatus);
    }
  };

  function getAssignee(task: Task) {
    if (typeof task.assigned_to === "object") {
      const user = task.assigned_to;
      return [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "";
    }
    return "";
  }

  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="flex gap-6 min-w-[900px]">
        <DragDropContext onDragEnd={onDragEnd}>
          {statusColumns.map((col) => (
            <Droppable droppableId={col.key} key={col.key}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 rounded-2xl px-4 pb-6 pt-3 shadow bg-zinc-800 min-h-[400px] transition border-2 ${
                    snapshot.isDraggingOver
                      ? "border-blue-500 bg-blue-950"
                      : "border-zinc-900"
                  }`}
                  style={{ minWidth: 300 }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-lg font-semibold text-white">{col.label}</div>
                    {col.key === "todo" && (
                      <button
                        onClick={onAddTask}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                      >
                        + Add Task
                      </button>
                    )}
                  </div>
                  {tasksByStatus[col.key].length === 0 && (
                    <div className="text-gray-400 text-center py-4 text-sm">
                      No tasks
                    </div>
                  )}
                  {tasksByStatus[col.key].map((task, idx) => (
                    <Draggable draggableId={task.id.toString()} index={idx} key={task.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-4 p-4 rounded-xl shadow border-l-4 transition bg-zinc-900
                          ${
                            (task.priority ?? "").toLowerCase() === "high"
                              ? "border-red-600"
                              : (task.priority ?? "").toLowerCase() === "medium"
                              ? "border-yellow-400"
                              : "border-green-700"
                          }
                          ${snapshot.isDragging ? "bg-blue-900 shadow-xl" : ""}`}
                        >
                          <div className="flex justify-between items-center">
                            <div
                              className="font-bold text-white cursor-pointer hover:underline"
                              title={task.description}
                              onClick={() => onViewTask(task)}
                            >
                              {task.title}
                            </div>
                            <button
                              className="text-xs bg-blue-700 hover:bg-blue-500 text-white px-2 py-1 rounded ml-2"
                              onClick={() => onViewTask(task)}
                            >
                              View
                            </button>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="flex gap-2 items-center">
                              <PriorityBadge priority={task.priority}/>
                              <StatusBadge status={task.status}/>
                            </span>
                            {task.assigned_to && (
                              <span className="inline-block bg-blue-900 text-blue-100 px-2 rounded">
                                {getAssignee(task)}
                              </span>
                            )}
                            {task.due_date && (
                              <span className="inline-block bg-zinc-800 text-gray-300 px-2 rounded">
                                {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
}
