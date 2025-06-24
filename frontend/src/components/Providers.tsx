// Path: frontend/src/components/Providers.tsx
"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProvider from "./AuthProvider";
import UIProvider from "./UIProvider";
import { useApiInterceptors } from "@/lib/useApi";

type Props = { children: React.ReactNode };

function ApiInterceptorWrapper({ children }: Props) {
  useApiInterceptors();
  return <>{children}</>;
}

export default function Providers({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ApiInterceptorWrapper>
          <UIProvider>{children}</UIProvider>
        </ApiInterceptorWrapper>
      </AuthProvider>
    </QueryClientProvider>
  );
}
