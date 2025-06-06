// frontend/src/components/ProtectedRoute.tsx

"use client";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Wrapper for protected pages/routes.
// Redirects to /login if not authenticated.
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  // While checking auth status, show loading or nothing.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Optionally, you can return null here because redirect will happen.
    return null;
  }

  // If authenticated, render the protected content.
  return <>{children}</>;
}
