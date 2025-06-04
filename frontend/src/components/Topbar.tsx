// src/components/Topbar.tsx
"use client";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-zinc-900 shadow-md">
      <span className="text-xl font-bold tracking-tight">Project Manager</span>
      <div className="flex items-center gap-4 relative">
        {user && (
          <>
            <button
              className="flex items-center gap-2 focus:outline-none"
              onClick={() => setOpen((v) => !v)}
              aria-label="User menu"
            >
              <div className="text-right mr-2 hidden md:block">
                <div className="text-sm text-gray-100 font-semibold">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-xs text-gray-400">{user.email}</div>
              </div>
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-700 text-white font-bold uppercase text-lg">
                {user.first_name?.[0]}
              </span>
              <svg
                className={`w-4 h-4 ml-1 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {open && (
              <div
                ref={dropdownRef}
                className="absolute right-0 top-14 mt-1 min-w-[170px] bg-zinc-800 border border-zinc-700 rounded shadow-lg py-2 z-50"
              >
                <button
                  className="w-full text-left px-4 py-2 text-gray-200 hover:bg-zinc-700 transition"
                  onClick={() => {
                    setOpen(false);
                    router.push("/dashboard/profile");
                  }}
                >
                  Profile
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-gray-200 hover:bg-zinc-700 transition"
                  onClick={() => {
                    setOpen(false);
                    router.push("/dashboard/profile/change-password");
                  }}
                >
                  Change password
                </button>
                <hr className="my-1 border-zinc-700" />
                <button
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-900 transition"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}

