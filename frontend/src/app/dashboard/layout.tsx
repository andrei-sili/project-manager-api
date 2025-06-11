// frontend/src/app/dashboard/layout.tsx

"use client";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-zinc-950">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 px-6 py-8 bg-zinc-950 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

