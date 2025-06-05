// frontend/src/components/KanbanBoard.tsx

import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DroppableStateSnapshot,
} from "@hello-pangea/dnd";

interface TeamMember {
  id: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: "todo" | "in_progress" | "done";
  due_date?: string;
  assigned_to?: string;
  assigned_to_email?: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  onTaskEdit: (task: Task) => void;
  onStatusChange: (taskId: number, newStatus: Task["status"]) => void;
  onAddTask: () => void;
}

const statusColumns = [
  { key: "todo", label: "To Do", color: "bg-zinc-700" },
  { key: "in_progress", label: "In Progress", color: "bg-yellow-800" },
  { key: "done", label: "Done", color: "bg-green-800" },
] as const;

export default function KanbanBoard({
  tasks,
  teamMembers,
  onTaskEdit,
  onStatusChange,
  onAddTask,
}: KanbanBoardProps) {
  // Group tasks by status
  const tasksByStatus: Record<string, Task[]> = {
    todo: [],
    in_progress: [],
    done: [],
  };
  tasks.forEach((t) => tasksByStatus[t.status].push(t));

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId !== destination.droppableId) {
      // Call the parent callback to update status in backend
      onStatusChange(Number(draggableId), destination.droppableId as Task["status"]);
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="flex gap-6 min-w-[900px]">
        <DragDropContext onDragEnd={onDragEnd}>
          {statusColumns.map((col) => (
            <Droppable droppableId={col.key} key={col.key}>
              {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="...."
                  style={{
                    background: snapshot.isDraggingOver ? "#3b82f6" : undefined,
                    transition: "background 0.2s",
                  }}
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
                          className={`mb-4 p-4 rounded-xl bg-zinc-900 shadow border-l-4 border-blue-600 transition
                          ${snapshot.isDragging ? "bg-blue-200" : ""}`}
                        >
                          <div className="flex justify-between items-center">
                            <div
                              className="font-bold text-white cursor-pointer hover:underline"
                              title={task.description}
                              onClick={() => onTaskEdit(task)}
                            >
                              {task.title}
                            </div>
                            <button
                              className="text-xs bg-blue-700 hover:bg-blue-500 text-white px-2 py-1 rounded ml-2"
                              onClick={() => onTaskEdit(task)}
                            >
                              Edit
                            </button>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span
                              className={`inline-block rounded px-2 py-1 font-semibold ${
                                task.priority === "high"
                                  ? "bg-red-700 text-white"
                                  : task.priority === "medium"
                                  ? "bg-yellow-700 text-white"
                                  : "bg-zinc-700 text-gray-200"
                              }`}
                            >
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                            {task.assigned_to_email && (
                              <span className="inline-block bg-blue-900 text-blue-100 px-2 rounded">
                                {task.assigned_to_email}
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
