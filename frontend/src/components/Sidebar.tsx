"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard",   href: "/dashboard" },
  { label: "Projects",    href: "/dashboard/projects" },
  { label: "Teams",       href: "/dashboard/teams" },
  { label: "Tasks",       href: "/dashboard/tasks" },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <nav className="w-60 bg-gray-800 min-h-screen p-4">
      <h2 className="text-xl font-bold text-white mb-6">ProjectManager</h2>
      <ul className="space-y-2">
        {navItems.map((item) => {
          const isActive = path === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-3 py-2 rounded text-white hover:bg-gray-700 transition ${
                  isActive ? "bg-gray-700 font-semibold" : ""
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
