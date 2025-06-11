// frontend/src/components/Header.tsx

import React from "react";

/**
 * Main Header component for the app.
 * Contains app branding, user menu, notifications, and search placeholder.
 */
export function Header() {
  return (
    <header className="w-full h-16 flex items-center justify-between px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm z-10">
      {/* Branding / Logo */}
      <div className="flex items-center gap-2">
        {/* You can replace this text with an SVG or image logo */}
        <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
          ProjectManager
        </span>
      </div>

      {/* Header Actions (expandable for future features) */}
      <div className="flex items-center gap-4">
        {/* Search (placeholder) */}
        <input
          type="text"
          placeholder="Search..."
          className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
        />

        {/* Notifications (placeholder icon, you can replace with bell icon) */}
        <button
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          title="Notifications"
        >
          <span role="img" aria-label="notifications">
            🔔
          </span>
        </button>

        {/* User avatar & menu (placeholder) */}
        <div className="relative">
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
            title="Account"
          >
            {/* Placeholder avatar */}
            <span className="w-8 h-8 bg-zinc-400 rounded-full flex items-center justify-center text-white font-bold">
              U
            </span>
            <span className="hidden md:inline">User</span>
          </button>
          {/* Dropdown for user menu can be added here */}
        </div>
      </div>
    </header>
  );
}
