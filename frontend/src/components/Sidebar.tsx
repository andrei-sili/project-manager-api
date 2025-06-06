// src/components/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Folder, Users, ListTodo, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "./UIProvider";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: Folder },
  { label: "Tasks", href: "/dashboard/tasks", icon: ListTodo },
  { label: "Teams", href: "/dashboard/teams", icon: Users },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUI();

  // Reusable list of nav links
  const NavLinks = () => (
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
              onClick={() => {
                // Close the sidebar after navigation (on mobile)
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

  return (
    <>
      {/* Desktop sidebar (permanently visible on md+ screens) */}
      <aside className="hidden md:flex md:flex-col md:justify-between md:w-56 md:h-screen bg-zinc-900 shadow-lg py-6 px-3">
        <nav className="flex-1">
          <NavLinks />
        </nav>
        <div className="px-4 pt-6 text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Project Manager
        </div>
      </aside>

      {/* Mobile sidebar drawer (slides in/out) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="mobile-sidebar"
            className="fixed inset-y-0 left-0 z-50 w-56 bg-zinc-900 shadow-lg flex flex-col justify-between py-6 px-3 md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
          >
            <nav className="flex-1">
              <NavLinks />
            </nav>
            <div className="px-4 pt-6 text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Project Manager
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="mobile-backdrop"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}  /* clicking backdrop closes the sidebar */
          />
        )}
      </AnimatePresence>
    </>
  );
}
