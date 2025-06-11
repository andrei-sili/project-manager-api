// src/components/DashboardLayout.tsx
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="p-6 bg-zinc-950 text-white overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
