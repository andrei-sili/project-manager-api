// frontend/src/components/Topbar.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";

interface TopbarProps {}

/**
 * Topbar with greeting on the left,
 * avatar/email on the right and a dark-themed dropdown:
 * My Profile, Change Password, Logout.
 */
const Topbar: React.FC<TopbarProps> = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
    : "U";

  return (
    <header className="flex items-center justify-between bg-zinc-800 px-6 py-4 text-white relative">
      {/* Left: greeting */}
      <div className="text-lg font-medium">
        Hello, {user?.first_name ?? "User"}
      </div>

      {/* Right: avatar + email */}
      <div className="flex items-center gap-3 cursor-pointer" ref={menuRef}>
        <div
          className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold"
          onClick={() => setOpen((o) => !o)}
        >
          {initials}
        </div>
        <span onClick={() => setOpen((o) => !o)} className="text-sm">
          {user?.email}
        </span>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-6 top-full mt-2 w-48 bg-zinc-800 text-white rounded-lg shadow-lg overflow-hidden z-30">
            <Link
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm hover:bg-zinc-700"
            >
              My Profile
            </Link>
            <Link
              href="/dashboard/profile/change-password"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm hover:bg-zinc-700"
            >
              Change Password
            </Link>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
