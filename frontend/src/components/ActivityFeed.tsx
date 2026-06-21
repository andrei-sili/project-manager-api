import React from "react";
import type { ActivityLog } from "@/lib/types";
import { stringToColor } from "@/lib/color";

function initials(name?: string, email?: string) {
  const source = (name || email || "?").trim();
  const parts = source.split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const VERB: Record<string, string> = {
  created: "created",
  updated: "updated",
  deleted: "deleted",
  commented: "commented on",
};

export default function ActivityFeed({ items }: { items: ActivityLog[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">No recent activity yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {items.map((a) => {
        const name = a.user?.full_name || a.user_email || "Someone";
        return (
          <li key={a.id} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: stringToColor(a.user?.email || name) }}
            >
              {initials(a.user?.full_name, a.user?.email)}
            </span>
            <div className="min-w-0 text-sm">
              <p className="text-zinc-300">
                <span className="font-semibold text-white">{name}</span> {VERB[a.action] ?? a.action}{" "}
                <span className="font-medium text-emerald-300">{a.target_repr}</span>
              </p>
              <p className="text-xs text-zinc-500">{timeAgo(a.timestamp)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
