// Path: frontend/src/components/Providers.tsx
"use client";

import React from "react";
import AuthProvider from "./AuthProvider";
import UIProvider from "./UIProvider";
import { useApiInterceptors } from "@/lib/useApi";

type Props = { children: React.ReactNode };

function ApiInterceptorWrapper({ children }: Props) {
  useApiInterceptors();
  return <>{children}</>;
}

export default function Providers({ children }: Props) {
  return (
    <AuthProvider>
      <ApiInterceptorWrapper>
        <UIProvider>{children}</UIProvider>
      </ApiInterceptorWrapper>
    </AuthProvider>
  );
}
