"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, ChevronDown, User as UserIcon, KeyRound, LogOut } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { useUI } from "@/components/UIProvider";
import NotificationBell from "@/components/NotificationBell";

/**
 * Top bar: mobile menu button + greeting on the left, user menu on the right
 * (My Profile, Change Password, Logout).
 */
const Topbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useUI();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800/70 bg-zinc-950/80 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-white md:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="text-base font-semibold text-white">
          Hello, <span className="text-emerald-400">{user?.first_name ?? "there"}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <NotificationBell />
        <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 py-1.5 pl-1.5 pr-2.5 transition hover:border-zinc-700"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-zinc-950">
            {initials}
          </span>
          <span className="hidden max-w-[180px] truncate text-sm text-zinc-300 sm:block">
            {user?.email}
          </span>
          <ChevronDown size={16} className="text-zinc-400" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/40">
            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
            >
              <UserIcon size={16} /> My Profile
            </Link>
            <Link
              href="/dashboard/profile/change-password"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
            >
              <KeyRound size={16} /> Change Password
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 border-t border-zinc-800 px-4 py-2.5 text-left text-sm text-rose-400 transition hover:bg-zinc-800"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
