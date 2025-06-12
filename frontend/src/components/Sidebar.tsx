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

/** Sidebar navigation for desktop & mobile */
const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUI();

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Desktop & mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-zinc-900 text-white transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform md:relative md:translate-x-0 md:w-56 z-20`}
      >
        <nav className="flex flex-col p-4 space-y-2">
          {navItems.map(({ label, href, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center p-2 rounded hover:bg-zinc-800 ${
                pathname.startsWith(href) ? "bg-zinc-800" : ""
              }`}
            >
              <Icon className="mr-2" size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile toggle button */}
      <button
        className="fixed top-4 left-4 z-30 md:hidden p-2 bg-zinc-900 text-white rounded"
        onClick={toggleSidebar}
      >
        ☰
      </button>
    </>
  );
};

export default Sidebar;




