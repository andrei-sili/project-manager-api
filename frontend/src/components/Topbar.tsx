// src/components/Topbar.tsx
"use client";
import { useAuth } from "./AuthProvider";

// Simple topbar with user info and logout button
export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-zinc-900 shadow-md">
      <span className="text-xl font-bold tracking-tight">Project Manager</span>
      <div className="flex items-center gap-4">
        {user && (
          <div className="text-right">
            <div className="text-sm text-gray-100 font-semibold">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-xs text-gray-400">{user.email}</div>
          </div>
        )}
        <button
          onClick={logout}
          className="ml-4 px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700 font-semibold transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

