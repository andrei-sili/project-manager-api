// Path: frontend/src/app/dashboard/layout.tsx
"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-zinc-950 text-white">
        {/* Single instance of Sidebar */}
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Single instance of Topbar */}
          <Topbar />

          {/* Main dashboard content */}
          <main className="flex-1 overflow-auto p-6 bg-zinc-950">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
