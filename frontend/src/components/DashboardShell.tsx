//  frontend/src/components/DashboardShell.tsx
"use client";

import React, { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

interface DashboardShellProps {
  children: ReactNode;
}

/** Main shell for protected dashboard pages */
const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardShell;
