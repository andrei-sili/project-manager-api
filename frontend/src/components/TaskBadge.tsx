// frontend/src/components/TaskBadge.tsx
import React from "react";

export function statusBadgeColor(status: string) {
  switch (status) {
    case "done":
      return "bg-green-600 text-white";
    case "in_progress":
      return "bg-yellow-500 text-black";
    case "todo":
      return "bg-gray-600 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

export function priorityBadgeColor(priority: string) {
  switch (priority) {
    case "high":
      return "bg-red-700 text-white";
    case "medium":
      return "bg-gray-400 text-black";
    case "low":
      return "bg-green-700 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

// Status badge
export const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-block px-2 py-1 rounded text-xs font-bold ${statusBadgeColor(
      status
    )}`}
  >
    {status.replace("_", " ").toUpperCase()}
  </span>
);

// Priority badge
export const PriorityBadge = ({ priority }: { priority: string }) => (
  <span
    className={`inline-block px-2 py-1 rounded text-xs font-bold ${priorityBadgeColor(
      priority
    )}`}
  >
    {priority?.toUpperCase()}
  </span>
);
