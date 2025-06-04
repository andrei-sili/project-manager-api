// src/components/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Folder, Users, ListTodo, User } from "lucide-react";

// Navigation config
const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: Folder,
  },
  {
    label: "Tasks",
    href: "/dashboard/tasks",
    icon: ListTodo,
  },
  {
    label: "Teams",
    href: "/dashboard/teams",
    icon: Users,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-56 min-w-[14rem] bg-zinc-900 shadow-lg flex flex-col justify-between py-6 px-3">
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
                    active
                      ? "bg-blue-700 text-white shadow"
                      : "text-gray-300 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="px-4 pt-6 text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Project Manager
      </div>
    </aside>
  );
}
