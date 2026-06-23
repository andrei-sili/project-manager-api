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
  Calendar,
  BarChart3,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";
import { useUI } from "@/components/UIProvider";
import { useAuth } from "@/lib/useAuth";

interface NavItem {
  label: string;
  href: string;
  Icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", Icon: Folder },
  { label: "Tasks", href: "/dashboard/tasks", Icon: List },
  { label: "Teams", href: "/dashboard/teams", Icon: Users },
  { label: "Time Tracking", href: "/dashboard/time-tracking", Icon: Clock },
  { label: "Calendar", href: "/dashboard/calendar", Icon: Calendar },
  { label: "Reports", href: "/dashboard/reports", Icon: BarChart3 },
  { label: "Profile", href: "/dashboard/profile", Icon: UserIcon },
];

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "U";
}

/**
 * App sidebar. Static on desktop; on mobile it slides in over an overlay,
 * toggled from the Topbar's menu button (UI context).
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUI();
  const { user } = useAuth();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-800/70 bg-zinc-950 transition-transform duration-200 ease-out md:static md:z-auto md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 shadow-lg shadow-emerald-500/20">
            <span className="h-3.5 w-3.5 rounded-[5px] bg-zinc-950" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Project<span className="text-emerald-400">Manager</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map(({ label, href, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => sidebarOpen && toggleSidebar()}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                <Icon size={18} className={active ? "text-emerald-400" : ""} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Current user */}
        {user && (
          <div className="mt-auto flex items-center gap-3 border-t border-zinc-800/70 px-4 py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-zinc-950">
              {initials(user.first_name, user.last_name)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">
                {user.first_name} {user.last_name}
              </div>
              <div className="truncate text-xs text-zinc-400">{user.email}</div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
