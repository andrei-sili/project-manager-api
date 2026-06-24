"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { getNotifications, getUnreadNotificationCount, markAllNotificationsRead } from "@/lib/api";
import { refreshAccessToken } from "@/lib/token";
import type { NotificationItem } from "@/lib/types";

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Derive the WebSocket URL from the REST API URL (http(s)://host/api -> ws(s)://host/ws/...). */
function notificationsWsUrl(token: string) {
  const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const base = api.replace(/\/api\/?$/, "").replace(/^http/, "ws");
  return `${base}/ws/notifications/?token=${encodeURIComponent(token)}`;
}

/** Bell with an unread badge and a live WebSocket feed of notifications. */
export default function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      // The list is page 1 (most recent); the unread badge uses a full count so
      // it stays correct even with more than one page of notifications.
      const [data, count] = await Promise.all([getNotifications(), getUnreadNotificationCount()]);
      setItems(data);
      setUnread(count);
    } catch {
      /* ignore — keep current state */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Live notifications over WebSocket, with simple auto-reconnect.
  useEffect(() => {
    let stopped = false;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let ws: WebSocket | null = null;

    function connect() {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      if (!token) return;
      ws = new WebSocket(notificationsWsUrl(token));
      ws.onmessage = () => {
        setUnread((c) => c + 1); // instant feedback
        setTimeout(refresh, 700); // the DB row is written right after the push
      };
      ws.onclose = () => {
        if (stopped) return;
        // The token may have expired (15 min); refresh it before reconnecting so
        // the live feed recovers instead of looping forever with a stale token.
        reconnectTimer = setTimeout(async () => {
          try {
            await refreshAccessToken();
          } catch {
            /* refresh failed (logged out / expired) — connect() will no-op */
          }
          connect();
        }, 5000);
      };
    }
    connect();

    return () => {
      stopped = true;
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [refresh]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function toggleAndMarkRead() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      // Mark everything read server-side (not just the visible page).
      await markAllNotificationsRead().catch(() => {});
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggleAndMarkRead}
        className="relative rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-zinc-950">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/40">
          <div className="border-b border-zinc-800 px-4 py-3 text-sm font-semibold text-white">
            Notifications
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-zinc-400">No notifications yet.</p>
            ) : (
              items.map((n) => (
                <div key={n.id} className="flex gap-3 border-b border-zinc-800/50 px-4 py-3 last:border-0">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      n.is_read ? "bg-zinc-700" : "bg-emerald-400"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-200">{n.message}</p>
                    <p className="text-xs text-zinc-400">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
