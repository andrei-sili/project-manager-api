// // Path: frontend/src/components/ProtectedRoute.tsx
// "use client";
//
// import React from "react";
// import { useAuth } from "@/components/AuthProvider";
// import { useRouter } from "next/navigation";
//
// interface Props {
//   children: React.ReactNode;
// }
//
// export default function ProtectedRoute({ children }: Props) {
//   const { isAuthenticated, loading } = useAuth();
//   const router = useRouter();
//
//
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
//       </div>
//     );
//   }
//
//
//   if (!isAuthenticated) {
//     router.replace("/login");
//     return null;
//   }
//
//
//   return <>{children}</>;
// }
// Path: frontend/src/components/ProtectedRoute.tsx
// frontend/src/components/ProtectedRoute.tsx
"use client";
import React, { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

