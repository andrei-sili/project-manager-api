// frontend/src/components/Providers.tsx
"use client";

import React from "react";
import AuthProvider from "./AuthProvider";
import UIProvider from "./UIProvider";
import { useApiInterceptors } from "@/lib/useApi";

export default function Providers({ children }: { children: React.ReactNode }) {
  useApiInterceptors();
  return (
    <AuthProvider>
      <UIProvider>
        {children}
      </UIProvider>
    </AuthProvider>
  );
}
