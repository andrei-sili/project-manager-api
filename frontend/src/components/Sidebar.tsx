// frontend/src/components/Sidebar.tsx

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Folder,
  List,
  Users,
  Clock,
  User as UserIcon,
  Box,
} from "lucide-react";
import { useUI } from "@/components/UIProvider";

interface NavItem {
  label: string;
  href: string;
  Icon: React.ComponentType<any>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", Icon: Folder },
  { label: "Tasks", href: "/dashboard/tasks", Icon: List },
  { label: "Teams", href: "/dashboard/teams", Icon: Users },
  { label: "Time Tracking", href: "/dashboard/time-tracking", Icon: Clock },
  { label: "Profile", href: "/dashboard/profile", Icon: UserIcon },
];

/**
 * Sidebar navigation with logo/title at top,
 * mobile overlay and toggle button.
 */
const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUI();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-zinc-900 text-white transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform md:relative md:translate-x-0 md:w-60 z-20 flex flex-col`}
      >
        {/* Logo & Title */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-zinc-800">
          <Box size={28} />
          <span className="text-xl font-bold">Project Manager</span>
        </div>
        {/* Nav items */}
        <nav className="flex-1 flex flex-col p-4 space-y-2 overflow-y-auto">
          {navItems.map(({ label, href, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center p-2 rounded-lg hover:bg-zinc-800 transition ${
                pathname.startsWith(href) ? "bg-zinc-800" : ""
              }`}
            >
              <Icon className="mr-3" size={20} />
              <span className="text-sm">{label}</span>
            </Link>
          ))}
        </nav>
        {/* Mobile toggle button */}
        <button
          className="fixed top-4 left-4 z-30 md:hidden p-2 bg-zinc-900 text-white rounded-full"
          onClick={toggleSidebar}
        >
          ☰
        </button>
      </aside>
    </>
  );
};

export default Sidebar;





