// src/components/ProtectedRoute.tsx
"use client";
import React from "react";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";

// Checks if user is authenticated, otherwise redirects to /login
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        <span className="animate-pulse">Loading...</span>
      </div>
    );
  }

  return <>{isAuthenticated ? children : null}</>;
}
