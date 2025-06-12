// frontend/src/app/dashboard/layout.tsx

"use client";

import React, { ReactNode } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/components/DashboardShell";

interface LayoutProps {
  children: ReactNode;
}

/** Layout wrapper for all /dashboard routes */
export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
