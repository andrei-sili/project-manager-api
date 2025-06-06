// src/components/Topbar.tsx
"use client";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useUI } from "./UIProvider";
import { Menu, X } from "lucide-react";

export default function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useUI();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [dropdownOpen]);

  return (
    <header className="sticky top-0 w-full flex items-center justify-between px-6 py-4 bg-zinc-900 shadow-md z-20">
      {/* Left side: Sidebar toggle (hamburger) + branding */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-3 md:hidden text-gray-100 focus:outline-none"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <span className="text-xl font-bold tracking-tight">Project Manager</span>
      </div>

      {/* Right side: User profile dropdown */}
      <div className="flex items-center gap-4 relative">
        {user && (
          <>
            <button
              className="flex items-center gap-2 focus:outline-none"
              onClick={() => setDropdownOpen((open) => !open)}
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
                className={`w-4 h-4 ml-1 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {dropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 top-14 mt-1 min-w-[170px] bg-zinc-800 border border-zinc-700 rounded shadow-lg py-2 z-50"
              >
                <button
                  className="w-full text-left px-4 py-2 text-gray-200 hover:bg-zinc-700 transition"
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/dashboard/profile");
                  }}
                >
                  Profile
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-gray-200 hover:bg-zinc-700 transition"
                  onClick={() => {
                    setDropdownOpen(false);
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
