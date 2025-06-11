// frontend/src/components/Sidebar.tsx

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Folder, Users, ListTodo, User, Clock } from "lucide-react";
import { useUI } from "./UIProvider";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: Folder },
  { label: "Tasks", href: "/dashboard/tasks", icon: ListTodo },
  { label: "Teams", href: "/dashboard/teams", icon: Users },
  { label: "Time Tracking", href: "/dashboard/time-tracking", icon: Clock },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

/**
 * Sidebar component for main navigation, without TimeTrackingCard.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUI();

  const NavLinks = () => (
    <ul className="space-y-2">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-label={item.label}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
                active
                  ? "bg-blue-700 text-white shadow"
                  : "text-gray-300 hover:bg-zinc-800 hover:text-white"
              }`}
              tabIndex={0}
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  toggleSidebar();
                }
              }}
            >
              <item.icon className="w-5 h-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const SidebarFooter = () => (
    <div className="mt-10 px-3 text-xs text-zinc-500">{/* Placeholder for future extensions */}</div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:justify-between md:w-56 md:h-screen bg-zinc-900 shadow-lg py-6 px-3">
        <nav className="flex-1" aria-label="Main Navigation">
          <NavLinks />
        </nav>
        <SidebarFooter />
      </aside>
      {/* Mobile Sidebar etc. */}
    </>
  );
}



